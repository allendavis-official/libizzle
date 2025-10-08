import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "data");

    if (!fs.existsSync(dataDir)) {
      return NextResponse.json({
        artists: [],
        tracks: [],
        hasGrowthData: false,
        message: "No data directory found.",
      });
    }

    // Find growth-enhanced CSV files
    const artistFiles = fs
      .readdirSync(dataDir)
      .filter(
        (file) =>
          file.startsWith("audiomack_artists_with_growth_") &&
          file.endsWith(".csv")
      )
      .sort()
      .reverse();

    const trackFiles = fs
      .readdirSync(dataDir)
      .filter(
        (file) =>
          file.startsWith("audiomack_tracks_with_growth_") &&
          file.endsWith(".csv")
      )
      .sort()
      .reverse();

    let artistGrowthData = [];
    let trackGrowthData = [];

    // Load artist growth data
    if (artistFiles.length > 0) {
      const filePath = path.join(dataDir, artistFiles[0]);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      artistGrowthData = parsed.data;
    }

    // Load track growth data
    if (trackFiles.length > 0) {
      const filePath = path.join(dataDir, trackFiles[0]);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
      });
      trackGrowthData = parsed.data;
    }

    return NextResponse.json({
      artists: artistGrowthData,
      tracks: trackGrowthData,
      hasGrowthData: artistFiles.length > 0 || trackFiles.length > 0,
      artistFile: artistFiles[0] || null,
      trackFile: trackFiles[0] || null,
    });
  } catch (error) {
    console.error("Error reading growth data:", error);
    return NextResponse.json(
      {
        error: "Failed to load growth data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
