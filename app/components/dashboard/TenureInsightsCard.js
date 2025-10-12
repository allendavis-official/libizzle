// components/dashboard/TenureInsightsCard.js - UPDATED LABELS & MOBILE COLLAPSIBLE

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { calculateTenure, formatNumber, createSlug } from "../../lib/utils";

export default function TenureInsightsCard({ artists, tracks, router }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tenureAnalysis = useMemo(() => {
    const artistsWithTenure = artists
      .map((a) => ({
        ...a,
        tenure: calculateTenure(a.member_since),
      }))
      .filter((a) => a.tenure !== null);

    if (artistsWithTenure.length === 0) return null;

    // Find extremes
    const newest = artistsWithTenure.reduce((prev, curr) =>
      curr.tenure.days < prev.tenure.days ? curr : prev
    );

    const oldest = artistsWithTenure.reduce((prev, curr) =>
      curr.tenure.days > prev.tenure.days ? curr : prev
    );

    // Calculate fastest grower (followers per month)
    const withGrowthRate = artistsWithTenure.map((a) => ({
      ...a,
      growthRate: parseInt(a.followers) / a.tenure.months,
    }));

    const fastestGrower = withGrowthRate.reduce((prev, curr) =>
      curr.growthRate > prev.growthRate ? curr : prev
    );

    return { newest, oldest, fastestGrower, total: artistsWithTenure.length };
  }, [artists]);

  if (!tenureAnalysis) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-indigo-500/30">
      {/* Header - Clickable on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 sm:mb-4 sm:cursor-default"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold">Artist Highlights</h2>
        </div>
        {/* Show chevron only on mobile */}
        <div className="sm:hidden">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Cards Grid - First item always visible on mobile, rest collapsible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Fresh on the Scene - Always visible */}
        <div
          className="bg-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/15 transition-all cursor-pointer"
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.newest.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
            <h3 className="font-semibold text-sm sm:text-base">
              Fresh on the Scene
            </h3>
          </div>
          <p className="text-base sm:text-lg font-bold truncate">
            {tenureAnalysis.newest.artist_name}
          </p>
          <p className="text-xs text-gray-400">
            Joined {tenureAnalysis.newest.tenure.formatted} ago
          </p>
          <p className="text-xs text-green-400 mt-2">
            {formatNumber(tenureAnalysis.newest.followers)} followers already!
          </p>
        </div>

        {/* Collapsible items on mobile */}
        <div
          className={`${
            isExpanded ? "block" : "hidden"
          } md:block bg-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/15 transition-all cursor-pointer`}
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.oldest.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
            <h3 className="font-semibold text-sm sm:text-base">
              Since Day One
            </h3>
          </div>
          <p className="text-base sm:text-lg font-bold truncate">
            {tenureAnalysis.oldest.artist_name}
          </p>
          <p className="text-xs text-gray-400">
            {tenureAnalysis.oldest.tenure.formatted} on platform
          </p>
          <p className="text-xs text-orange-400 mt-2">
            Proven staying power with{" "}
            {formatNumber(tenureAnalysis.oldest.followers)} fans
          </p>
        </div>

        <div
          className={`${
            isExpanded ? "block" : "hidden"
          } md:block bg-white/10 rounded-lg p-3 sm:p-4 hover:bg-white/15 transition-all cursor-pointer`}
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.fastestGrower.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
            <h3 className="font-semibold text-sm sm:text-base">
              Hot on the Rise
            </h3>
          </div>
          <p className="text-base sm:text-lg font-bold truncate">
            {tenureAnalysis.fastestGrower.artist_name}
          </p>
          <p className="text-xs text-gray-400">
            {Math.round(tenureAnalysis.fastestGrower.growthRate)}{" "}
            followers/month
          </p>
          <p className="text-xs text-yellow-400 mt-2">
            🚀 Exceptional growth velocity
          </p>
        </div>
      </div>

      {/* Tap to expand hint - Only on mobile when collapsed */}
      {!isExpanded && (
        <div className="sm:hidden mt-3 text-center">
          <p className="text-xs text-gray-400">Tap to see more</p>
        </div>
      )}
    </div>
  );
}
