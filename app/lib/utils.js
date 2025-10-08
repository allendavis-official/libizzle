// lib/utils.js - All helper functions in one place

export const formatNumber = (num) => {
  const n = parseInt(num);
  if (isNaN(n)) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

export const calculateEngagement = (plays, followers) => {
  const p = parseInt(plays);
  const f = parseInt(followers);
  if (f === 0 || isNaN(f) || isNaN(p)) return 0;
  return (p / f).toFixed(2);
};

export const parseTrackNumber = (value) => {
  if (!value || value === "N/A" || value === "undefined" || value === "null") {
    return 0;
  }

  const str = String(value).replace(/,/g, "").trim();
  const num = parseInt(str);

  return isNaN(num) ? 0 : num;
};

export const calculateTrackStats = (tracks) => {
  if (!tracks || tracks.length === 0) {
    return {
      totalPlays: 0,
      avgPlays: 0,
      avgEngagement: 0,
    };
  }

  let totalPlays = 0;
  let totalEngagement = 0;
  let validEngagementCount = 0;

  tracks.forEach((track) => {
    totalPlays += parseTrackNumber(track.plays);

    const engagement = parseFloat(track.engagement_rate);
    if (!isNaN(engagement)) {
      totalEngagement += engagement;
      validEngagementCount++;
    }
  });

  return {
    totalPlays,
    avgPlays: Math.round(totalPlays / tracks.length),
    avgEngagement:
      validEngagementCount > 0
        ? (totalEngagement / validEngagementCount).toFixed(2)
        : "0.00",
  };
};

export const calculateTenure = (memberSince) => {
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
      joinDate: joinDate,
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

export const getTenureInsight = (tenure, followers, totalPlays) => {
  if (!tenure) return null;

  const followersPerMonth = parseInt(followers) / tenure.months || 0;

  let category = "Veteran";
  let insight = "";
  let color = "text-blue-400";

  if (tenure.months < 6) {
    category = "Newcomer";
    color = "text-green-400";
    if (followersPerMonth > 500) {
      insight = `🚀 Explosive start! Gaining ${Math.round(
        followersPerMonth
      )} followers/month in just ${tenure.formatted} on platform.`;
    } else {
      insight = `🌱 New to Audiomack (${tenure.formatted}). Building foundation.`;
    }
  } else if (tenure.months < 12) {
    category = "Emerging";
    color = "text-purple-400";
    if (followersPerMonth > 300) {
      insight = `📈 Strong growth trajectory after ${
        tenure.formatted
      }. Averaging ${Math.round(followersPerMonth)} followers/month.`;
    } else {
      insight = `⚡ ${tenure.formatted} on platform. Steady progress with room to accelerate.`;
    }
  } else if (tenure.years < 3) {
    category = "Established";
    color = "text-yellow-400";
    if (followersPerMonth > 200) {
      insight = `💪 Consistent performer over ${tenure.formatted}. ${Math.round(
        followersPerMonth
      )} followers/month shows sustained growth.`;
    } else {
      insight = `📊 ${
        tenure.formatted
      } veteran. Solid catalog foundation with ${formatNumber(
        followers
      )} followers.`;
    }
  } else {
    category = "Veteran";
    color = "text-orange-400";
    if (followersPerMonth > 100) {
      insight = `👑 Platform OG (${
        tenure.formatted
      }). Still growing at ${Math.round(
        followersPerMonth
      )} followers/month - rare staying power!`;
    } else {
      insight = `🏆 ${
        tenure.formatted
      } on Audiomack. Proven longevity with ${formatNumber(
        followers
      )} loyal fans.`;
    }
  }

  return {
    category,
    insight,
    color,
    followersPerMonth: Math.round(followersPerMonth),
  };
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
          : `${diffDays}d ago`,
      isRecent: diffDays < 30,
      isOld: diffYears > 2,
    };
  } catch {
    return null;
  }
};

export const createSlug = (text) => {
  return encodeURIComponent(text.toLowerCase().replace(/\s+/g, "-"));
};
