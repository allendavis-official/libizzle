// lib/trackComparisonUtils.js - Utilities for Track Comparison Tool

export const formatNumber = (num) => {
  const n = parseInt(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

export const calculateTrackAge = (releaseDate) => {
  if (!releaseDate || releaseDate === "N/A") return null;

  try {
    const release = new Date(releaseDate);
    const now = new Date();
    const diffTime = Math.abs(now - release);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    return {
      days: diffDays,
      months: diffMonths,
      years: diffYears,
      releaseDate: release,
      formatted:
        diffYears > 0
          ? `${diffYears}y ago`
          : diffMonths > 0
          ? `${diffMonths}mo ago`
          : diffDays > 7
          ? `${Math.floor(diffDays / 7)}w ago`
          : diffDays <= 1
          ? "Today"
          : `${diffDays}d ago`,
      isRecent: diffDays < 30,
      isOld: diffYears > 2,
    };
  } catch {
    return null;
  }
};

export const getAgeCategory = (trackAge) => {
  if (!trackAge) return { label: "Unknown", color: "text-gray-400" };

  if (trackAge.days <= 30) {
    return { label: "New Release", color: "text-green-400" };
  } else if (trackAge.months <= 6) {
    return { label: "Recent", color: "text-blue-400" };
  } else if (trackAge.years < 2) {
    return { label: "Established", color: "text-purple-400" };
  } else {
    return { label: "Classic", color: "text-orange-400" };
  }
};

export const calculateTrackMetrics = (track, artistTracks, allTracks) => {
  if (!track || !artistTracks || !allTracks) return null;

  const trackPlays = parseInt(track.plays || 0);
  const trackLikes = parseInt(track.likes || 0);
  const trackReposts = parseInt(track.reposts || 0);

  // Artist catalog metrics
  const artistAvgPlays =
    artistTracks.reduce((sum, t) => sum + parseInt(t.plays || 0), 0) /
    (artistTracks.length || 1);

  // Market metrics
  const marketAvgPlays =
    allTracks.reduce((sum, t) => sum + parseInt(t.plays || 0), 0) /
    (allTracks.length || 1);

  // Catalog ranking
  const sortedArtistTracks = [...artistTracks].sort(
    (a, b) => parseInt(b.plays || 0) - parseInt(a.plays || 0)
  );
  const catalogRank =
    sortedArtistTracks.findIndex((t) => t.track_url === track.track_url) + 1;

  // Performance percentages
  const vsArtistAvg = ((trackPlays - artistAvgPlays) / artistAvgPlays) * 100;
  const vsMarketAvg = ((trackPlays - marketAvgPlays) / marketAvgPlays) * 100;

  // Plays per day (if recent)
  const trackAge = calculateTrackAge(track.release_date);
  const playsPerDay =
    trackAge && trackAge.days > 0 ? trackPlays / trackAge.days : 0;

  return {
    plays: trackPlays,
    likes: trackLikes,
    reposts: trackReposts,
    playlistAdds: parseInt(track.playlist_adds || 0),
    engagementRate: parseFloat(track.engagement_rate || 0),
    artistAvgPlays: Math.round(artistAvgPlays),
    marketAvgPlays: Math.round(marketAvgPlays),
    catalogRank,
    totalArtistTracks: artistTracks.length,
    vsArtistAvg: Math.round(vsArtistAvg),
    vsMarketAvg: Math.round(vsMarketAvg),
    playsPerDay: Math.round(playsPerDay),
    trackAge,
  };
};

export const getTrackWinner = (metric, selectedTracks, allTracks) => {
  if (!selectedTracks || selectedTracks.length < 2) return null;

  const validTracks = selectedTracks.filter((t) => t && t.track_url);
  if (validTracks.length < 2) return null;

  const values = validTracks.map((track) => {
    if (metric === "plays") return parseInt(track.plays || 0);
    if (metric === "likes") return parseInt(track.likes || 0);
    if (metric === "reposts") return parseInt(track.reposts || 0);
    if (metric === "playlist_adds") return parseInt(track.playlist_adds || 0);
    if (metric === "engagement") return parseFloat(track.engagement_rate || 0);

    // For catalog performance, we need to calculate
    if (metric === "catalogPerformance") {
      const artistTracks = allTracks.filter(
        (t) => t.artist_name === track.artist_name
      );
      const metrics = calculateTrackMetrics(track, artistTracks, allTracks);
      return metrics ? metrics.vsArtistAvg : -Infinity;
    }

    // For age comparison (newest = winner)
    if (metric === "newest") {
      const age = calculateTrackAge(track.release_date);
      return age ? -age.days : Infinity; // Negative so newer = higher value
    }

    return 0;
  });

  const maxValue = Math.max(...values);
  const winnersCount = values.filter((v) => v === maxValue).length;

  if (winnersCount > 1) return "TIE";

  const winnerIndex = values.indexOf(maxValue);
  if (winnerIndex === -1 || winnerIndex >= validTracks.length) return null;

  return validTracks[winnerIndex].track_url;
};

export const getArtistTracks = (artistName, allTracks) => {
  return allTracks.filter((t) => t.artist_name === artistName);
};
