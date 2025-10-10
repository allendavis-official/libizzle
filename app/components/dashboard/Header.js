// components/dashboard/Header.js - MOBILE RESPONSIVE

import { Music, Calendar, RefreshCw } from "lucide-react";

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                Liberian Pulse
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                Analytics Dashboard
              </p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Last Updated - Hidden on very small screens */}
            <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-gray-300">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-1.5 sm:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Last Updated Mobile - Below on small screens */}
        <div className="flex md:hidden items-center gap-2 text-xs text-gray-400 mt-2">
          <Calendar className="w-3 h-3" />
          <span>
            Updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>
    </header>
  );
}
