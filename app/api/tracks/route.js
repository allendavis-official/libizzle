// app/api/tracks/route.js - FIXED: Disable caching for dynamic data

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

// 🔧 CRITICAL: Disable all caching for dynamic data
export const dynamic = "force-dynamic";
export const revalidate = 0;

const USE_GITHUB_RAW = process.env.USE_GITHUB_RAW === "true";
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

export async function GET() {
  try {
    if (USE_GITHUB_RAW && GITHUB_REPO) {
      return await fetchFromGitHub();
    }
    return await fetchFromLocalFiles();
  } catch (error) {
    console.error("Error fetching track data:", error);
    return NextResponse.json(
      {
        error: "Failed to load track data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

async function fetchFromGitHub() {
  try {
    const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/data/`;
    const filename = "audiomack_tracks_latest.csv";
    const url = baseUrl + filename;

    console.log("Fetching tracks from GitHub:", url);

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
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const processedTracks = parsed.data.map((row) => ({
      timestamp: row.timestamp,
      artist_name: row.artist_name,
      track_title: row.track_title,
      track_url: row.track_url,
      plays: row.plays,
      likes: row.likes,
      reposts: row.reposts,
      playlist_adds: row.playlist_adds,
      release_date: row.release_date,
      engagement_rate: calculateEngagementRate(
        row.plays,
        row.likes,
        row.reposts
      ),
    }));

    return NextResponse.json(
      {
        tracks: processedTracks,
        filename: filename,
        lastUpdated: new Date().toISOString(),
        source: "github",
        totalTracks: processedTracks.length,
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

async function fetchFromLocalFiles() {
  const dataDir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dataDir)) {
    return NextResponse.json({
      tracks: [],
      message: "No data directory found.",
      source: "local",
    });
  }

  const files = fs
    .readdirSync(dataDir)
    .filter(
      (file) => file.startsWith("audiomack_tracks_") && file.endsWith(".csv")
    )
    .sort()
    .reverse();

  if (files.length === 0) {
    return NextResponse.json({
      tracks: [],
      message: "No track CSV files found.",
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

  const processedTracks = parsed.data.map((row) => ({
    timestamp: row.timestamp,
    artist_name: row.artist_name,
    track_title: row.track_title,
    track_url: row.track_url,
    plays: row.plays,
    likes: row.likes,
    reposts: row.reposts,
    playlist_adds: row.playlist_adds,
    release_date: row.release_date,
    engagement_rate: calculateEngagementRate(row.plays, row.likes, row.reposts),
  }));

  return NextResponse.json(
    {
      tracks: processedTracks,
      filename: latestFile,
      lastUpdated: fs.statSync(filePath).mtime,
      source: "local",
      totalTracks: processedTracks.length,
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

function calculateEngagementRate(plays, likes, reposts) {
  const p = parseInt(plays) || 0;
  const l = parseInt(likes) || 0;
  const r = parseInt(reposts) || 0;

  if (p === 0) return "0.00";

  const engagement = ((l + r) / p) * 100;
  return engagement.toFixed(2);
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
