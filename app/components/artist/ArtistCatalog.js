// components/artist/ArtistCatalog.js

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
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Catalog{" "}
          {sortedTracks.length !== totalTracks &&
            `(${sortedTracks.length} of ${totalTracks})`}
        </h2>

        {/* View Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">View:</span>
          <select
            value={trackView}
            onChange={(e) => setTrackView(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Tracks</option>
            <option value="topPerformers">Top Performers</option>
            <option value="underperforming">Needs Attention</option>
            <option value="recent">Recent Releases</option>
          </select>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm text-gray-400">Sort by:</span>
        {[
          { value: "plays", label: "Most Plays" },
          { value: "likes", label: "Most Likes" },
          { value: "engagement", label: "Engagement" },
          { value: "playlist_adds", label: "Playlist Adds" },
          { value: "recent", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
          { value: "title", label: "A-Z" },
        ].map((sort) => (
          <button
            key={sort.value}
            onClick={() => setTrackSortBy(sort.value)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">
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
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            View All Tracks
          </button>
        </div>
      ) : (
        <>
          {/* Track Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Showing</p>
              <p className="text-lg font-bold">{sortedTracks.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Plays</p>
              <p className="text-lg font-bold">
                {formatNumber(displayedTotalPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Plays</p>
              <p className="text-lg font-bold">
                {formatNumber(displayedAvgPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Engagement</p>
              <p className="text-lg font-bold">{displayedAvgEngagement}%</p>
            </div>
          </div>

          <div className="space-y-3">
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
                  className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all cursor-pointer"
                  onClick={() => {
                    const trackSlug = createSlug(track.track_title);
                    router.push(`/tracks/${trackSlug}`);
                  }}
                >
                  <div className="flex items-center justify-between">
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
