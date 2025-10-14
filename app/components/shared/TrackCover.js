// app/components/shared/TrackCover.js
// Displays track album art with fallback

"use client";
import React, { useState } from "react";
import { Music, Play } from "lucide-react";

export default function TrackCover({
  title,
  artist,
  imageUrl,
  size = "md",
  showPlayButton = false,
  onClick = null,
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizes = {
    xs: "w-12 h-12",
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
    "2xl": "w-64 h-64",
  };

  const iconSizes = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  };

  // Generate consistent gradient from title
  const gradients = [
    "from-purple-500 via-pink-500 to-red-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-orange-500 via-red-500 to-pink-500",
    "from-green-500 via-emerald-500 to-cyan-500",
    "from-yellow-500 via-orange-500 to-red-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-rose-500 via-pink-500 to-purple-500",
    "from-teal-500 via-cyan-500 to-blue-500",
  ];

  const titleHash = title
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = gradients[titleHash % gradients.length];

  // Check if we should show image
  const shouldShowImage = imageUrl && imageUrl !== "N/A" && !imageError;

  const containerClasses = `relative ${
    sizes[size]
  } rounded-lg overflow-hidden shadow-lg ${
    onClick ? "cursor-pointer group" : ""
  } ${className}`;

  return (
    <div className={containerClasses} onClick={onClick}>
      {shouldShowImage ? (
        <>
          {/* Album Art */}
          <img
            src={imageUrl}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />

          {/* Hover Overlay */}
          {onClick && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              {showPlayButton && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <Play
                      className="w-6 h-6 text-black ml-1"
                      fill="currentColor"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Gradient fallback
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>

          {/* Music icon */}
          <Music
            className={`${iconSizes[size]} text-white relative z-10 ${
              onClick ? "group-hover:scale-110 transition-transform" : ""
            }`}
          />

          {/* Play button on hover */}
          {onClick && showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl">
                <Play
                  className="w-5 h-5 text-black ml-0.5"
                  fill="currentColor"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ring effect */}
      <div className="absolute inset-0 rounded-lg ring-1 ring-white/10 pointer-events-none" />
    </div>
  );
}

// Variant: Track Cover with info overlay
export function TrackCoverWithInfo({
  title,
  artist,
  imageUrl,
  plays,
  likes,
  size = "md",
  onClick = null,
  className = "",
}) {
  return (
    <div className={`relative group ${className}`}>
      <TrackCover
        title={title}
        artist={artist}
        imageUrl={imageUrl}
        size={size}
        showPlayButton={true}
        onClick={onClick}
      />

      {/* Info overlay on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-xs font-semibold text-white truncate">{title}</p>
        <p className="text-xs text-gray-300 truncate">{artist}</p>
        {(plays || likes) && (
          <div className="flex gap-2 text-xs text-gray-400 mt-1">
            {plays && <span>▶️ {plays}</span>}
            {likes && <span>❤️ {likes}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Variant: Compact track row with cover
export function TrackCoverRow({
  title,
  artist,
  imageUrl,
  plays,
  engagement,
  onClick = null,
  className = "",
}) {
  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <TrackCover
        title={title}
        artist={artist}
        imageUrl={imageUrl}
        size="sm"
        showPlayButton={false}
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{artist}</p>
      </div>

      <div className="flex flex-col items-end text-xs text-gray-400">
        {plays && <span>{plays}</span>}
        {engagement && <span className="text-green-400">{engagement}%</span>}
      </div>
    </div>
  );
}
