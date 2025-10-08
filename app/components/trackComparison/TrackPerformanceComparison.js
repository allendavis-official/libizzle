// components/trackComparison/TrackPerformanceComparison.js

import React from "react";
import { Target, Award, TrendingUp } from "lucide-react";
import {
  formatNumber,
  calculateTrackMetrics,
  getArtistTracks,
  getTrackWinner,
} from "../../lib/trackComparisonUtils";

export default function TrackPerformanceComparison({
  selectedTracks,
  allTracks,
}) {
  return (
    <>
      {/* Catalog Performance */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold">Artist Catalog Performance</h4>
        </div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${selectedTracks.length}, 1fr)`,
          }}
        >
          {selectedTracks.map((track) => {
            const artistTracks = getArtistTracks(track.artist_name, allTracks);
            const metrics = calculateTrackMetrics(
              track,
              artistTracks,
              allTracks
            );
            const winner = getTrackWinner(
              "catalogPerformance",
              selectedTracks,
              allTracks
            );
            const isWinner = winner === track.track_url;

            return (
              <div
                key={track.track_url}
                className={`p-4 rounded-lg ${
                  isWinner
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

                {metrics ? (
                  <>
                    <p className="text-2xl font-bold mb-1">
                      {metrics.vsArtistAvg > 0 ? "+" : ""}
                      {metrics.vsArtistAvg}%
                    </p>
                    <p className="text-xs text-gray-400 mb-2">vs artist avg</p>

                    <p className="text-xs text-gray-400">
                      Rank #{metrics.catalogRank} of {metrics.totalArtistTracks}
                    </p>
                    <p className="text-xs text-gray-400">
                      Avg: {formatNumber(metrics.artistAvgPlays)} plays
                    </p>

                    {isWinner && (
                      <p className="text-xs text-green-400 mt-2">
                        👑 Best vs Catalog
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No data</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Performance */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h4 className="font-semibold">Market Position</h4>
        </div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${selectedTracks.length}, 1fr)`,
          }}
        >
          {selectedTracks.map((track) => {
            const artistTracks = getArtistTracks(track.artist_name, allTracks);
            const metrics = calculateTrackMetrics(
              track,
              artistTracks,
              allTracks
            );

            return (
              <div key={track.track_url} className="p-4 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 mb-1 truncate">
                  {track.artist_name}
                </p>
                <p className="text-sm font-semibold mb-2 truncate">
                  {track.track_title}
                </p>

                {metrics ? (
                  <>
                    <p className="text-2xl font-bold mb-1">
                      {metrics.vsMarketAvg > 0 ? "+" : ""}
                      {metrics.vsMarketAvg}%
                    </p>
                    <p className="text-xs text-gray-400 mb-2">vs market avg</p>

                    <p className="text-xs text-gray-400">
                      Market avg: {formatNumber(metrics.marketAvgPlays)} plays
                    </p>

                    {metrics.vsMarketAvg > 100 && (
                      <p className="text-xs text-orange-400 mt-2">
                        🔥 Viral Hit!
                      </p>
                    )}
                    {metrics.vsMarketAvg > 50 && metrics.vsMarketAvg <= 100 && (
                      <p className="text-xs text-green-400 mt-2">
                        ✅ Strong Performer
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">No data</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Momentum Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-400" />
          <h4 className="font-semibold">Daily Momentum</h4>
          <span className="text-xs text-gray-400">(Plays per day)</span>
        </div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${selectedTracks.length}, 1fr)`,
          }}
        >
          {selectedTracks.map((track) => {
            const artistTracks = getArtistTracks(track.artist_name, allTracks);
            const metrics = calculateTrackMetrics(
              track,
              artistTracks,
              allTracks
            );

            return (
              <div key={track.track_url} className="p-4 rounded-lg bg-white/5">
                <p className="text-xs text-gray-400 mb-1 truncate">
                  {track.artist_name}
                </p>
                <p className="text-sm font-semibold mb-2 truncate">
                  {track.track_title}
                </p>

                {metrics && metrics.trackAge ? (
                  <>
                    <p className="text-2xl font-bold mb-1">
                      {formatNumber(metrics.playsPerDay)}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">plays/day</p>

                    <p className="text-xs text-gray-400">
                      Over {metrics.trackAge.formatted}
                    </p>

                    {metrics.playsPerDay > 1000 && (
                      <p className="text-xs text-green-400 mt-2">
                        🚀 High Velocity
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-1">N/A</p>
                    <p className="text-xs text-gray-500">No release date</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
