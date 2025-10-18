// components/dashboard/NavigationTabs.js - MOBILE RESPONSIVE

import {
  Home,
  Users,
  Music,
  GitCompare,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  trackCount,
}) {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      shortLabel: "Home",
      icon: Home,
    },
    {
      id: "artists",
      label: "Artists",
      shortLabel: "Artists",
      icon: Users,
    },
    {
      id: "tracks",
      label: `Hot Tracks${trackCount > 0 ? ` (${trackCount})` : ""}`,
      shortLabel: "Tracks",
      icon: Music,
    },
    {
      id: "compare",
      label: "Compare Artists",
      shortLabel: "Compare",
      icon: GitCompare,
    },
    {
      id: "comparetracks",
      label: "Compare Tracks",
      shortLabel: "Tracks",
      icon: Music,
    },
    {
      id: "market",
      label: "Market Intel",
      shortLabel: "Market",
      icon: BarChart3,
    },
    {
      id: "predictions",
      label: "Predictions",
      shortLabel: "Predict",
      icon: TrendingUp,
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="border-b border-white/10 bg-black/10 sticky top-[60px] sm:top-[84px] z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 transition-all duration-200 whitespace-nowrap text-xs sm:text-base flex items-center gap-1 sm:gap-2 min-w-[50px] sm:min-w-0 ${
                  activeTab === tab.id
                    ? "border-yellow-400 text-white font-semibold bg-white/5"
                    : "border-transparent text-gray-400 hover:text-white hover:bg-white/2"
                }`}
              >
                {/* Icon only on mobile */}
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />

                {/* Text label - hidden on mobile, shown on desktop */}
                <span className="hidden sm:inline">
                  {tab.id === "tracks" && trackCount > 0
                    ? `Hot Tracks (${trackCount})`
                    : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
