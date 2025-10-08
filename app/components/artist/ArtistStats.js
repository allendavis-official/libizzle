// components/artist/ArtistStats.js

import { Users, Play, Music, BarChart3, TrendingUp } from "lucide-react";
import { formatNumber } from "../../lib/utils";

export default function ArtistStats({ artist, tracks, insights }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <Users className="w-6 h-6 text-blue-400" />
          <TrendingUp className="w-4 h-4 text-green-400" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {formatNumber(artist.followers)}
        </p>
        <p className="text-sm text-gray-300">Followers</p>
        {insights && insights.vsMarket !== 0 && (
          <p
            className={`text-xs mt-2 ${
              insights.vsMarket > 0 ? "text-green-400" : "text-orange-400"
            }`}
          >
            {insights.vsMarket > 0 ? "+" : ""}
            {insights.vsMarket}% vs market avg
          </p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <Play className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {formatNumber(artist.total_plays)}
        </p>
        <p className="text-sm text-gray-300">Total Plays</p>
        {insights && (
          <p className="text-xs text-gray-400 mt-2">
            {insights.engagement}x engagement rate
          </p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <Music className="w-6 h-6 text-yellow-400" />
        </div>
        <p className="text-3xl font-bold mb-1">{tracks.length}</p>
        <p className="text-sm text-gray-300">Tracks</p>
        {insights && (
          <p className="text-xs text-gray-400 mt-2">
            {formatNumber(insights.avgTrackPlays)} avg plays/track
          </p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <BarChart3 className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-3xl font-bold mb-1">
          {formatNumber(artist.monthly_listeners)}
        </p>
        <p className="text-sm text-gray-300">Monthly Listeners</p>
      </div>
    </div>
  );
}
