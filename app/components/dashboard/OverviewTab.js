// components/dashboard/OverviewTab.js - COMPLETE WITH UPDATED LABELS & SHOW ALL LINKS

import { useMemo } from "react";
import {
  Users,
  Play,
  TrendingUp,
  Music,
  Award,
  Flame,
  Heart,
  ArrowRight,
} from "lucide-react";
import { formatNumber, calculateEngagement, createSlug } from "../../lib/utils";
import TenureInsightsCard from "./TenureInsightsCard";

export default function OverviewTab({
  artists,
  tracks,
  sortedArtists,
  sortedTracks,
  growthData,
  router,
}) {
  const artistStats = useMemo(() => {
    if (artists.length === 0)
      return {
        totalArtists: 0,
        totalFollowers: "0",
        totalPlays: "0",
        totalMonthlyListeners: "0",
      };

    const totalFollowers = artists.reduce(
      (sum, a) => sum + parseInt(a.followers || 0),
      0
    );
    const totalPlays = artists.reduce(
      (sum, a) => sum + parseInt(a.total_plays || 0),
      0
    );
    const totalMonthlyListeners = artists.reduce(
      (sum, a) => sum + parseInt(a.monthly_listeners || 0),
      0
    );

    return {
      totalArtists: artists.length,
      totalFollowers: formatNumber(totalFollowers),
      totalPlays: formatNumber(totalPlays),
      totalMonthlyListeners: formatNumber(totalMonthlyListeners),
    };
  }, [artists]);

  const trackStats = useMemo(() => {
    if (tracks.length === 0)
      return { totalTracks: 0, totalPlays: "0", avgEngagement: "0" };

    const totalPlays = tracks.reduce((sum, t) => {
      const plays = parseInt(t.plays);
      return sum + (isNaN(plays) ? 0 : plays);
    }, 0);

    const avgEngagement =
      tracks.reduce((sum, t) => {
        const eng = parseFloat(t.engagement_rate);
        return sum + (isNaN(eng) ? 0 : eng);
      }, 0) / tracks.length;

    return {
      totalTracks: tracks.length,
      totalPlays: formatNumber(totalPlays),
      avgEngagement: avgEngagement.toFixed(2),
    };
  }, [tracks]);

  const topArtist = sortedArtists[0];
  const hottestTrack =
    growthData.hasGrowthData && growthData.tracks.length > 0
      ? [...growthData.tracks].sort(
          (a, b) =>
            parseFloat(b.hotness_score || 0) - parseFloat(a.hotness_score || 0)
        )[0]
      : sortedTracks[0];
  const mostEngagingTrack = sortedTracks.reduce((prev, curr) => {
    if (!prev) return curr;
    return parseFloat(curr.engagement_rate) > parseFloat(prev.engagement_rate)
      ? curr
      : prev;
  }, null);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Combined Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-300 text-xs sm:text-sm mb-1">
                Total Artists
              </p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {artistStats.totalArtists}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-300 text-xs sm:text-sm mb-1">Followers</p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {artistStats.totalFollowers}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-300 text-xs sm:text-sm mb-1">
                Total Tracks
              </p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {trackStats.totalTracks}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Music className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-gray-300 text-xs sm:text-sm mb-1">
                Track Plays
              </p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {trackStats.totalPlays}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Artist Highlights (formerly Tenure Insights) */}
      <TenureInsightsCard artists={artists} tracks={tracks} router={router} />

      {/* Highlights - Responsive Grid - UPDATED LABELS - NOW CLICKABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {topArtist && (
          <div
            onClick={() =>
              router.push(`/artists/${createSlug(topArtist.artist_name)}`)
            }
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-yellow-500/30 cursor-pointer hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold">
                Biggest Name Right Now
              </h3>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold truncate hover:text-yellow-300 transition-colors">
                {topArtist.artist_name}
              </p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                {formatNumber(topArtist.followers)} followers
              </p>
            </div>
          </div>
        )}

        {hottestTrack && (
          <div
            onClick={() =>
              router.push(`/tracks/${createSlug(hottestTrack.track_title)}`)
            }
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-orange-500/30 cursor-pointer hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold truncate">
                Vibe of the Moment
              </h3>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold truncate hover:text-orange-300 transition-colors">
                {hottestTrack.track_title}
              </p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                {growthData.hasGrowthData && hottestTrack.plays_velocity
                  ? `+${formatNumber(hottestTrack.plays_velocity)} plays/day`
                  : `${formatNumber(hottestTrack.plays)} plays`}
              </p>
            </div>
          </div>
        )}

        {mostEngagingTrack && (
          <div
            onClick={() =>
              router.push(
                `/tracks/${createSlug(mostEngagingTrack.track_title)}`
              )
            }
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-purple-500/30 sm:col-span-2 lg:col-span-1 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold">
                Got the Streets Talking
              </h3>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold truncate hover:text-purple-300 transition-colors">
                {mostEngagingTrack.track_title}
              </p>
              <p className="text-gray-300 text-xs sm:text-sm mt-1">
                {mostEngagingTrack.engagement_rate}% engagement
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Lists - Responsive Grid - ADDED SHOW ALL LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top 5 Artists */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">Top 5 Artists</h3>
            <button
              onClick={() => router.push("/?tab=artists")}
              className="flex items-center gap-1 text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <span>Show All</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {sortedArtists.slice(0, 5).map((artist, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/artists/${createSlug(artist.artist_name)}`)
                }
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {artist.artist_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {formatNumber(artist.followers)} followers
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Tracks */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-semibold">Top 5 Tracks</h3>
            <button
              onClick={() => router.push("/?tab=tracks")}
              className="flex items-center gap-1 text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors group"
            >
              <span>Show All</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {sortedTracks.slice(0, 5).map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 sm:p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/tracks/${createSlug(track.track_title)}`)
                }
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {track.track_title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {formatNumber(track.plays)} plays
                    </p>
                  </div>
                </div>
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
