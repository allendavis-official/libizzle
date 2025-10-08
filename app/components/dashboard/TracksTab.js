// components/dashboard/TracksTab.js

import { Music, Play, Heart, TrendingUp } from "lucide-react";
import { formatNumber, calculateTrackStats, createSlug } from "../../lib/utils";

export default function TracksTab({
  sortedTracks,
  totalTracks,
  trackSortBy,
  setTrackSortBy,
  trackFilterBy,
  setTrackFilterBy,
  searchTerm,
  setSearchTerm,
  router,
}) {
  const stats = calculateTrackStats(sortedTracks);

  if (totalTracks === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
        <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Track Data Yet</h3>
        <p className="text-gray-400 mb-4">
          Run the enhanced scraper to collect track-level analytics
        </p>
        <code className="text-sm bg-black/30 px-4 py-2 rounded">
          python audiomack_scraper_v5.py
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex-1 w-full lg:w-auto">
          <h2 className="text-xl font-semibold mb-2">
            All Tracks{" "}
            {sortedTracks.length !== totalTracks &&
              `(${sortedTracks.length} of ${totalTracks})`}
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by track name or artist..."
              className="w-full px-4 py-2.5 pl-11 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
            />
            <svg
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filter:</span>
            <select
              value={trackFilterBy}
              onChange={(e) => setTrackFilterBy(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="all">All Tracks</option>
              <option value="topPerformers">Top Performers</option>
              <option value="highEngagement">High Engagement</option>
              <option value="recent">Recent Releases</option>
              <option value="viral">Viral Potential</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400">Sort by:</span>
        <button
          onClick={() => setTrackSortBy("plays")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            trackSortBy === "plays"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Most Plays
        </button>
        <button
          onClick={() => setTrackSortBy("likes")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            trackSortBy === "likes"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Most Likes
        </button>
        <button
          onClick={() => setTrackSortBy("engagement")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            trackSortBy === "engagement"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Engagement
        </button>
        <button
          onClick={() => setTrackSortBy("playlist_adds")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            trackSortBy === "playlist_adds"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Playlist Adds
        </button>
        <button
          onClick={() => setTrackSortBy("recent")}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            trackSortBy === "recent"
              ? "bg-white/20 text-white"
              : "bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Newest First
        </button>
        {(trackSortBy !== "plays" || trackFilterBy !== "all") && (
          <button
            onClick={() => {
              setTrackSortBy("plays");
              setTrackFilterBy("all");
            }}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {sortedTracks.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400 mb-4">
            No tracks match the current filter
          </p>
          <button
            onClick={() => {
              setTrackFilterBy("all");
              setTrackSortBy("plays");
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            View All Tracks
          </button>
        </div>
      ) : (
        <>
          {/* Track Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-lg">
            <div>
              <p className="text-xs text-gray-400">Showing</p>
              <p className="text-lg font-bold">{sortedTracks.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Plays</p>
              <p className="text-lg font-bold">
                {formatNumber(stats.totalPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Plays</p>
              <p className="text-lg font-bold">
                {formatNumber(stats.avgPlays)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Engagement</p>
              <p className="text-lg font-bold">{stats.avgEngagement}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedTracks.map((track, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
                onClick={() =>
                  router.push(`/tracks/${createSlug(track.track_title)}`)
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white truncate hover:text-purple-400 transition-colors">
                          {track.track_title}
                        </h4>
                        <button
                          className="text-xs text-gray-400 truncate hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/artists/${createSlug(track.artist_name)}`
                            );
                          }}
                        >
                          {track.artist_name}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {formatNumber(track.plays)} plays
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(track.likes)} likes
                      </span>
                      {track.playlist_adds && track.playlist_adds !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {formatNumber(track.playlist_adds)} playlists
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        {track.engagement_rate}%
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parseFloat(track.engagement_rate || 0) > 5 && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                          🔥 High Engagement
                        </span>
                      )}
                      {track.playlist_adds &&
                        parseInt(track.playlist_adds || 0) > 100 && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                            📈 Viral Potential
                          </span>
                        )}
                      {track.release_date &&
                        track.release_date !== "N/A" &&
                        (() => {
                          try {
                            const releaseDate = new Date(track.release_date);
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            if (releaseDate >= thirtyDaysAgo) {
                              return (
                                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                                  ✨ New Release
                                </span>
                              );
                            }
                          } catch {}
                          return null;
                        })()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tracks/${createSlug(track.track_title)}`);
                      }}
                      className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-xs transition-colors whitespace-nowrap"
                    >
                      Details
                    </button>
                    <a
                      href={track.track_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors whitespace-nowrap text-center"
                    >
                      Listen
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
