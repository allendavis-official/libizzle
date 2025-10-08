"use client";
import React, { useState, useMemo } from "react";
import {
  Users,
  Play,
  TrendingUp,
  Music,
  BarChart3,
  X,
  Calendar,
} from "lucide-react";

// Import utilities - with fallbacks
const formatNumber = (num) => {
  const n = parseInt(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

const calculateEngagement = (plays, followers) => {
  const p = parseInt(plays);
  const f = parseInt(followers);
  if (f === 0 || isNaN(f) || isNaN(p)) return 0;
  return (p / f).toFixed(2);
};

const calculateTenure = (memberSince) => {
  if (!memberSince || memberSince === "N/A") return null;
  try {
    const joinDate = new Date(memberSince);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
    return {
      days: diffDays,
      months: diffMonths,
      years: diffYears,
      formatted:
        diffYears > 0
          ? `${diffYears} year${diffYears > 1 ? "s" : ""}`
          : diffMonths > 0
          ? `${diffMonths} month${diffMonths > 1 ? "s" : ""}`
          : `${diffDays} day${diffDays > 1 ? "s" : ""}`,
    };
  } catch {
    return null;
  }
};

const getTenureInsight = (tenure, followers) => {
  if (!tenure) return null;
  const followersPerMonth = parseInt(followers) / tenure.months || 0;
  let category = "Veteran";
  let color = "text-blue-400";

  if (tenure.months < 6) {
    category = "Newcomer";
    color = "text-green-400";
  } else if (tenure.months < 12) {
    category = "Emerging";
    color = "text-purple-400";
  } else if (tenure.years < 3) {
    category = "Established";
    color = "text-yellow-400";
  } else {
    category = "Veteran";
    color = "text-orange-400";
  }

  return { category, color, followersPerMonth: Math.round(followersPerMonth) };
};

const ArtistComparisonTool = ({ artists = [], tracks = [] }) => {
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtists = useMemo(() => {
    if (!searchTerm) return artists;
    return artists.filter((a) =>
      a.artist_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [artists, searchTerm]);

  const addArtist = (artist) => {
    if (
      selectedArtists.length < 3 &&
      !selectedArtists.find((a) => a.url === artist.url)
    ) {
      setSelectedArtists([...selectedArtists, artist]);
      setSearchTerm("");
    }
  };

  const removeArtist = (artistUrl) => {
    setSelectedArtists(selectedArtists.filter((a) => a.url !== artistUrl));
  };

  const getArtistTracks = (artistName) => {
    return tracks.filter((t) => t.artist_name === artistName);
  };

  const calculateCatalogMetrics = (artistName) => {
    const artistTracks = getArtistTracks(artistName);
    if (artistTracks.length === 0)
      return { totalTracks: 0, avgPlays: 0, topTrack: null, consistency: 0 };

    const totalPlays = artistTracks.reduce(
      (sum, t) => sum + parseInt(t.plays || 0),
      0
    );
    const avgPlays = totalPlays / artistTracks.length;
    const topTrack = artistTracks.reduce(
      (prev, curr) =>
        parseInt(curr.plays || 0) > parseInt(prev.plays || 0) ? curr : prev,
      artistTracks[0]
    );

    const variance =
      artistTracks.reduce((sum, t) => {
        const diff = parseInt(t.plays || 0) - avgPlays;
        return sum + diff * diff;
      }, 0) / artistTracks.length;
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (stdDev / avgPlays) * 100);

    return {
      totalTracks: artistTracks.length,
      avgPlays: Math.round(avgPlays),
      topTrack,
      consistency: Math.round(consistency),
      totalPlays,
    };
  };

  const getWinner = (metric) => {
    if (!selectedArtists || selectedArtists.length < 2) return null;
    const validArtists = selectedArtists.filter(
      (a) => a && a.url && a.artist_name
    );
    if (validArtists.length < 2) return null;

    const values = validArtists.map((a) => {
      if (metric === "followers") return parseInt(a.followers || 0);
      if (metric === "plays") return parseInt(a.total_plays || 0);
      if (metric === "listeners") return parseInt(a.monthly_listeners || 0);
      if (metric === "engagement")
        return parseFloat(calculateEngagement(a.total_plays, a.followers));
      if (metric === "catalog")
        return calculateCatalogMetrics(a.artist_name).totalTracks;
      if (metric === "consistency")
        return calculateCatalogMetrics(a.artist_name).consistency;
      return 0;
    });

    const maxValue = Math.max(...values);
    const winnersCount = values.filter((v) => v === maxValue).length;
    if (winnersCount > 1) return "TIE";

    const winnerIndex = values.indexOf(maxValue);
    if (winnerIndex === -1 || winnerIndex >= validArtists.length) return null;
    return validArtists[winnerIndex].url;
  };

  if (artists.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">No Artist Data</h3>
        <p className="text-gray-400">
          Run the scraper to enable artist comparisons
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold mb-4">
          Select Artists to Compare (up to 3)
        </h3>

        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search artists..."
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            disabled={selectedArtists.length >= 3}
          />
        </div>

        {searchTerm && filteredArtists.length > 0 && (
          <div className="mb-4 max-h-48 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
            {filteredArtists.slice(0, 5).map((artist) => (
              <button
                key={artist.url}
                onClick={() => addArtist(artist)}
                disabled={selectedArtists.find((a) => a.url === artist.url)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-white/5 last:border-0"
              >
                <p className="font-semibold">{artist.artist_name}</p>
                <p className="text-xs text-gray-400">
                  {formatNumber(artist.followers)} followers
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {selectedArtists.map((artist) => (
            <div
              key={artist.url}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30"
            >
              <span className="font-semibold">{artist.artist_name}</span>
              <button
                onClick={() => removeArtist(artist.url)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {selectedArtists.length === 0 && (
          <p className="text-gray-400 text-sm mt-4">
            Select artists from the search above to compare them
          </p>
        )}
      </div>

      {selectedArtists.length >= 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {/* Followers */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h4 className="font-semibold">Followers</h4>
              </div>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                }}
              >
                {selectedArtists.map((artist) => {
                  const winner = getWinner("followers");
                  const isWinner = winner === artist.url;
                  const isTie = winner === "TIE";
                  return (
                    <div
                      key={artist.url}
                      className={`p-4 rounded-lg ${
                        isTie
                          ? "bg-blue-500/20 border-2 border-blue-500"
                          : isWinner
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-white/5"
                      }`}
                    >
                      <p className="text-sm text-gray-300 mb-1">
                        {artist.artist_name}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(artist.followers)}
                      </p>
                      {isTie && (
                        <p className="text-xs text-blue-400 mt-1">🤝 Tied</p>
                      )}
                      {isWinner && !isTie && (
                        <p className="text-xs text-green-400 mt-1">👑 Leader</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Plays */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold">Total Account Plays</h4>
              </div>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                }}
              >
                {selectedArtists.map((artist) => {
                  const winner = getWinner("plays");
                  const isWinner = winner === artist.url;
                  const isTie = winner === "TIE";
                  return (
                    <div
                      key={artist.url}
                      className={`p-4 rounded-lg ${
                        isTie
                          ? "bg-blue-500/20 border-2 border-blue-500"
                          : isWinner
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-white/5"
                      }`}
                    >
                      <p className="text-sm text-gray-300 mb-1">
                        {artist.artist_name}
                      </p>
                      <p className="text-2xl font-bold">
                        {formatNumber(artist.total_plays)}
                      </p>
                      {isTie && (
                        <p className="text-xs text-blue-400 mt-1">🤝 Tied</p>
                      )}
                      {isWinner && !isTie && (
                        <p className="text-xs text-green-400 mt-1">👑 Leader</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h4 className="font-semibold">Engagement Rate</h4>
                <span className="text-xs text-gray-400">
                  (Plays per Follower)
                </span>
              </div>
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                }}
              >
                {selectedArtists.map((artist) => {
                  const winner = getWinner("engagement");
                  const isWinner = winner === artist.url;
                  const isTie = winner === "TIE";
                  const engagement = calculateEngagement(
                    artist.total_plays,
                    artist.followers
                  );
                  return (
                    <div
                      key={artist.url}
                      className={`p-4 rounded-lg ${
                        isTie
                          ? "bg-blue-500/20 border-2 border-blue-500"
                          : isWinner
                          ? "bg-green-500/20 border-2 border-green-500"
                          : "bg-white/5"
                      }`}
                    >
                      <p className="text-sm text-gray-300 mb-1">
                        {artist.artist_name}
                      </p>
                      <p className="text-2xl font-bold">{engagement}x</p>
                      {isTie && (
                        <p className="text-xs text-blue-400 mt-1">🤝 Tied</p>
                      )}
                      {isWinner && !isTie && (
                        <p className="text-xs text-green-400 mt-1">
                          👑 Best Engagement
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catalog Comparison */}
            {tracks.length > 0 && (
              <>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-yellow-400" />
                    <h4 className="font-semibold">Catalog Size</h4>
                  </div>
                  <div
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                    }}
                  >
                    {selectedArtists.map((artist) => {
                      const metrics = calculateCatalogMetrics(
                        artist.artist_name
                      );
                      const isWinner = getWinner("catalog") === artist.url;
                      return (
                        <div
                          key={artist.url}
                          className={`p-4 rounded-lg ${
                            isWinner
                              ? "bg-green-500/20 border-2 border-green-500"
                              : "bg-white/5"
                          }`}
                        >
                          <p className="text-sm text-gray-300 mb-1">
                            {artist.artist_name}
                          </p>
                          <p className="text-2xl font-bold">
                            {metrics.totalTracks} tracks
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Avg: {formatNumber(metrics.avgPlays)} plays/track
                          </p>
                          {isWinner && (
                            <p className="text-xs text-green-400 mt-1">
                              👑 Largest Catalog
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Tenure Comparison */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-semibold">
                      Platform Tenure & Growth Velocity
                    </h4>
                  </div>
                  <div
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                    }}
                  >
                    {selectedArtists.map((artist) => {
                      const tenure = calculateTenure(artist.member_since);
                      const tenureInsight = tenure
                        ? getTenureInsight(tenure, artist.followers)
                        : null;
                      const followersPerMonth = tenure
                        ? Math.round(parseInt(artist.followers) / tenure.months)
                        : 0;

                      // Determine badges
                      const growthRates = selectedArtists.map((a) => {
                        const t = calculateTenure(a.member_since);
                        return t ? parseInt(a.followers) / t.months : 0;
                      });
                      const maxGrowthRate = Math.max(...growthRates);
                      const isBestGrowth =
                        followersPerMonth === maxGrowthRate &&
                        followersPerMonth > 0;

                      const tenures = selectedArtists.map((a) => {
                        const t = calculateTenure(a.member_since);
                        return t ? t.days : 0;
                      });
                      const maxTenure = Math.max(...tenures);
                      const minTenure = Math.min(
                        ...tenures.filter((t) => t > 0)
                      );
                      const isVeteran = tenure && tenure.days === maxTenure;
                      const isNewest = tenure && tenure.days === minTenure;

                      return (
                        <div
                          key={artist.url}
                          className={`p-4 rounded-lg ${
                            isBestGrowth
                              ? "bg-green-500/20 border-2 border-green-500"
                              : "bg-white/5"
                          }`}
                        >
                          <p className="text-sm text-gray-300 mb-1">
                            {artist.artist_name}
                          </p>

                          {tenure ? (
                            <>
                              <p className="text-2xl font-bold mb-1">
                                {tenure.formatted}
                              </p>

                              {tenureInsight && (
                                <span
                                  className={`inline-block text-xs px-2 py-0.5 rounded-full bg-white/10 mb-2 ${tenureInsight.color}`}
                                >
                                  {tenureInsight.category}
                                </span>
                              )}

                              <p className="text-xs text-gray-400 mt-2">
                                📈 {formatNumber(followersPerMonth)}{" "}
                                followers/month
                              </p>

                              <p className="text-xs text-gray-400">
                                📅 Since {artist.member_since}
                              </p>

                              {isBestGrowth && (
                                <p className="text-xs text-green-400 mt-2">
                                  🚀 Best Growth Velocity
                                </p>
                              )}
                              {isVeteran && !isBestGrowth && (
                                <p className="text-xs text-orange-400 mt-2">
                                  🏆 Platform Veteran
                                </p>
                              )}
                              {isNewest && !isBestGrowth && (
                                <p className="text-xs text-purple-400 mt-2">
                                  ⭐ Newest Artist
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-sm text-gray-400">
                              No tenure data
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Consistency Score */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                    <h4 className="font-semibold">Consistency Score</h4>
                    <span className="text-xs text-gray-400">
                      (Track performance balance)
                    </span>
                  </div>
                  <div
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                    }}
                  >
                    {selectedArtists.map((artist) => {
                      const metrics = calculateCatalogMetrics(
                        artist.artist_name
                      );
                      const winner = getWinner("consistency");
                      const isWinner = winner === artist.url;
                      const isTie = winner === "TIE";
                      return (
                        <div
                          key={artist.url}
                          className={`p-4 rounded-lg ${
                            isTie
                              ? "bg-blue-500/20 border-2 border-blue-500"
                              : isWinner
                              ? "bg-green-500/20 border-2 border-green-500"
                              : "bg-white/5"
                          }`}
                        >
                          <p className="text-sm text-gray-300 mb-1">
                            {artist.artist_name}
                          </p>
                          <p className="text-2xl font-bold">
                            {metrics.consistency}/100
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {metrics.consistency > 70
                              ? "Very consistent"
                              : metrics.consistency > 50
                              ? "Moderately consistent"
                              : "Hit-driven"}
                          </p>
                          {isTie && (
                            <p className="text-xs text-blue-400 mt-1">
                              🤝 Tied
                            </p>
                          )}
                          {isWinner && !isTie && (
                            <p className="text-xs text-green-400 mt-1">
                              👑 Most Consistent
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Track */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h4 className="font-semibold mb-4">Biggest Hit</h4>
                  <div
                    className="grid gap-3"
                    style={{
                      gridTemplateColumns: `repeat(${selectedArtists.length}, 1fr)`,
                    }}
                  >
                    {selectedArtists.map((artist) => {
                      const metrics = calculateCatalogMetrics(
                        artist.artist_name
                      );
                      return (
                        <div
                          key={artist.url}
                          className="p-4 rounded-lg bg-white/5"
                        >
                          <p className="text-sm text-gray-300 mb-2">
                            {artist.artist_name}
                          </p>
                          {metrics.topTrack ? (
                            <>
                              <p className="font-semibold text-lg mb-1">
                                {metrics.topTrack.track_title}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatNumber(metrics.topTrack.plays)} plays
                              </p>
                            </>
                          ) : (
                            <p className="text-gray-400">No track data</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
            <h4 className="font-semibold text-lg mb-4">
              📊 Comparison Summary
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Largest Fanbase:</strong>{" "}
                {
                  selectedArtists.reduce((prev, curr) =>
                    parseInt(curr.followers) > parseInt(prev.followers)
                      ? curr
                      : prev
                  ).artist_name
                }{" "}
                (
                {formatNumber(
                  selectedArtists.reduce((prev, curr) =>
                    parseInt(curr.followers) > parseInt(prev.followers)
                      ? curr
                      : prev
                  ).followers
                )}{" "}
                followers)
              </p>

              <p>
                <strong>Most Streams:</strong>{" "}
                {
                  selectedArtists.reduce((prev, curr) =>
                    parseInt(curr.total_plays) > parseInt(prev.total_plays)
                      ? curr
                      : prev
                  ).artist_name
                }{" "}
                (
                {formatNumber(
                  selectedArtists.reduce((prev, curr) =>
                    parseInt(curr.total_plays) > parseInt(prev.total_plays)
                      ? curr
                      : prev
                  ).total_plays
                )}{" "}
                plays)
              </p>

              <p>
                <strong>Best Engagement:</strong>{" "}
                {
                  selectedArtists.reduce((prev, curr) => {
                    const prevEng = calculateEngagement(
                      prev.total_plays,
                      prev.followers
                    );
                    const currEng = calculateEngagement(
                      curr.total_plays,
                      curr.followers
                    );
                    return parseFloat(currEng) > parseFloat(prevEng)
                      ? curr
                      : prev;
                  }).artist_name
                }{" "}
                (
                {calculateEngagement(
                  selectedArtists.reduce((prev, curr) => {
                    const prevEng = calculateEngagement(
                      prev.total_plays,
                      prev.followers
                    );
                    const currEng = calculateEngagement(
                      curr.total_plays,
                      curr.followers
                    );
                    return parseFloat(currEng) > parseFloat(prevEng)
                      ? curr
                      : prev;
                  }).total_plays,
                  selectedArtists.reduce((prev, curr) => {
                    const prevEng = calculateEngagement(
                      prev.total_plays,
                      prev.followers
                    );
                    const currEng = calculateEngagement(
                      curr.total_plays,
                      curr.followers
                    );
                    return parseFloat(currEng) > parseFloat(prevEng)
                      ? curr
                      : prev;
                  }).followers
                )}
                x plays per follower)
              </p>

              {tracks.length > 0 && (
                <>
                  <p>
                    <strong>Deepest Catalog:</strong>{" "}
                    {
                      selectedArtists.reduce((prev, curr) => {
                        const prevMetrics = calculateCatalogMetrics(
                          prev.artist_name
                        );
                        const currMetrics = calculateCatalogMetrics(
                          curr.artist_name
                        );
                        return currMetrics.totalTracks > prevMetrics.totalTracks
                          ? curr
                          : prev;
                      }).artist_name
                    }{" "}
                    (
                    {
                      calculateCatalogMetrics(
                        selectedArtists.reduce((prev, curr) => {
                          const prevMetrics = calculateCatalogMetrics(
                            prev.artist_name
                          );
                          const currMetrics = calculateCatalogMetrics(
                            curr.artist_name
                          );
                          return currMetrics.totalTracks >
                            prevMetrics.totalTracks
                            ? curr
                            : prev;
                        }).artist_name
                      ).totalTracks
                    }{" "}
                    tracks)
                  </p>

                  <p>
                    <strong>Fastest Growing:</strong>{" "}
                    {
                      selectedArtists.reduce((prev, curr) => {
                        const prevTenure = calculateTenure(prev.member_since);
                        const currTenure = calculateTenure(curr.member_since);
                        if (!prevTenure) return curr;
                        if (!currTenure) return prev;
                        const prevRate =
                          parseInt(prev.followers) / prevTenure.months;
                        const currRate =
                          parseInt(curr.followers) / currTenure.months;
                        return currRate > prevRate ? curr : prev;
                      }).artist_name
                    }{" "}
                    (
                    {(() => {
                      const artist = selectedArtists.reduce((prev, curr) => {
                        const prevTenure = calculateTenure(prev.member_since);
                        const currTenure = calculateTenure(curr.member_since);
                        if (!prevTenure) return curr;
                        if (!currTenure) return prev;
                        const prevRate =
                          parseInt(prev.followers) / prevTenure.months;
                        const currRate =
                          parseInt(curr.followers) / currTenure.months;
                        return currRate > prevRate ? curr : prev;
                      });
                      const tenure = calculateTenure(artist.member_since);
                      return tenure
                        ? formatNumber(
                            Math.round(
                              parseInt(artist.followers) / tenure.months
                            )
                          )
                        : "0";
                    })()}{" "}
                    followers/month)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedArtists.length === 1 && (
        <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
          <p className="text-gray-400">
            Select at least one more artist to start comparing
          </p>
        </div>
      )}
    </div>
  );
};

export default ArtistComparisonTool;
