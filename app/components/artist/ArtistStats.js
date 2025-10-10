// components/artist/ArtistStats.js - MOBILE RESPONSIVE

import { Users, Play, Music, BarChart3, TrendingUp } from "lucide-react";
import { formatNumber } from "../../lib/utils";

export default function ArtistStats({ artist, tracks, insights }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Followers */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 hidden sm:block" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
          {formatNumber(artist.followers)}
        </p>
        <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-0">
          Followers
        </p>
        {insights && insights.vsMarket !== 0 && (
          <p
            className={`text-xs mt-1 sm:mt-2 ${
              insights.vsMarket > 0 ? "text-green-400" : "text-orange-400"
            }`}
          >
            {insights.vsMarket > 0 ? "+" : ""}
            {insights.vsMarket}% vs market
          </p>
        )}
      </div>

      {/* Total Plays */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
          {formatNumber(artist.total_plays)}
        </p>
        <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-0">
          Total Plays
        </p>
        {insights && (
          <p className="text-xs text-gray-400 mt-1 sm:mt-2">
            {insights.engagement}x engagement
          </p>
        )}
      </div>

      {/* Tracks */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <Music className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold mb-1">{tracks.length}</p>
        <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-0">Tracks</p>
        {insights && (
          <p className="text-xs text-gray-400 mt-1 sm:mt-2 truncate">
            {formatNumber(insights.avgTrackPlays)} avg plays
          </p>
        )}
      </div>

      {/* Monthly Listeners */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold mb-1 truncate">
          {formatNumber(artist.monthly_listeners)}
        </p>
        <p className="text-xs sm:text-sm text-gray-300">Monthly Listeners</p>
      </div>
    </div>
  );
}
