// app/artists/[slug]/page.js - MOBILE RESPONSIVE

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Music, ArrowLeft } from "lucide-react";

// Components
import ArtistHeader from "../../components/artist/ArtistHeader";
import ArtistStats from "../../components/artist/ArtistStats";
import ArtistInsightsPanel from "../../components/artist/ArtistInsightsPanel";
import ArtistCatalog from "../../components/artist/ArtistCatalog";

// Utils
import {
  calculateArtistInsights,
  sortAndFilterTracks,
} from "../../lib/artistPageUtils";

export default function ArtistDetailPage() {
  const params = useParams();
  const router = useRouter();

  // State
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackSortBy, setTrackSortBy] = useState("plays");
  const [trackView, setTrackView] = useState("all");

  const artistSlug = params.slug;

  // Fetch data
  useEffect(() => {
    fetchArtistData();
  }, [artistSlug]);

  const fetchArtistData = async () => {
    try {
      // Fetch all artists
      const artistResponse = await fetch("/api/data");
      const artistResult = await artistResponse.json();

      // Fetch all tracks
      const trackResponse = await fetch("/api/tracks");
      const trackResult = await trackResponse.json();

      if (artistResult.data && trackResult.tracks) {
        setAllArtists(artistResult.data);

        // Find artist by slug
        const artistName = decodeURIComponent(artistSlug).replace(/-/g, " ");
        const foundArtist = artistResult.data.find(
          (a) =>
            a.artist_name.toLowerCase() === artistName.toLowerCase() ||
            a.artist_name.toLowerCase().replace(/\s+/g, "-") ===
              artistSlug.toLowerCase()
        );

        if (foundArtist) {
          setArtist(foundArtist);

          // Get tracks for this artist
          const artistTracks = trackResult.tracks.filter(
            (t) => t.artist_name === foundArtist.artist_name
          );
          setTracks(artistTracks);
        }
      }
    } catch (error) {
      console.error("Error fetching artist data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate insights
  const insights = useMemo(() => {
    return calculateArtistInsights(artist, tracks, allArtists);
  }, [artist, tracks, allArtists]);

  // Sorted and filtered tracks
  const sortedTracks = useMemo(() => {
    if (!tracks.length || !insights) return [];
    return sortAndFilterTracks(
      tracks,
      trackSortBy,
      trackView,
      insights.avgTrackPlays
    );
  }, [tracks, trackSortBy, trackView, insights]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <Music className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse mx-auto mb-4" />
          <p className="text-lg sm:text-xl">Loading artist data...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Artist Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Could not find artist: {artistSlug}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <ArtistHeader artist={artist} onBack={() => router.push("/")} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-8 sm:pb-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Key Metrics */}
          <ArtistStats artist={artist} tracks={tracks} insights={insights} />

          {/* Insights Panel */}
          <ArtistInsightsPanel artist={artist} insights={insights} />

          {/* All Tracks */}
          <ArtistCatalog
            sortedTracks={sortedTracks}
            totalTracks={tracks.length}
            trackSortBy={trackSortBy}
            setTrackSortBy={setTrackSortBy}
            trackView={trackView}
            setTrackView={setTrackView}
            insights={insights}
            router={router}
          />
        </div>
      </main>
    </div>
  );
}
