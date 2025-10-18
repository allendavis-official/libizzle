// app/page.js - FIXED: Tab switching issue

"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Music, RefreshCw } from "lucide-react";

// Components
import Header from "./components/dashboard/Header";
import NavigationTabs from "./components/dashboard/NavigationTabs";
import OverviewTab from "./components/dashboard/OverviewTab";
import ArtistsTab from "./components/dashboard/ArtistsTab";
import TracksTab from "./components/dashboard/TracksTab";
import ArtistComparisonTool from "./components/ArtistComparisonTool";
import MarketIntelligence from "./components/MarketIntelligence";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import TrackComparisonTool from "./components/TrackComparisonTool";

// Utilities
import { calculateEngagement } from "./lib/utils";

// Loading fallback component
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="text-white text-center">
        <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4" />
        <p className="text-lg sm:text-xl">Loading Liberian Pulse...</p>
      </div>
    </div>
  );
}

// Separate component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [growthData, setGrowthData] = useState({
    artists: [],
    tracks: [],
    hasGrowthData: false,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get initial tab from URL query parameter - FIXED: Initialize with overview
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("overview");

  // Search state
  const [artistSearchTerm, setArtistSearchTerm] = useState("");
  const [trackSearchTerm, setTrackSearchTerm] = useState("");

  // Sort state
  const [sortBy, setSortBy] = useState("followers");
  const [trackSortBy, setTrackSortBy] = useState("plays");
  const [trackFilterBy, setTrackFilterBy] = useState("all");

  // Update tab when URL changes - FIXED: Proper URL sync
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== "overview") {
      setActiveTab("overview");
    }
  }, [tabFromUrl, activeTab]);

  // Update URL when tab changes - FIXED: Force state update
  const handleTabChange = (newTab) => {
    // Force state update using functional update to ensure re-render
    setActiveTab((prevTab) => {
      // Always return the new tab, even if it's the same as current
      // This ensures the component re-renders
      return newTab;
    });

    const url = new URL(window.location.href);
    if (newTab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", newTab);
    }

    window.history.replaceState({}, "", url);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const artistResponse = await fetch("/api/data");
      const artistResult = await artistResponse.json();

      if (artistResult.data) {
        setArtists(artistResult.data);
        setLastUpdated(artistResult.lastUpdated);
      }

      const trackResponse = await fetch("/api/tracks");
      const trackResult = await trackResponse.json();

      if (trackResult.tracks) {
        setTracks(trackResult.tracks);
      }

      const growthResponse = await fetch("/api/growth");
      const growthResult = await growthResponse.json();

      if (growthResult.hasGrowthData) {
        setGrowthData(growthResult);
        if (growthResult.tracks.length > 0) {
          setTracks(growthResult.tracks);
        }
        if (growthResult.artists.length > 0) {
          setArtists(growthResult.artists);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sorted artists with search
  const sortedArtists = useMemo(() => {
    if (artists.length === 0) return [];

    let filtered = artists;
    if (artistSearchTerm.trim()) {
      filtered = artists.filter((a) =>
        a.artist_name.toLowerCase().includes(artistSearchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === "followers")
        return parseInt(b.followers || 0) - parseInt(a.followers || 0);
      if (sortBy === "plays")
        return parseInt(b.total_plays || 0) - parseInt(a.total_plays || 0);
      if (sortBy === "engagement") {
        const engA = calculateEngagement(a.total_plays, a.followers);
        const engB = calculateEngagement(b.total_plays, b.followers);
        return parseFloat(engB) - parseFloat(engA);
      }
      return 0;
    });
  }, [artists, sortBy, artistSearchTerm]);

  // Sorted tracks with search and filters
  const sortedTracks = useMemo(() => {
    if (tracks.length === 0) return [];

    let filtered = [...tracks];

    if (trackSearchTerm.trim()) {
      filtered = filtered.filter(
        (t) =>
          t.track_title.toLowerCase().includes(trackSearchTerm.toLowerCase()) ||
          t.artist_name.toLowerCase().includes(trackSearchTerm.toLowerCase())
      );
    }

    if (trackFilterBy === "topPerformers") {
      const sorted = [...tracks].sort(
        (a, b) => parseInt(b.plays || 0) - parseInt(a.plays || 0)
      );
      const threshold = sorted[Math.floor(tracks.length * 0.2)];
      if (threshold) {
        filtered = filtered.filter(
          (t) => parseInt(t.plays || 0) >= parseInt(threshold.plays || 0)
        );
      }
    } else if (trackFilterBy === "highEngagement") {
      filtered = filtered.filter((t) => parseFloat(t.engagement_rate || 0) > 3);
    } else if (trackFilterBy === "recent") {
      filtered = filtered.filter((t) => {
        if (!t.release_date || t.release_date === "N/A") return false;
        try {
          const releaseDate = new Date(t.release_date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return releaseDate >= sixMonthsAgo;
        } catch {
          return false;
        }
      });
    } else if (trackFilterBy === "viral") {
      filtered = filtered.filter(
        (t) =>
          t.playlist_adds &&
          t.playlist_adds !== "N/A" &&
          parseInt(t.playlist_adds || 0) > 100
      );
    }

    return filtered.sort((a, b) => {
      if (trackSortBy === "plays")
        return parseInt(b.plays || 0) - parseInt(a.plays || 0);
      if (trackSortBy === "likes")
        return parseInt(b.likes || 0) - parseInt(a.likes || 0);
      if (trackSortBy === "engagement")
        return (
          parseFloat(b.engagement_rate || 0) -
          parseFloat(a.engagement_rate || 0)
        );
      if (trackSortBy === "hotness")
        return (
          parseFloat(b.hotness_score || 0) - parseFloat(a.hotness_score || 0)
        );
      if (trackSortBy === "playlist_adds")
        return parseInt(b.playlist_adds || 0) - parseInt(a.playlist_adds || 0);
      if (trackSortBy === "recent") {
        if (
          !a.release_date ||
          a.release_date === "N/A" ||
          !b.release_date ||
          b.release_date === "N/A"
        )
          return 0;
        try {
          return new Date(b.release_date) - new Date(a.release_date);
        } catch {
          return 0;
        }
      }
      return 0;
    });
  }, [tracks, trackSortBy, trackFilterBy, trackSearchTerm]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg sm:text-xl">Loading Liberian Pulse...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (artists.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">No Data Yet</h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Add your CSV files to the /data directory to see analytics.
          </p>
          <button
            onClick={fetchData}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm sm:text-base"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <Header lastUpdated={lastUpdated} onRefresh={fetchData} />

      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        trackCount={tracks.length}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-8 sm:pb-12">
        {activeTab === "overview" && (
          <OverviewTab
            artists={artists}
            tracks={tracks}
            sortedArtists={sortedArtists}
            sortedTracks={sortedTracks}
            growthData={growthData}
            router={router}
          />
        )}

        {activeTab === "artists" && (
          <ArtistsTab
            sortedArtists={sortedArtists}
            sortBy={sortBy}
            setSortBy={setSortBy}
            searchTerm={artistSearchTerm}
            setSearchTerm={setArtistSearchTerm}
            router={router}
          />
        )}

        {activeTab === "tracks" && (
          <TracksTab
            sortedTracks={sortedTracks}
            totalTracks={tracks.length}
            trackSortBy={trackSortBy}
            setTrackSortBy={setTrackSortBy}
            trackFilterBy={trackFilterBy}
            setTrackFilterBy={setTrackFilterBy}
            searchTerm={trackSearchTerm}
            setSearchTerm={setTrackSearchTerm}
            router={router}
          />
        )}

        {activeTab === "compare" && (
          <ArtistComparisonTool artists={artists} tracks={tracks} />
        )}

        {activeTab === "comparetracks" && (
          <TrackComparisonTool tracks={tracks} />
        )}

        {activeTab === "market" && (
          <MarketIntelligence artists={artists} tracks={tracks} />
        )}

        {activeTab === "predictions" && <PredictiveAnalytics />}
      </main>
    </div>
  );
}

// Main component with Suspense boundary
export default function LiberianPulseDashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
