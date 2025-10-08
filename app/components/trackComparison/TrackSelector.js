// components/trackComparison/TrackSelector.js

import React from "react";
import { X } from "lucide-react";
import { formatNumber } from "../../lib/trackComparisonUtils";

export default function TrackSelector({
  selectedTracks,
  setSelectedTracks,
  searchTerm,
  setSearchTerm,
  filteredTracks,
  maxTracks = 3,
}) {
  const addTrack = (track) => {
    if (
      selectedTracks.length < maxTracks &&
      !selectedTracks.find((t) => t.track_url === track.track_url)
    ) {
      setSelectedTracks([...selectedTracks, track]);
      setSearchTerm("");
    }
  };

  const removeTrack = (trackUrl) => {
    setSelectedTracks(selectedTracks.filter((t) => t.track_url !== trackUrl));
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold mb-4">
        Select Tracks to Compare (up to {maxTracks})
      </h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tracks by title or artist..."
          className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
          disabled={selectedTracks.length >= maxTracks}
        />
      </div>

      {/* Search Results */}
      {searchTerm && filteredTracks.length > 0 && (
        <div className="mb-4 max-h-64 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
          {filteredTracks.slice(0, 8).map((track) => {
            const isSelected = selectedTracks.find(
              (t) => t.track_url === track.track_url
            );
            return (
              <button
                key={track.track_url}
                onClick={() => addTrack(track)}
                disabled={isSelected}
                className="w-full px-4 py-3 text-left hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {track.track_title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {track.artist_name} • {formatNumber(track.plays)} plays
                    </p>
                  </div>
                  {isSelected && (
                    <span className="ml-2 text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {searchTerm && filteredTracks.length === 0 && (
        <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            No tracks found matching &quot;{searchTerm}&quot;
          </p>
        </div>
      )}

      {/* Selected Tracks */}
      <div className="flex flex-wrap gap-3">
        {selectedTracks.map((track) => (
          <div
            key={track.track_url}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30 max-w-full"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">
                {track.track_title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {track.artist_name}
              </p>
            </div>
            <button
              onClick={() => removeTrack(track.track_url)}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {selectedTracks.length === 0 && (
        <p className="text-gray-400 text-sm mt-4">
          Search and select tracks from the list above to compare them
        </p>
      )}
    </div>
  );
}
