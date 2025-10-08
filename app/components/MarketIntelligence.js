"use client";
import React, { useMemo } from "react";
import {
  PieChart,
  TrendingUp,
  Award,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react";

const formatNumber = (num) => {
  const n = parseInt(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const MarketIntelligence = ({ artists = [], tracks = [] }) => {
  const insights = useMemo(() => {
    if (artists.length === 0) return null;

    // Total market size
    const totalFollowers = artists.reduce(
      (sum, a) => sum + parseInt(a.followers || 0),
      0
    );
    const totalPlays = artists.reduce(
      (sum, a) => sum + parseInt(a.total_plays || 0),
      0
    );
    const totalListeners = artists.reduce(
      (sum, a) => sum + parseInt(a.monthly_listeners || 0),
      0
    );

    // Market concentration (top 3 artists' share)
    const sortedByFollowers = [...artists].sort(
      (a, b) => parseInt(b.followers) - parseInt(a.followers)
    );
    const top3Followers = sortedByFollowers
      .slice(0, 3)
      .reduce((sum, a) => sum + parseInt(a.followers || 0), 0);
    const marketConcentration = (
      (top3Followers / totalFollowers) *
      100
    ).toFixed(1);

    // Average artist metrics
    const avgFollowers = Math.round(totalFollowers / artists.length);
    const avgPlays = Math.round(totalPlays / artists.length);
    const avgListeners = Math.round(totalListeners / artists.length);

    // Identify tiers
    const superstar = sortedByFollowers[0]; // Top artist
    const rising = sortedByFollowers.filter((a) => {
      const followers = parseInt(a.followers || 0);
      return followers >= avgFollowers * 0.5 && followers < avgFollowers * 2;
    });
    const emerging = sortedByFollowers.filter(
      (a) => parseInt(a.followers || 0) < avgFollowers * 0.5
    );

    // Engagement analysis
    const highEngagement = artists.filter((a) => {
      const engagement =
        parseInt(a.total_plays || 0) / parseInt(a.followers || 1);
      return engagement > 5;
    });

    // Undervalued artists (high engagement, lower followers)
    const undervalued = artists
      .map((a) => ({
        ...a,
        engagement: parseInt(a.total_plays || 0) / parseInt(a.followers || 1),
        followers: parseInt(a.followers || 0),
      }))
      .filter((a) => a.engagement > 5 && a.followers < avgFollowers)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 3);

    // Track analysis
    let trackInsights = null;
    if (tracks.length > 0) {
      const totalTrackPlays = tracks.reduce(
        (sum, t) => sum + parseInt(t.plays || 0),
        0
      );
      const avgTrackPlays = totalTrackPlays / tracks.length;

      const hits = tracks.filter(
        (t) => parseInt(t.plays || 0) > avgTrackPlays * 3
      );
      const avgEngagement =
        tracks.reduce((sum, t) => sum + parseFloat(t.engagement_rate || 0), 0) /
        tracks.length;

      trackInsights = {
        totalTracks: tracks.length,
        avgPlays: Math.round(avgTrackPlays),
        hitCount: hits.length,
        avgEngagement: avgEngagement.toFixed(2),
      };
    }

    return {
      market: {
        totalFollowers,
        totalPlays,
        totalListeners,
        totalArtists: artists.length,
        concentration: marketConcentration,
      },
      averages: {
        avgFollowers,
        avgPlays,
        avgListeners,
      },
      tiers: {
        superstar,
        rising: rising.length,
        emerging: emerging.length,
      },
      engagement: {
        highPerformers: highEngagement.length,
        percentage: ((highEngagement.length / artists.length) * 100).toFixed(1),
      },
      opportunities: undervalued,
      tracks: trackInsights,
    };
  }, [artists, tracks]);

  if (!insights) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
        <PieChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Market Data</h3>
        <p className="text-gray-400">
          Run the scraper to generate market insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-6 h-6 text-blue-400" />
          <h3 className="text-2xl font-bold">Market Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Total Market Size</p>
            <p className="text-2xl font-bold">
              {formatNumber(insights.market.totalFollowers)}
            </p>
            <p className="text-xs text-gray-400">followers</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Total Plays</p>
            <p className="text-2xl font-bold">
              {formatNumber(insights.market.totalPlays)}
            </p>
            <p className="text-xs text-gray-400">all-time</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Monthly Listeners</p>
            <p className="text-2xl font-bold">
              {formatNumber(insights.market.totalListeners)}
            </p>
            <p className="text-xs text-gray-400">active</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-sm text-gray-300 mb-1">Market Concentration</p>
            <p className="text-2xl font-bold">
              {insights.market.concentration}%
            </p>
            <p className="text-xs text-gray-400">top 3 artists</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Market Analysis:</strong>{" "}
            {insights.market.concentration > 60
              ? "The market is highly concentrated with top artists dominating. Opportunity for emerging talent to capture underserved audience."
              : insights.market.concentration > 40
              ? "Moderately competitive market with balanced distribution between established and rising artists."
              : "Fragmented market with no clear dominance. High competition and opportunity for breakouts."}
          </p>
        </div>
      </div>

      {/* Artist Tiers */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold">Artist Tier Distribution</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-5 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <p className="font-semibold">Superstar</p>
            </div>
            <p className="text-3xl font-bold mb-2">1</p>
            <p className="text-sm text-gray-300 mb-3">
              {insights.tiers.superstar?.artist_name}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(insights.tiers.superstar?.followers)} followers
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-5 border border-green-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <p className="font-semibold">Rising Stars</p>
            </div>
            <p className="text-3xl font-bold mb-2">{insights.tiers.rising}</p>
            <p className="text-sm text-gray-300 mb-3">50-200% of avg</p>
            <p className="text-xs text-gray-400">
              Established, growing fanbase
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-5 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <p className="font-semibold">Emerging Talent</p>
            </div>
            <p className="text-3xl font-bold mb-2">{insights.tiers.emerging}</p>
            <p className="text-sm text-gray-300 mb-3">&lt;50% of avg</p>
            <p className="text-xs text-gray-400">Building early fanbase</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <p className="text-sm">
            <strong>Average Artist Benchmarks:</strong>
          </p>
          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
            <div>
              <p className="text-gray-400">Followers</p>
              <p className="font-semibold">
                {formatNumber(insights.averages.avgFollowers)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Total Plays</p>
              <p className="font-semibold">
                {formatNumber(insights.averages.avgPlays)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Monthly Listeners</p>
              <p className="font-semibold">
                {formatNumber(insights.averages.avgListeners)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold">Engagement Quality</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-5">
            <p className="text-4xl font-bold mb-2">
              {insights.engagement.highPerformers}
            </p>
            <p className="text-lg font-semibold mb-2">
              High-Engagement Artists
            </p>
            <p className="text-sm text-gray-300 mb-3">
              {insights.engagement.percentage}% of tracked artists have
              engagement rates above 5x
            </p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Zap className="w-4 h-4" />
              <span>Strong audience connection</span>
            </div>
          </div>

          {insights.tracks && (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-5">
              <p className="text-4xl font-bold mb-2">
                {insights.tracks.hitCount}
              </p>
              <p className="text-lg font-semibold mb-2">Hit Tracks</p>
              <p className="text-sm text-gray-300 mb-3">
                Tracks performing 3x above average (
                {formatNumber(insights.tracks.avgPlays)} plays)
              </p>
              <div className="text-sm text-gray-400">
                <p>Avg engagement: {insights.tracks.avgEngagement}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Investment Opportunities */}
      {insights.opportunities.length > 0 && (
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold">💎 Undervalued Artists</h3>
            <span className="text-xs bg-orange-500/30 px-3 py-1 rounded-full">
              A&R Alert
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            High engagement rates with below-average follower counts. These
            artists have strong fan loyalty and growth potential.
          </p>

          <div className="space-y-3">
            {insights.opportunities.map((artist, index) => (
              <div
                key={artist.url}
                className="bg-white/10 rounded-lg p-4 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-lg">
                          {artist.artist_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatNumber(artist.followers)} followers •{" "}
                          {artist.engagement.toFixed(2)}x engagement
                        </p>
                      </div>
                    </div>

                    <div className="ml-11 space-y-1 text-sm">
                      <p className="text-gray-300">
                        <strong>Why undervalued:</strong> Engagement rate{" "}
                        {((artist.engagement / 5 - 1) * 100).toFixed(0)}% above
                        market average, but{" "}
                        {(
                          ((insights.averages.avgFollowers - artist.followers) /
                            insights.averages.avgFollowers) *
                          100
                        ).toFixed(0)}
                        % fewer followers than average
                      </p>
                      <p className="text-green-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>
                          Strong candidate for label signing or playlist
                          featuring
                        </span>
                      </p>
                    </div>
                  </div>

                  <a
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-black/20 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>💡 Pro Tip:</strong> Artists with engagement rates above
              5x but follower counts below market average often have dedicated
              fanbases ready to scale. Early partnerships can yield high ROI as
              these artists grow.
            </p>
          </div>
        </div>
      )}

      {/* Market Trends */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">📊 Market Insights</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <p className="font-semibold">Market Maturity</p>
              <p className="text-sm text-gray-300">
                {insights.market.totalArtists < 10
                  ? "Early-stage market with room for new entrants and rapid growth."
                  : insights.market.totalArtists < 30
                  ? "Growing market with established leaders and emerging talent."
                  : "Mature market with clear tier separation and competitive dynamics."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
            <div>
              <p className="font-semibold">Engagement Health</p>
              <p className="text-sm text-gray-300">
                {insights.engagement.percentage > 50
                  ? "Strong market health: Majority of artists have engaged, active fanbases."
                  : insights.engagement.percentage > 30
                  ? "Moderate engagement: Some artists have strong connections, others building."
                  : "Low engagement overall: Opportunity to improve fan connection strategies."}
              </p>
            </div>
          </div>

          {insights.tracks && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold">Content Quality</p>
                <p className="text-sm text-gray-300">
                  {insights.tracks.hitCount / insights.tracks.totalTracks > 0.2
                    ? "High hit rate: Strong content quality across the market."
                    : insights.tracks.hitCount / insights.tracks.totalTracks >
                      0.1
                    ? "Moderate hit rate: Quality content mixed with catalog filler."
                    : "Low hit rate: Opportunity for better production and marketing."}{" "}
                  ({insights.tracks.hitCount} hits out of{" "}
                  {insights.tracks.totalTracks} tracks)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
            <div>
              <p className="font-semibold">Investment Climate</p>
              <p className="text-sm text-gray-300">
                {insights.opportunities.length > 0
                  ? `${insights.opportunities.length} undervalued artists identified. Strong opportunities for early investment or partnership.`
                  : "Market is fairly valued. Focus on supporting established artists or wait for new entrants."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4">🎯 Strategic Recommendations</h3>

        <div className="space-y-3">
          {insights.market.concentration > 60 && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold mb-2">⚠️ Market Concentration Risk</p>
              <p className="text-sm text-gray-300">
                Top 3 artists control {insights.market.concentration}% of the
                market. Consider diversifying investments across emerging talent
                to capture growth opportunities.
              </p>
            </div>
          )}

          {insights.engagement.percentage < 40 && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold mb-2">📱 Engagement Opportunity</p>
              <p className="text-sm text-gray-300">
                Only {insights.engagement.percentage}% of artists have strong
                engagement. Focus on fan retention strategies, community
                building, and consistent content delivery.
              </p>
            </div>
          )}

          {insights.opportunities.length > 0 && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold mb-2">💎 High-Value Targets</p>
              <p className="text-sm text-gray-300">
                {insights.opportunities.length} artists showing strong
                engagement with growth potential. Prioritize these for label
                deals, playlist features, or promotional campaigns.
              </p>
            </div>
          )}

          {insights.tracks && insights.tracks.avgEngagement > 2 && (
            <div className="bg-white/10 rounded-lg p-4">
              <p className="font-semibold mb-2">🎵 Content Quality High</p>
              <p className="text-sm text-gray-300">
                Average track engagement of {insights.tracks.avgEngagement}%
                indicates quality content. Market is ripe for discovery
                platforms and curated playlists.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
