// components/dashboard/NavigationTabs.js

export default function NavigationTabs({
  activeTab,
  setActiveTab,
  trackCount,
}) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "artists", label: "Artists" },
    {
      id: "tracks",
      label: `Hot Tracks${trackCount > 0 ? ` (${trackCount})` : ""}`,
    },
    { id: "compare", label: "🆚 Compare Artists" },
    { id: "comparetracks", label: "🎵 Compare Tracks" },
    { id: "market", label: "📊 Market Intelligence" },
    { id: "predictions", label: "🔮 Predictions" },
  ];

  return (
    <div className="border-b border-white/10 bg-black/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-yellow-400 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
