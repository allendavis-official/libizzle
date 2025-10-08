// lib/artistPageUtils.js - Helper functions specific to artist pages

export const calculateArtistInsights = (artist, tracks, allArtists) => {
  if (!artist || !tracks.length) return null;

  const totalTrackPlays = tracks.reduce(
    (sum, t) => sum + parseInt(t.plays || 0),
    0
  );
  const avgTrackPlays = totalTrackPlays / tracks.length;
  const topTrack = tracks.reduce(
    (prev, curr) =>
      parseInt(curr.plays || 0) > parseInt(prev.plays || 0) ? curr : prev,
    tracks[0]
  );

  // Calculate consistency
  const playValues = tracks.map((t) => parseInt(t.plays || 0));
  const variance =
    playValues.reduce((sum, val) => {
      const diff = val - avgTrackPlays;
      return sum + diff * diff;
    }, 0) / playValues.length;
  const stdDev = Math.sqrt(variance);
  const consistency =
    avgTrackPlays > 0 ? Math.max(0, 100 - (stdDev / avgTrackPlays) * 100) : 0;

  // Engagement rate
  const engagement = parseFloat(
    (parseInt(artist.total_plays) / parseInt(artist.followers)).toFixed(2)
  );

  // Compare to market average
  const avgFollowers =
    allArtists.reduce((sum, a) => sum + parseInt(a.followers || 0), 0) /
    allArtists.length;
  const vsMarket =
    ((parseInt(artist.followers) - avgFollowers) / avgFollowers) * 100;

  return {
    totalTracks: tracks.length,
    avgTrackPlays: Math.round(avgTrackPlays),
    topTrack,
    consistency: Math.round(consistency),
    engagement: isNaN(engagement) ? 0 : engagement,
    vsMarket: Math.round(vsMarket),
    totalTrackPlays,
  };
};

export const sortAndFilterTracks = (
  tracks,
  sortBy,
  viewFilter,
  avgTrackPlays
) => {
  let filtered = [...tracks];

  // Apply view filter
  if (viewFilter === "topPerformers" && avgTrackPlays) {
    filtered = filtered.filter(
      (t) => parseInt(t.plays || 0) > avgTrackPlays * 1.5
    );
  } else if (viewFilter === "underperforming" && avgTrackPlays) {
    filtered = filtered.filter(
      (t) => parseInt(t.plays || 0) < avgTrackPlays * 0.5
    );
  } else if (viewFilter === "recent") {
    filtered = filtered.filter((t) => {
      if (!t.release_date || t.release_date === "N/A") return false;
      try {
        const releaseDate = new Date(t.release_date);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return releaseDate >= sixMonthsAgo;
      } catch {
        return false;
      }
    });
  }

  // Apply sorting
  return filtered.sort((a, b) => {
    if (sortBy === "plays") {
      return parseInt(b.plays || 0) - parseInt(a.plays || 0);
    } else if (sortBy === "likes") {
      return parseInt(b.likes || 0) - parseInt(a.likes || 0);
    } else if (sortBy === "engagement") {
      return (
        parseFloat(b.engagement_rate || 0) - parseFloat(a.engagement_rate || 0)
      );
    } else if (sortBy === "playlist_adds") {
      return parseInt(b.playlist_adds || 0) - parseInt(a.playlist_adds || 0);
    } else if (sortBy === "recent") {
      if (
        !a.release_date ||
        a.release_date === "N/A" ||
        !b.release_date ||
        b.release_date === "N/A"
      )
        return 0;
      try {
        return new Date(b.release_date) - new Date(a.release_date);
      } catch {
        return 0;
      }
    } else if (sortBy === "oldest") {
      if (
        !a.release_date ||
        a.release_date === "N/A" ||
        !b.release_date ||
        b.release_date === "N/A"
      )
        return 0;
      try {
        return new Date(a.release_date) - new Date(b.release_date);
      } catch {
        return 0;
      }
    } else if (sortBy === "title") {
      return a.track_title.localeCompare(b.track_title);
    }
    return 0;
  });
};

export const getInsightText = (type, value, artistName) => {
  switch (type) {
    case "engagement":
      if (value > 10) {
        return `🔥 Exceptional engagement! ${value}x plays per follower is well above the 5x industry average.`;
      } else if (value > 5) {
        return `✅ Strong engagement at ${value}x plays per follower. Fans are highly active.`;
      } else if (value > 2) {
        return `⚠️ Moderate engagement at ${value}x. Consider strategies to boost fan interaction.`;
      } else {
        return `⚠️ Low engagement at ${value}x. Focus on building deeper fan connections.`;
      }

    case "consistency":
      if (value > 70) {
        return `🎯 Very consistent catalog (${value}/100). Tracks perform evenly - great for long-term growth.`;
      } else if (value > 50) {
        return `📊 Moderately consistent catalog (${value}/100). Mix of hits and building tracks.`;
      } else {
        return `🚀 Hit-driven catalog (${value}/100). You have clear standout tracks - leverage these for promotion!`;
      }

    case "marketPosition":
      if (value > 50) {
        return `👑 Top performer! You're ${value}% above market average. You're a market leader.`;
      } else if (value > 0) {
        return `📈 Above average by ${value}%. Strong positioning in the market.`;
      } else if (value > -30) {
        return `⚡ Emerging artist ${Math.abs(
          value
        )}% below average. High growth potential.`;
      } else {
        return `🌱 Early-stage artist. Focus on consistent releases and fan engagement.`;
      }

    default:
      return "";
  }
};
