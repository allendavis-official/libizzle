// components/artist/ArtistInsightsPanel.js

import { Zap, Target, Award, TrendingUp, Music, Calendar } from "lucide-react";
import {
  formatNumber,
  calculateTenure,
  getTenureInsight,
} from "../../lib/utils";
import { getInsightText } from "../../lib/artistPageUtils";

export default function ArtistInsightsPanel({ artist, insights }) {
  if (!insights) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold">AI Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Engagement Quality</h3>
          </div>
          <p className="text-sm text-gray-300">
            {getInsightText(
              "engagement",
              insights.engagement,
              artist.artist_name
            )}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Catalog Consistency</h3>
          </div>
          <p className="text-sm text-gray-300">
            {getInsightText(
              "consistency",
              insights.consistency,
              artist.artist_name
            )}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Market Position</h3>
          </div>
          <p className="text-sm text-gray-300">
            {getInsightText(
              "marketPosition",
              insights.vsMarket,
              artist.artist_name
            )}
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Music className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold">Biggest Hit</h3>
          </div>
          {insights.topTrack ? (
            <div>
              <p className="text-sm font-semibold text-white">
                {insights.topTrack.track_title}
              </p>
              <p className="text-xs text-gray-400">
                {formatNumber(insights.topTrack.plays)} plays
              </p>
              <p className="text-xs text-gray-300 mt-1">
                {(
                  (parseInt(insights.topTrack.plays) / insights.avgTrackPlays -
                    1) *
                  100
                ).toFixed(0)}
                % above your average
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No track data</p>
          )}
        </div>

        {/* Platform Tenure Insight */}
        {artist.member_since &&
          artist.member_since !== "N/A" &&
          (() => {
            const tenure = calculateTenure(artist.member_since);
            if (!tenure) return null;

            const tenureInsight = getTenureInsight(
              tenure,
              artist.followers,
              artist.total_plays
            );
            if (!tenureInsight) return null;

            return (
              <div className="bg-white/10 rounded-lg p-4 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold">Platform Tenure</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full bg-white/10 ${tenureInsight.color}`}
                  >
                    {tenureInsight.category}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  {tenureInsight.insight}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>📅 Joined: {artist.member_since}</span>
                  <span>
                    📈 {tenureInsight.followersPerMonth}/mo avg growth
                  </span>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
