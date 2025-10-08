// components/artist/ArtistHeader.js

import { ArrowLeft, Music, ExternalLink } from "lucide-react";

export default function ArtistHeader({ artist, onBack }) {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
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
