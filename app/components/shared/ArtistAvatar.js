// app/components/shared/ArtistAvatar.js
// Displays artist profile picture with gradient fallback

"use client";
import React, { useState } from "react";
import { User } from "lucide-react";

export default function ArtistAvatar({
  name,
  imageUrl,
  size = "md",
  className = "",
}) {
  const [imageError, setImageError] = useState(false);

  // Size configurations
  const sizes = {
    xs: "w-8 h-8 text-xs",
    sm: "w-10 h-10 text-sm",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
    xl: "w-32 h-32 text-5xl",
    "2xl": "w-48 h-48 text-6xl",
  };

  // Generate consistent gradient from name
  const gradients = [
    "from-yellow-400 via-orange-500 to-red-500", // Fire
    "from-blue-400 via-purple-500 to-pink-500", // Cool
    "from-green-400 via-emerald-500 to-teal-500", // Fresh
    "from-pink-400 via-rose-500 to-red-500", // Hot
    "from-purple-400 via-indigo-500 to-blue-500", // Electric
    "from-cyan-400 via-blue-500 to-purple-500", // Ocean
    "from-orange-400 via-red-500 to-pink-500", // Sunset
    "from-lime-400 via-green-500 to-emerald-500", // Nature
  ];

  // Hash name to get consistent gradient
  const nameHash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = gradients[nameHash % gradients.length];

  // Get initials (first letter of first two words)
  const initials = name
    .split(" ")
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  // Check if we should show image
  const shouldShowImage = imageUrl && imageUrl !== "N/A" && !imageError;

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {shouldShowImage ? (
        <>
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full rounded-full object-cover ring-2 ring-white/20 shadow-lg"
            onError={() => setImageError(true)}
          />
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/0 to-white/0 hover:from-white/10 hover:to-white/5 transition-all duration-300" />
        </>
      ) : (
        // Gradient fallback with initials
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-white ring-2 ring-white/20 shadow-lg relative overflow-hidden`}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Initials or icon */}
          {initials.length > 0 ? (
            <span className="relative z-10">{initials}</span>
          ) : (
            <User
              className={`relative z-10 ${
                size === "xs" || size === "sm" ? "w-4 h-4" : "w-8 h-8"
              }`}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Variant: Artist Avatar with badge/status
export function ArtistAvatarWithBadge({
  name,
  imageUrl,
  size = "md",
  badge = null, // 'verified', 'hot', 'new', 'rising'
  className = "",
}) {
  const badgeConfig = {
    verified: { icon: "✓", color: "bg-blue-500", label: "Verified" },
    hot: { icon: "🔥", color: "bg-red-500", label: "Hot" },
    new: { icon: "✨", color: "bg-green-500", label: "New" },
    rising: { icon: "📈", color: "bg-yellow-500", label: "Rising" },
  };

  const badgeInfo = badge ? badgeConfig[badge] : null;

  return (
    <div className="relative inline-block">
      <ArtistAvatar
        name={name}
        imageUrl={imageUrl}
        size={size}
        className={className}
      />

      {badgeInfo && (
        <div
          className={`absolute -bottom-1 -right-1 ${badgeInfo.color} rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-black`}
          title={badgeInfo.label}
        >
          {badgeInfo.icon}
        </div>
      )}
    </div>
  );
}
