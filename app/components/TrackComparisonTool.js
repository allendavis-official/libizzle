// components/TrackComparisonTool.js

import React, { useState, useMemo } from "react";
import { Music } from "lucide-react";
import TrackSelector from "./trackComparison/TrackSelector";
import TrackMetricsComparison from "./trackComparison/TrackMetricsComparison";
import TrackPerformanceComparison from "./trackComparison/TrackPerformanceComparison";
import TrackAgeComparison from "./trackComparison/TrackAgeComparison";
import TrackComparisonSummary from "./trackComparison/TrackComparisonSummary";

const TrackComparisonTool = ({ tracks = [] }) => {
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tracks based on search
  const filteredTracks = useMemo(() => {
    if (!searchTerm) return [];
    const search = searchTerm.toLowerCase();
    return tracks.filter(
      (t) =>
        t.track_title?.toLowerCase().includes(search) ||
        t.artist_name?.toLowerCase().includes(search)
    );
  }, [tracks, searchTerm]);

  // No tracks available
  if (tracks.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
        <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Track Data</h3>
        <p className="text-gray-400">
          Run the scraper to enable track comparisons
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Track Selector */}
      <TrackSelector
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredTracks={filteredTracks}
        maxTracks={3}
      />

      {/* Comparison Results */}
      {selectedTracks.length >= 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Basic Metrics */}
            <TrackMetricsComparison
              selectedTracks={selectedTracks}
              allTracks={tracks}
            />

            {/* Performance Analysis */}
            <TrackPerformanceComparison
              selectedTracks={selectedTracks}
              allTracks={tracks}
            />

            {/* Age Comparison */}
            <TrackAgeComparison
              selectedTracks={selectedTracks}
              allTracks={tracks}
            />
          </div>

          {/* Summary */}
          <TrackComparisonSummary
            selectedTracks={selectedTracks}
            allTracks={tracks}
          />
        </div>
      )}

      {/* Single Track Selected */}
      {selectedTracks.length === 1 && (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <p className="text-gray-400">
            Select at least one more track to start comparing
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackComparisonTool;
