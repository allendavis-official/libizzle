// app/components/dashboard/Header.js - L-I-BIZZLE REBRAND

import { Music, Calendar, RefreshCw } from "lucide-react";

export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title - L-I-BIZZLE - Now takes full width */}
          <div className="flex items-center gap-3 sm:gap-3 w-full">
            {/* Animated Logo */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
              <Music className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col items-center sm:items-start">
              {/* Brand Name with Gradient - Full width on mobile */}
              <h1 className="text-[45px] sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 bg-clip-text text-transparent leading-tight w-full text-center sm:text-left">
                L-I-Bizzle
              </h1>

              {/* Tagline - Desktop */}
              <p className="text-lg sm:text-sm text-gray-300 hidden sm:block mt-1">
                Where Liberian Music Pops Off 🔥
              </p>

              {/* Tagline - Mobile (shorter) */}
              <p className="text-lg text-gray-400 sm:hidden mt-0.5 text-center">
                Liberian Music Data
              </p>
            </div>

            {/* Right Side Actions - Moved inside the main flex container */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Last Updated - Hidden on very small screens */}
              <div className="hidden md:flex items-center gap-2 text-sm sm:text-sm text-gray-300 bg-white/5 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={onRefresh}
                className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 group active:scale-95 active:bg-white/25"
                title="Refresh data"
                aria-label="Refresh data"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Last Updated Mobile - Below on small screens */}
        <div className="flex md:hidden items-center gap-2 text-sm text-gray-400 mt-2 bg-white/5 px-3 py-2 rounded-lg w-fit mx-auto sm:mx-0">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="whitespace-nowrap">
            Updated:{" "}
            {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "N/A"}
          </span>
        </div>
      </div>
    </header>
  );
}

// app/components/shared/Logo.js - Reusable Logo Component

export function Logo({ size = "md", showText = true, animated = true }) {
  const sizes = {
    sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-base" },
    md: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-2xl" },
    lg: { container: "w-16 h-16", icon: "w-8 h-8", text: "text-3xl" },
    xl: { container: "w-24 h-24", icon: "w-12 h-12", text: "text-5xl" },
  };

  const { container, icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Logo Icon */}
      <div
        className={`${container} bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 rounded-lg flex items-center justify-center relative overflow-hidden ${
          animated ? "group" : ""
        }`}
      >
        <Music
          className={`${icon} text-white relative z-10 ${
            animated
              ? "group-hover:scale-110 transition-transform duration-300"
              : ""
          }`}
        />

        {/* Shine effect */}
        {animated && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex-1">
          <h1
            className={`${text} font-black bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 bg-clip-text text-transparent w-full`}
          >
            L-I-Bizzle
          </h1>
        </div>
      )}
    </div>
  );
}

// app/components/shared/BrandBadge.js - Small badge version

export function BrandBadge({ variant = "default" }) {
  const variants = {
    default: "from-purple-600 via-pink-500 to-rose-400",
    hot: "from-orange-500 via-red-500 to-pink-500",
    cool: "from-blue-500 via-purple-500 to-pink-500",
    fresh: "from-green-500 via-emerald-500 to-cyan-500",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${variants[variant]} text-white text-sm font-bold shadow-lg`}
    >
      <Music className="w-4 h-4" />
      <span>L-I-Bizzle</span>
    </div>
  );
}
