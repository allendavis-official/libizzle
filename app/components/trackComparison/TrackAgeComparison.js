// components/trackComparison/TrackAgeComparison.js

import React from "react";
import { Calendar } from "lucide-react";
import {
  calculateTrackAge,
  getAgeCategory,
  getTrackWinner,
} from "../../lib/trackComparisonUtils";

export default function TrackAgeComparison({ selectedTracks, allTracks }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-indigo-400" />
        <h4 className="font-semibold">Track Age & Release History</h4>
      </div>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${selectedTracks.length}, 1fr)`,
        }}
      >
        {selectedTracks.map((track) => {
          const trackAge = calculateTrackAge(track.release_date);
          const ageCategory = getAgeCategory(trackAge);
          const winner = getTrackWinner("newest", selectedTracks, allTracks);
          const isNewest = winner === track.track_url;

          return (
            <div
              key={track.track_url}
              className={`p-4 rounded-lg ${
                isNewest
                  ? "bg-green-500/20 border-2 border-green-500"
                  : "bg-white/5"
              }`}
            >
              <p className="text-xs text-gray-400 mb-1 truncate">
                {track.artist_name}
              </p>
              <p className="text-sm font-semibold mb-2 truncate">
                {track.track_title}
              </p>

              {trackAge && track.release_date !== "N/A" ? (
                <>
                  <p className="text-2xl font-bold mb-1">
                    {trackAge.formatted}
                  </p>

                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 mb-2 ${ageCategory.color}`}
                  >
                    {ageCategory.label}
                  </span>

                  <p className="text-xs text-gray-400 mt-2">
                    📅 Released: {track.release_date}
                  </p>

                  {trackAge.days <= 7 && (
                    <p className="text-xs text-green-400 mt-2">⭐ Brand New!</p>
                  )}

                  {isNewest && trackAge.days > 7 && (
                    <p className="text-xs text-green-400 mt-2">
                      🆕 Newest Track
                    </p>
                  )}

                  {trackAge.years >= 2 && (
                    <p className="text-xs text-orange-400 mt-2">
                      🏆 Standing the test of time
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-1">Unknown</p>
                  <p className="text-xs text-gray-500">No release date data</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Age Insights */}
      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <p className="text-sm text-gray-300">
          <strong>Age Insights:</strong>{" "}
          {selectedTracks.every(
            (t) => !t.release_date || t.release_date === "N/A"
          ) ? (
            "No release date data available for comparison"
          ) : (
            <>
              {selectedTracks.filter((t) => {
                const age = calculateTrackAge(t.release_date);
                return age && age.days <= 30;
              }).length > 0 && (
                <span>
                  New releases are still building momentum - expect growth! •{" "}
                </span>
              )}
              {selectedTracks.filter((t) => {
                const age = calculateTrackAge(t.release_date);
                return age && age.years >= 2;
              }).length > 0 && (
                <span>
                  Classic tracks with proven staying power show lasting appeal.
                  •{" "}
                </span>
              )}
              {(() => {
                const ages = selectedTracks
                  .map((t) => calculateTrackAge(t.release_date))
                  .filter((age) => age !== null);
                if (ages.length >= 2) {
                  const maxDays = Math.max(...ages.map((a) => a.days));
                  const minDays = Math.min(...ages.map((a) => a.days));
                  const ageDiff = maxDays - minDays;
                  if (ageDiff > 365) {
                    return (
                      <span>
                        Comparing tracks from different eras provides unique
                        insights into longevity vs. recent buzz.
                      </span>
                    );
                  }
                }
                return null;
              })()}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
