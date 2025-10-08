// components/dashboard/TenureInsightsCard.js

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { calculateTenure, formatNumber, createSlug } from "../../lib/utils";

export default function TenureInsightsCard({ artists, tracks, router }) {
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
    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-indigo-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6 text-indigo-400" />
        <h2 className="text-2xl font-bold">Platform Tenure Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer"
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.newest.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <h3 className="font-semibold text-sm">Newest Artist</h3>
          </div>
          <p className="text-lg font-bold">
            {tenureAnalysis.newest.artist_name}
          </p>
          <p className="text-xs text-gray-400">
            Joined {tenureAnalysis.newest.tenure.formatted} ago
          </p>
          <p className="text-xs text-green-400 mt-2">
            {formatNumber(tenureAnalysis.newest.followers)} followers already!
          </p>
        </div>

        <div
          className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer"
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.oldest.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <h3 className="font-semibold text-sm">Platform Veteran</h3>
          </div>
          <p className="text-lg font-bold">
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
          className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-all cursor-pointer"
          onClick={() =>
            router.push(
              `/artists/${createSlug(tenureAnalysis.fastestGrower.artist_name)}`
            )
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <h3 className="font-semibold text-sm">Fastest Grower</h3>
          </div>
          <p className="text-lg font-bold">
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
    </div>
  );
}
