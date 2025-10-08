// app/api/tracks/route.js - Production-ready with multiple storage options

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

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

    const response = await fetch(url, {
      next: { revalidate: 3600 },
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

    return NextResponse.json({
      tracks: processedTracks,
      filename: filename,
      lastUpdated: new Date().toISOString(),
      source: "github",
      totalTracks: processedTracks.length,
    });
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

  return NextResponse.json({
    tracks: processedTracks,
    filename: latestFile,
    lastUpdated: fs.statSync(filePath).mtime,
    source: "local",
    totalTracks: processedTracks.length,
  });
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
