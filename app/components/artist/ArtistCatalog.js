// components/artist/ArtistCatalog.js - MOBILE RESPONSIVE

import {
  Play,
  Heart,
  Music,
  Calendar,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { formatNumber, createSlug } from "../../lib/utils";

export default function ArtistCatalog({
  sortedTracks,
  totalTracks,
  trackSortBy,
  setTrackSortBy,
  trackView,
  setTrackView,
  insights,
  router,
}) {
  // Calculate stats for displayed tracks
  const displayedTotalPlays = sortedTracks.reduce(
    (sum, t) => sum + parseInt(t.plays || 0),
    0
  );
  const displayedAvgPlays =
    sortedTracks.length > 0
      ? Math.round(displayedTotalPlays / sortedTracks.length)
      : 0;
  const displayedAvgEngagement =
    sortedTracks.length > 0
      ? (
          sortedTracks.reduce(
            (sum, t) => sum + parseFloat(t.engagement_rate || 0),
            0
          ) / sortedTracks.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Catalog{" "}
          {sortedTracks.length !== totalTracks &&
            `(${sortedTracks.length} of ${totalTracks})`}
        </h2>

        {/* View Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
            View:
          </span>
          <select
            value={trackView}
            onChange={(e) => setTrackView(e.target.value)}
            className="flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 border border-white/20 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Tracks</option>
            <option value="topPerformers">Top Performers</option>
            <option value="underperforming">Needs Attention</option>
            <option value="recent">Recent Releases</option>
          </select>
        </div>
      </div>

      {/* Sorting Controls - Horizontal Scroll */}
      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
        <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
          Sort by:
        </span>
        {[
          { value: "plays", label: "Plays" },
          { value: "likes", label: "Likes" },
          { value: "engagement", label: "Engagement" },
          { value: "playlist_adds", label: "Playlists" },
          { value: "recent", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "title", label: "A-Z" },
        ].map((sort) => (
          <button
            key={sort.value}
            onClick={() => setTrackSortBy(sort.value)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
              trackSortBy === sort.value
                ? "bg-purple-500/30 text-white border border-purple-500"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {sortedTracks.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Music className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-sm sm:text-base text-gray-400 mb-2">
            {trackView === "recent"
              ? "No tracks released in the last 6 months"
              : trackView === "topPerformers"
              ? "No top performers found"
              : trackView === "underperforming"
              ? "No underperforming tracks"
              : "No tracks found"}
          </p>
          <button
            onClick={() => {
              setTrackView("all");
              setTrackSortBy("plays");
            }}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs sm:text-sm transition-colors"
          >
            View All Tracks
          </button>
        </div>
      ) : (
        <>
          {/* Track Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Showing</p>
              <p className="text-base sm:text-lg font-bold">
                {sortedTracks.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Plays</p>
              <p className="text-base sm:text-lg font-bold">
                {formatNumber(displayedTotalPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Plays</p>
              <p className="text-base sm:text-lg font-bold">
                {formatNumber(displayedAvgPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Eng.</p>
              <p className="text-base sm:text-lg font-bold">
                {displayedAvgEngagement}%
              </p>
            </div>
          </div>

          {/* Tracks List */}
          <div className="space-y-2 sm:space-y-3">
            {sortedTracks.map((track, index) => {
              const isTopPerformer =
                insights &&
                parseInt(track.plays || 0) > insights.avgTrackPlays * 1.5;
              const isUnderperforming =
                insights &&
                parseInt(track.plays || 0) < insights.avgTrackPlays * 0.5;

              return (
                <div
                  key={track.track_url}
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-3 sm:p-4 transition-all cursor-pointer"
                  onClick={() => {
                    const trackSlug = createSlug(track.track_title);
                    router.push(`/tracks/${trackSlug}`);
                  }}
                >
                  {/* Mobile Layout */}
                  <div className="flex flex-col sm:hidden gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-white truncate">
                          {track.track_title}
                        </h3>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 ml-10">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {formatNumber(track.plays)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(track.likes)}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        {track.engagement_rate}%
                      </span>
                      {track.playlist_adds && track.playlist_adds !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {formatNumber(track.playlist_adds)}
                        </span>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 ml-10">
                      {isTopPerformer && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          🔥 Top Hit
                        </span>
                      )}
                      {isUnderperforming && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                          ⚡ Boost
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {track.track_title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {formatNumber(track.plays)} plays
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(track.likes)} likes
                          </span>
                          <span className="flex items-center gap-1 text-green-400">
                            <TrendingUp className="w-3 h-3" />
                            {track.engagement_rate}%
                          </span>
                          {track.playlist_adds &&
                            track.playlist_adds !== "N/A" && (
                              <span className="flex items-center gap-1">
                                <Music className="w-3 h-3" />
                                {formatNumber(track.playlist_adds)} playlists
                              </span>
                            )}
                          {track.release_date &&
                            track.release_date !== "N/A" && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {(() => {
                                  try {
                                    const release = new Date(
                                      track.release_date
                                    );
                                    const now = new Date();
                                    const diffDays = Math.ceil(
                                      (now - release) / (1000 * 60 * 60 * 24)
                                    );
                                    const diffMonths = Math.floor(
                                      diffDays / 30
                                    );
                                    const diffYears = Math.floor(
                                      diffMonths / 12
                                    );

                                    if (diffYears > 0)
                                      return `${diffYears}y ago`;
                                    if (diffMonths > 0)
                                      return `${diffMonths}mo ago`;
                                    if (diffDays > 7)
                                      return `${Math.floor(diffDays / 7)}w ago`;
                                    return diffDays <= 1
                                      ? "Today"
                                      : `${diffDays}d ago`;
                                  } catch {
                                    return track.release_date;
                                  }
                                })()}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {isTopPerformer && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full whitespace-nowrap">
                          🔥 Top Hit
                        </span>
                      )}
                      {isUnderperforming && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full whitespace-nowrap">
                          ⚡ Boost This
                        </span>
                      )}
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
