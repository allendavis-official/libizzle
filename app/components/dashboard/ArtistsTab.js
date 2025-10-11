// components/dashboard/ArtistsTab.js - MOBILE RESPONSIVE - COMPLETE

import { Users, Play, BarChart3 } from "lucide-react";
import { formatNumber, createSlug } from "../../lib/utils";

export default function ArtistsTab({
  sortedArtists,
  sortBy,
  setSortBy,
  searchTerm,
  setSearchTerm,
  router,
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Sort Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">Artist Rankings</h2>

        {/* Sort Buttons - Stack on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSortBy("followers")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
              sortBy === "followers"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            By Followers
          </button>
          <button
            onClick={() => setSortBy("plays")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap ${
              sortBy === "plays"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            By Plays
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search artists..."
          className="w-full px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 bg-white/5 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
        />
        <svg
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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

      {/* Search results count */}
      {searchTerm && (
        <div className="text-xs sm:text-sm text-gray-300">
          Found {sortedArtists.length} artist
          {sortedArtists.length !== 1 ? "s" : ""} matching &quot;{searchTerm}
          &quot;
        </div>
      )}

      {/* Artists List */}
      <div className="space-y-3 sm:space-y-4">
        {sortedArtists.map((artist, index) => (
          <div
            key={artist.url}
            className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
            onClick={() =>
              router.push(`/artists/${createSlug(artist.artist_name)}`)
            }
          >
            {/* Mobile Layout */}
            <div className="flex flex-col gap-3 sm:hidden">
              {/* Rank and Name */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-base font-bold flex-shrink-0">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate hover:text-purple-400 transition-colors">
                    {artist.artist_name}
                  </h3>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {formatNumber(artist.followers)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Play className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {formatNumber(artist.total_plays)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300 col-span-2">
                  <BarChart3 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {formatNumber(artist.monthly_listeners || 0)} listeners
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/artists/${createSlug(artist.artist_name)}`);
                  }}
                  className="flex-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-xs transition-colors"
                >
                  View Details
                </button>
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors text-center"
                >
                  Audiomack →
                </a>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xl font-bold">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 hover:text-purple-400 transition-colors">
                    {artist.artist_name}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{formatNumber(artist.followers)} followers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4" />
                      <span>
                        {formatNumber(artist.total_plays)} total plays
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>
                        {formatNumber(artist.monthly_listeners || 0)} monthly
                        listeners
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/artists/${createSlug(artist.artist_name)}`);
                  }}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
                <a
                  href={artist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  Audiomack →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
