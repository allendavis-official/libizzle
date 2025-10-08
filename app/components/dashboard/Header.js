// components/dashboard/Header.js

import { Music, Calendar, RefreshCw } from "lucide-react";

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg flex items-center justify-center">
              <Music className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Liberian Pulse</h1>
              <p className="text-sm text-gray-300">Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Calendar className="w-4 h-4" />
              <span>
                Last updated:{" "}
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <button
              onClick={onRefresh}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
