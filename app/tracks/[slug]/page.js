// app/tracks/[slug]/page.js - WITH COLLAPSIBLE SECTIONS & TRACK AGE

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Heart,
  Share2,
  Music,
  ExternalLink,
  Calendar,
  TrendingUp,
  Award,
  Target,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const formatNumber = (num) => {
  const n = parseInt(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const calculateTrackAge = (releaseDate) => {
  if (!releaseDate || releaseDate === "N/A") return null;

  try {
    const release = new Date(releaseDate);
    const now = new Date();
    const diffTime = Math.abs(now - release);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    let formatted = "";
    if (diffYears > 0) {
      formatted = `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    } else if (diffMonths > 0) {
      formatted = `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else if (diffDays > 7) {
      const weeks = Math.floor(diffDays / 7);
      formatted = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diffDays > 0) {
      formatted = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      formatted = "Today";
    }

    return { formatted, days: diffDays };
  } catch {
    return null;
  }
};

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [track, setTrack] = useState(null);
  const [artist, setArtist] = useState(null);
  const [allTracks, setAllTracks] = useState([]);
  const [artistTracks, setArtistTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapsible states
  const [isTrackInfoExpanded, setIsTrackInfoExpanded] = useState(false);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);

  const trackSlug = params.slug;

  useEffect(() => {
    fetchTrackData();
  }, [trackSlug]);

  const fetchTrackData = async () => {
    try {
      const trackResponse = await fetch("/api/tracks");
      const trackResult = await trackResponse.json();

      const artistResponse = await fetch("/api/data");
      const artistResult = await artistResponse.json();

      if (trackResult.tracks && artistResult.data) {
        setAllTracks(trackResult.tracks);

        const trackTitle = decodeURIComponent(trackSlug).replace(/-/g, " ");
        const foundTrack = trackResult.tracks.find(
          (t) =>
            t.track_title.toLowerCase() === trackTitle.toLowerCase() ||
            t.track_title.toLowerCase().replace(/\s+/g, "-") ===
              trackSlug.toLowerCase()
        );

        if (foundTrack) {
          setTrack(foundTrack);

          const foundArtist = artistResult.data.find(
            (a) => a.artist_name === foundTrack.artist_name
          );
          setArtist(foundArtist);

          const otherTracks = trackResult.tracks.filter(
            (t) => t.artist_name === foundTrack.artist_name
          );
          setArtistTracks(otherTracks);
        }
      }
    } catch (error) {
      console.error("Error fetching track data:", error);
    } finally {
      setLoading(false);
    }
  };

  const insights = useMemo(() => {
    if (!track || !artistTracks.length) return null;

    const trackPlays = parseInt(track.plays || 0);
    const trackLikes = parseInt(track.likes || 0);
    const trackReposts = parseInt(track.reposts || 0);

    const avgArtistPlays =
      artistTracks.reduce((sum, t) => sum + parseInt(t.plays || 0), 0) /
      artistTracks.length;

    const avgMarketPlays =
      allTracks.reduce((sum, t) => sum + parseInt(t.plays || 0), 0) /
      allTracks.length;

    const sortedArtistTracks = [...artistTracks].sort(
      (a, b) => parseInt(b.plays || 0) - parseInt(a.plays || 0)
    );
    const rankInCatalog =
      sortedArtistTracks.findIndex((t) => t.track_url === track.track_url) + 1;

    const vsArtistAvg = ((trackPlays - avgArtistPlays) / avgArtistPlays) * 100;
    const vsMarketAvg = ((trackPlays - avgMarketPlays) / avgMarketPlays) * 100;

    const engagementScore =
      trackPlays > 0 ? ((trackLikes + trackReposts) / trackPlays) * 100 : 0;

    return {
      avgArtistPlays: Math.round(avgArtistPlays),
      avgMarketPlays: Math.round(avgMarketPlays),
      rankInCatalog,
      totalArtistTracks: artistTracks.length,
      vsArtistAvg: Math.round(vsArtistAvg),
      vsMarketAvg: Math.round(vsMarketAvg),
      engagementScore: engagementScore.toFixed(2),
      isTopPerformer: trackPlays > avgArtistPlays * 1.5,
    };
  }, [track, artistTracks, allTracks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <Music className="w-10 h-10 sm:w-12 sm:h-12 animate-pulse mx-auto mb-4" />
          <p className="text-lg sm:text-xl">Loading track data...</p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Track Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4">
            Could not find track: {trackSlug}
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

  const trackAge = calculateTrackAge(track.release_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header with Track Age */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Mobile Layout */}
          <div className="flex flex-col sm:hidden gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold truncate">
                  {track.track_title}
                </h1>
                <button
                  onClick={() => {
                    const artistSlug = encodeURIComponent(
                      artist?.artist_name?.toLowerCase().replace(/\s+/g, "-") ||
                        ""
                    );
                    router.push(`/artists/${artistSlug}`);
                  }}
                  className="text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  {track.artist_name}
                </button>
                {/* Track Age */}
                {trackAge && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    Released {trackAge.formatted}
                  </p>
                )}
              </div>
            </div>
            <a
              href={track.track_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
            >
              Listen on Audiomack
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{track.track_title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => {
                      const artistSlug = encodeURIComponent(
                        artist?.artist_name
                          ?.toLowerCase()
                          .replace(/\s+/g, "-") || ""
                      );
                      router.push(`/artists/${artistSlug}`);
                    }}
                    className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {track.artist_name}
                  </button>
                  {/* Track Age */}
                  {trackAge && (
                    <>
                      <span className="text-gray-500">•</span>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Released {trackAge.formatted}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <a
              href={track.track_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Listen on Audiomack
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-8 sm:pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
              {formatNumber(track.plays)}
            </p>
            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-0">
              Total Plays
            </p>
            {insights && (
              <p className="text-xs text-gray-400 mt-1 sm:mt-2">
                {insights.vsArtistAvg > 0 ? "+" : ""}
                {insights.vsArtistAvg}% vs artist
              </p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
              {formatNumber(track.likes)}
            </p>
            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-0">
              Likes
            </p>
            <p className="text-xs text-gray-400 mt-1 sm:mt-2">
              {track.engagement_rate}% engagement
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
              {formatNumber(track.reposts)}
            </p>
            <p className="text-xs sm:text-sm text-gray-300">Reposts</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
              {track.playlist_adds && track.playlist_adds !== "N/A"
                ? formatNumber(track.playlist_adds)
                : "N/A"}
            </p>
            <p className="text-xs sm:text-sm text-gray-300">Playlist Adds</p>
          </div>
        </div>

        {/* Track Info and Performance Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Track Information - COLLAPSIBLE */}
          <div className="md:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <button
              onClick={() => setIsTrackInfoExpanded(!isTrackInfoExpanded)}
              className="w-full flex items-center justify-between mb-3 sm:mb-4 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-lg sm:text-xl font-bold">
                Track Information
              </h2>
              {isTrackInfoExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {/* Always show first 2 items */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-xs sm:text-sm text-gray-400">Artist</span>
                <button
                  onClick={() => {
                    const artistSlug = encodeURIComponent(
                      artist?.artist_name?.toLowerCase().replace(/\s+/g, "-") ||
                        ""
                    );
                    router.push(`/artists/${artistSlug}`);
                  }}
                  className="font-semibold text-sm sm:text-base hover:text-purple-400 transition-colors truncate max-w-[200px] sm:max-w-none text-right"
                >
                  {track.artist_name}
                </button>
              </div>

              {track.release_date && track.release_date !== "N/A" && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    Release Date
                  </span>
                  <span className="font-semibold text-sm sm:text-base">
                    {track.release_date}
                  </span>
                </div>
              )}

              {/* Collapsible items */}
              {isTrackInfoExpanded && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-xs sm:text-sm text-gray-400">
                      Engagement Rate
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-green-400">
                      {track.engagement_rate}%
                    </span>
                  </div>

                  {insights && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs sm:text-sm text-gray-400">
                        Catalog Ranking
                      </span>
                      <span className="font-semibold text-sm sm:text-base">
                        #{insights.rankInCatalog} of{" "}
                        {insights.totalArtistTracks}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Expand hint */}
            {!isTrackInfoExpanded && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Tap to see more
              </p>
            )}
          </div>

          {/* Performance Score - COLLAPSIBLE */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-purple-500/30">
            <button
              onClick={() => setIsPerformanceExpanded(!isPerformanceExpanded)}
              className="w-full flex items-center justify-between mb-3 sm:mb-4 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-lg sm:text-xl font-bold">
                Performance Score
              </h2>
              {isPerformanceExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isPerformanceExpanded ? (
              <>
                <div className="flex items-center justify-center mb-3 sm:mb-4">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <svg className="transform -rotate-90 w-24 h-24 sm:w-32 sm:h-32">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10 sm:hidden"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-white/10 hidden sm:block"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          44 *
                          (1 - parseFloat(track.engagement_rate) / 10)
                        }`}
                        className="text-purple-400 sm:hidden"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${
                          2 *
                          Math.PI *
                          56 *
                          (1 - parseFloat(track.engagement_rate) / 10)
                        }`}
                        className="text-purple-400 hidden sm:block"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-bold">
                        {track.engagement_rate}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-300">
                  {parseFloat(track.engagement_rate) > 5
                    ? "🔥 Exceptional Performance"
                    : parseFloat(track.engagement_rate) > 3
                    ? "✅ Strong Performance"
                    : parseFloat(track.engagement_rate) > 1
                    ? "📈 Good Performance"
                    : "⚡ Building Momentum"}
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl sm:text-5xl font-bold mb-2">
                  {track.engagement_rate}%
                </p>
                <p className="text-xs text-gray-400">Tap to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights - COLLAPSIBLE */}
        {insights && (
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-blue-500/30 mb-6 sm:mb-8">
            <button
              onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
              className="w-full flex items-center justify-between mb-3 sm:mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold">
                  Track Insights
                </h2>
              </div>
              {isInsightsExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {isInsightsExpanded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">
                      Artist Catalog Performance
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {insights.isTopPerformer ? (
                      <>
                        🏆 <strong>Top Performer!</strong> This is your{" "}
                        <strong>#{insights.rankInCatalog}</strong> track,
                        performing <strong>{insights.vsArtistAvg}%</strong>{" "}
                        above your average.
                      </>
                    ) : insights.vsArtistAvg > 0 ? (
                      <>
                        ✅ Performing <strong>{insights.vsArtistAvg}%</strong>{" "}
                        above your average. Ranked{" "}
                        <strong>#{insights.rankInCatalog}</strong> in your
                        catalog.
                      </>
                    ) : (
                      <>
                        📊 Ranked <strong>#{insights.rankInCatalog}</strong> of{" "}
                        {insights.totalArtistTracks}. Currently{" "}
                        <strong>{Math.abs(insights.vsArtistAvg)}%</strong> below
                        your average - consider promotion.
                      </>
                    )}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">
                      Market Comparison
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {insights.vsMarketAvg > 100 ? (
                      <>
                        🚀 <strong>Viral Hit!</strong> Performing{" "}
                        <strong>{insights.vsMarketAvg}%</strong> above market
                        average. This is exceptional!
                      </>
                    ) : insights.vsMarketAvg > 50 ? (
                      <>
                        🔥 <strong>Hot Track!</strong>{" "}
                        <strong>{insights.vsMarketAvg}%</strong> above market
                        average. Strong commercial performance.
                      </>
                    ) : insights.vsMarketAvg > 0 ? (
                      <>
                        ✅ Above market average by{" "}
                        <strong>{insights.vsMarketAvg}%</strong>. Solid
                        performance.
                      </>
                    ) : (
                      <>
                        📈 Currently{" "}
                        <strong>{Math.abs(insights.vsMarketAvg)}%</strong> below
                        market average. Opportunity for growth with right
                        promotion.
                      </>
                    )}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">
                      Engagement Analysis
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {parseFloat(insights.engagementScore) > 5 ? (
                      <>
                        💎 <strong>Exceptional engagement</strong> at{" "}
                        {insights.engagementScore}%. Fans are highly interactive
                        with this track.
                      </>
                    ) : parseFloat(insights.engagementScore) > 3 ? (
                      <>
                        ✅ <strong>Strong engagement</strong> at{" "}
                        {insights.engagementScore}%. Good fan response.
                      </>
                    ) : parseFloat(insights.engagementScore) > 1 ? (
                      <>
                        📊 Moderate engagement at {insights.engagementScore}%.
                        Consider fan activation campaigns.
                      </>
                    ) : (
                      <>
                        ⚡ Building engagement at {insights.engagementScore}%.
                        Focus on playlist features and social promotion.
                      </>
                    )}
                  </p>
                </div>

                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">
                      Recommendations
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">
                    {insights.isTopPerformer ? (
                      <>
                        🎯 Leverage this hit! Use it for playlist pitching,
                        social ads, and as intro to new releases.
                      </>
                    ) : insights.vsArtistAvg > 0 ? (
                      <>
                        📢 Good performer - consider boosting with targeted
                        promotion and playlist placements.
                      </>
                    ) : (
                      <>
                        🚀 Underperforming - analyze what works in your top
                        tracks and apply those elements here.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-300 text-sm">
                  Tap to see detailed insights about this track
                </p>
              </div>
            )}
          </div>
        )}

        {/* More Tracks from Artist */}
        {artistTracks.length > 1 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold">
                More from {track.artist_name}
              </h2>
              <button
                onClick={() => {
                  const artistSlug = encodeURIComponent(
                    artist?.artist_name?.toLowerCase().replace(/\s+/g, "-") ||
                      ""
                  );
                  router.push(`/artists/${artistSlug}`);
                }}
                className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors whitespace-nowrap"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
              {artistTracks
                .filter((t) => t.track_url !== track.track_url)
                .sort((a, b) => parseInt(b.plays || 0) - parseInt(a.plays || 0))
                .slice(0, 4)
                .map((otherTrack) => (
                  <div
                    key={otherTrack.track_url}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 sm:p-4 transition-all cursor-pointer"
                    onClick={() => {
                      const slug = encodeURIComponent(
                        otherTrack.track_title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                      );
                      router.push(`/tracks/${slug}`);
                    }}
                  >
                    <h3 className="font-semibold text-sm sm:text-base text-white truncate mb-2">
                      {otherTrack.track_title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {formatNumber(otherTrack.plays)}
                      </span>
                      <span>{otherTrack.engagement_rate}% eng.</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
