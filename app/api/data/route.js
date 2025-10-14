// app/api/data/route.js - UPDATED FOR L-I-BIZZLE WITH IMAGES

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// 🔧 CRITICAL: Disable all caching for dynamic data
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Configuration: Choose your data source
const USE_GITHUB_RAW = process.env.USE_GITHUB_RAW === "true";
const GITHUB_REPO = process.env.GITHUB_REPO; // e.g., "username/liberian-pulse"
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export async function GET() {
  try {
    // OPTION 1: GitHub Raw URLs (for production on Vercel)
    if (USE_GITHUB_RAW && GITHUB_REPO) {
      return await fetchFromGitHub();
    }

    // OPTION 2: Local filesystem (for development)
    return await fetchFromLocalFiles();
  } catch (error) {
    console.error("Error fetching artist data:", error);
    return NextResponse.json(
      {
        error: "Failed to load artist data",
        message: error.message,
        suggestion: "Please check if data files exist or contact support",
      },
      { status: 500 }
    );
  }
}

// Fetch from GitHub Raw URLs
async function fetchFromGitHub() {
  try {
    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/`;

    // Try to fetch the latest file
    const filename = "audiomack_artists_latest.csv";
    const url = baseUrl + filename;

    console.log("Fetching from GitHub:", url);

    // 🔧 CRITICAL: Add cache-busting and no-cache headers
    const response = await fetch(url, {
      cache: "no-store", // Never cache
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`);
    }

    const csvText = await response.text();

    // Parse CSV
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn("CSV parsing warnings:", parsed.errors);
    }

    // Process data - NOW WITH IMAGE SUPPORT
    const processedData = parsed.data.map((row) => ({
      timestamp: row.timestamp,
      artist_name: row.artist_name,
      url: row.url,
      profile_image: row.profile_image || "N/A", // 🖼️ NEW FIELD
      followers: row.followers,
      total_plays: row.total_plays,
      monthly_listeners: row.monthly_listeners || row.total_plays,
      top_tracks_count:
        parseInt(row.top_tracks_count) || parseInt(row.tracks_found) || 0,
      member_since: row.member_since,
      top_tracks: row.top_tracks ? JSON.parse(row.top_tracks) : [],
    }));

    return NextResponse.json(
      {
        data: processedData,
        filename: filename,
        lastUpdated: new Date().toISOString(),
        source: "github",
        count: processedData.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GitHub fetch error:", error);
    throw error;
  }
}

// Fetch from local filesystem (development)
async function fetchFromLocalFiles() {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    return NextResponse.json({
      data: [],
      message: "No data directory found. Please run the scraper first.",
      source: "local",
    });
  }

  // Get all artist CSV files
  const files = fs
    .readdirSync(dataDir)
    .filter(
      (file) => file.startsWith("audiomack_artists_") && file.endsWith(".csv")
    )
    .sort()
    .reverse();

  // Fallback to old naming convention
  if (files.length === 0) {
    const oldFiles = fs
      .readdirSync(dataDir)
      .filter(
        (file) => file.startsWith("audiomack_data_") && file.endsWith(".csv")
      )
      .sort()
      .reverse();
    files.push(...oldFiles);
  }

  if (files.length === 0) {
    return NextResponse.json({
      data: [],
      message: "No artist CSV files found. Please run the scraper.",
      source: "local",
    });
  }

  const latestFile = files[0];
  const filePath = path.join(dataDir, latestFile);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  // Process data - NOW WITH IMAGE SUPPORT
  const processedData = parsed.data.map((row) => ({
    timestamp: row.timestamp,
    artist_name: row.artist_name,
    url: row.url,
    profile_image: row.profile_image || "N/A", // 🖼️ NEW FIELD
    followers: row.followers,
    total_plays: row.total_plays,
    monthly_listeners: row.monthly_listeners || row.total_plays,
    top_tracks_count:
      parseInt(row.top_tracks_count) || parseInt(row.tracks_found) || 0,
    member_since: row.member_since,
    top_tracks: row.top_tracks ? JSON.parse(row.top_tracks) : [],
  }));

  return NextResponse.json(
    {
      data: processedData,
      filename: latestFile,
      lastUpdated: fs.statSync(filePath).mtime,
      source: "local",
      count: processedData.length,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

// Health check endpoint
export async function HEAD() {
  return new Response(null, { status: 200 });
}
