// components/dashboard/ArtistsTab.js

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Artist Rankings</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("followers")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              sortBy === "followers"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            By Followers
          </button>
          <button
            onClick={() => setSortBy("plays")}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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
          placeholder="Search artists by name..."
          className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
        />
        <svg
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <svg
              className="w-5 h-5"
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
        <div className="text-sm text-gray-300">
          Found {sortedArtists.length} artist
          {sortedArtists.length !== 1 ? "s" : ""} matching "{searchTerm}"
        </div>
      )}

      <div className="space-y-4">
        {sortedArtists.map((artist, index) => (
          <div
            key={artist.url}
            className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
            onClick={() =>
              router.push(`/artists/${createSlug(artist.artist_name)}`)
            }
          >
            <div className="flex items-start justify-between">
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
