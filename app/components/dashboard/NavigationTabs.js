// components/dashboard/NavigationTabs.js - MOBILE RESPONSIVE

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  trackCount,
}) {
  const tabs = [
    { id: "overview", label: "Overview", shortLabel: "Home" },
    { id: "artists", label: "Artists", shortLabel: "Artists" },
    {
      id: "tracks",
      label: `Hot Tracks${trackCount > 0 ? ` (${trackCount})` : ""}`,
      shortLabel: "Tracks",
    },
    { id: "compare", label: "🆚 Compare Artists", shortLabel: "🆚 Artists" },
    {
      id: "comparetracks",
      label: "🎵 Compare Tracks",
      shortLabel: "🎵 Tracks",
    },
    { id: "market", label: "📊 Market Intel", shortLabel: "📊 Market" },
    { id: "predictions", label: "🔮 Predictions", shortLabel: "🔮 Predict" },
  ];

  return (
    <div className="border-b border-white/10 bg-black/10 sticky top-[60px] sm:top-[84px] z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 sm:py-4 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-base ${
                activeTab === tab.id
                  ? "border-yellow-400 text-white font-semibold"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {/* Show short label on mobile, full label on desktop */}
              <span className="sm:hidden">{tab.shortLabel}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
