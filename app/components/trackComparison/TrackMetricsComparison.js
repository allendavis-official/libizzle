// components/trackComparison/TrackMetricsComparison.js

import React from "react";
import { Play, Heart, Share2, Music, TrendingUp } from "lucide-react";
import { formatNumber, getTrackWinner } from "../../lib/trackComparisonUtils";

export default function TrackMetricsComparison({ selectedTracks, allTracks }) {
  const renderComparisonCard = (title, icon, metric, getValue, suffix = "") => {
    const winner = getTrackWinner(metric, selectedTracks, allTracks);

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h4 className="font-semibold">{title}</h4>
        </div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${selectedTracks.length}, 1fr)`,
          }}
        >
          {selectedTracks.map((track) => {
            const isWinner = winner === track.track_url;
            const isTie = winner === "TIE";
            const value = getValue(track);

            return (
              <div
                key={track.track_url}
                className={`p-4 rounded-lg ${
                  isTie
                    ? "bg-blue-500/20 border-2 border-blue-500"
                    : isWinner
                    ? "bg-green-500/20 border-2 border-green-500"
                    : "bg-white/5"
                }`}
              >
                <p className="text-xs text-gray-400 mb-1 truncate">
                  {track.artist_name}
                </p>
                <p className="text-sm font-semibold mb-1 truncate">
                  {track.track_title}
                </p>
                <p className="text-2xl font-bold">
                  {formatNumber(value)}
                  {suffix}
                </p>
                {isTie && <p className="text-xs text-blue-400 mt-1">🤝 Tied</p>}
                {isWinner && !isTie && (
                  <p className="text-xs text-green-400 mt-1">👑 Leader</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Plays Comparison */}
      {renderComparisonCard(
        "Total Plays",
        <Play className="w-5 h-5 text-purple-400" />,
        "plays",
        (track) => parseInt(track.plays || 0)
      )}

      {/* Likes Comparison */}
      {renderComparisonCard(
        "Likes",
        <Heart className="w-5 h-5 text-pink-400" />,
        "likes",
        (track) => parseInt(track.likes || 0)
      )}

      {/* Reposts Comparison */}
      {renderComparisonCard(
        "Reposts",
        <Share2 className="w-5 h-5 text-blue-400" />,
        "reposts",
        (track) => parseInt(track.reposts || 0)
      )}

      {/* Playlist Adds Comparison */}
      {renderComparisonCard(
        "Playlist Adds",
        <Music className="w-5 h-5 text-green-400" />,
        "playlist_adds",
        (track) =>
          track.playlist_adds && track.playlist_adds !== "N/A"
            ? parseInt(track.playlist_adds)
            : 0
      )}

      {/* Engagement Rate Comparison */}
      {renderComparisonCard(
        "Engagement Rate",
        <TrendingUp className="w-5 h-5 text-yellow-400" />,
        "engagement",
        (track) => parseFloat(track.engagement_rate || 0),
        "%"
      )}
    </>
  );
}
