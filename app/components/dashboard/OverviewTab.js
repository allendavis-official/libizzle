// components/dashboard/OverviewTab.js

import { useMemo } from "react";
import {
  Users,
  Play,
  TrendingUp,
  Music,
  Award,
  Flame,
  Heart,
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
    <div className="space-y-8">
      {/* Combined Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Artists</p>
              <p className="text-3xl font-bold mt-1">
                {artistStats.totalArtists}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Followers</p>
              <p className="text-3xl font-bold mt-1">
                {artistStats.totalFollowers}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Tracks</p>
              <p className="text-3xl font-bold mt-1">
                {trackStats.totalTracks}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Track Plays</p>
              <p className="text-3xl font-bold mt-1">{trackStats.totalPlays}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tenure Insights */}
      <TenureInsightsCard artists={artists} tracks={tracks} router={router} />

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topArtist && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold">Top Artist</h3>
            </div>
            <div>
              <p className="text-2xl font-bold">{topArtist.artist_name}</p>
              <p className="text-gray-300 text-sm mt-1">
                {formatNumber(topArtist.followers)} followers
              </p>
            </div>
          </div>
        )}

        {hottestTrack && (
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold">
                Hottest Track{" "}
                {growthData.hasGrowthData && (
                  <span className="text-xs text-gray-400">
                    (7-day momentum)
                  </span>
                )}
              </h3>
            </div>
            <div>
              <p className="text-2xl font-bold">{hottestTrack.track_title}</p>
              <p className="text-gray-300 text-sm mt-1">
                {growthData.hasGrowthData && hottestTrack.plays_velocity
                  ? `+${formatNumber(hottestTrack.plays_velocity)} plays/day`
                  : `${formatNumber(hottestTrack.plays)} plays`}
              </p>
            </div>
          </div>
        )}

        {mostEngagingTrack && (
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold">Most Engaging</h3>
            </div>
            <div>
              <p className="text-2xl font-bold truncate">
                {mostEngagingTrack.track_title}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                {mostEngagingTrack.engagement_rate}% engagement
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Artists */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Top 5 Artists</h3>
          <div className="space-y-3">
            {sortedArtists.slice(0, 5).map((artist, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/artists/${createSlug(artist.artist_name)}`)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{artist.artist_name}</p>
                    <p className="text-xs text-gray-400">
                      {formatNumber(artist.followers)} followers
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Tracks */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">Top 5 Tracks</h3>
          <div className="space-y-3">
            {sortedTracks.slice(0, 5).map((track, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/tracks/${createSlug(track.track_title)}`)
                }
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                    #{index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">
                      {track.track_title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {formatNumber(track.plays)} plays
                    </p>
                  </div>
                </div>
                <Flame className="w-4 h-4 text-orange-400 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
