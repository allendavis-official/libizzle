// components/artist/ArtistHeader.js - MOBILE RESPONSIVE

import { ArrowLeft, Music, ExternalLink } from "lucide-react";

export default function ArtistHeader({ artist, onBack }) {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>

        {/* Artist Info - Mobile Layout */}
        <div className="flex flex-col sm:hidden gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold truncate">
                {artist.artist_name}
              </h1>
              <p className="text-xs text-gray-300">Artist Analytics</p>
            </div>
          </div>
          <a
            href={artist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
          >
            View on Audiomack
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Artist Info - Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{artist.artist_name}</h1>
              <p className="text-gray-300">Artist Analytics</p>
            </div>
          </div>

          <a
            href={artist.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            View on Audiomack
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
