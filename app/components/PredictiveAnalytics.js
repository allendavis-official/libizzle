"use client";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Zap,
  Award,
  Target,
  Calendar,
  AlertCircle,
  Trophy,
  Flame,
} from "lucide-react";

const PredictiveAnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 animate-pulse mx-auto mb-4 text-purple-400" />
          <p className="text-gray-300">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md rounded-xl p-8 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-8 h-8 text-yellow-400" />
          <h2 className="text-3xl font-bold">Predictive Analytics</h2>
        </div>
        <p className="text-gray-300 text-lg mb-6">
          AI-powered forecasting and breakout detection to help you discover the
          next big artist before they blow up.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <Target className="w-6 h-6 text-green-400 mb-2" />
            <h3 className="font-semibold mb-1">Growth Forecasting</h3>
            <p className="text-sm text-gray-400">
              Predict when artists will hit follower milestones
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <Flame className="w-6 h-6 text-orange-400 mb-2" />
            <h3 className="font-semibold mb-1">Breakout Detection</h3>
            <p className="text-sm text-gray-400">
              Alert when velocity spikes above normal
            </p>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
            <h3 className="font-semibold mb-1">A&R Scoring</h3>
            <p className="text-sm text-gray-400">
              0-100 composite signability score
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-3">Setup Required</h3>
            <p className="text-gray-300 mb-4">
              To unlock predictive analytics, you need at least 2-3 data points
              collected over time.
            </p>

            <div className="space-y-3">
              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  Step 1: Collect Historical Data
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Run your scraper daily for 7+ days:
                </p>
                <code className="text-xs bg-black/40 px-3 py-1 rounded block">
                  python audiomack_scraper_v3_tracks.py
                </code>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  Step 2: Generate Forecasts
                </h4>
                <p className="text-sm text-gray-400 mb-2">
                  Run prediction scripts:
                </p>
                <code className="text-xs bg-black/40 px-3 py-1 rounded block mb-1">
                  python growth_forecasting.py
                </code>
                <code className="text-xs bg-black/40 px-3 py-1 rounded block mb-1">
                  python breakout_detection.py
                </code>
                <code className="text-xs bg-black/40 px-3 py-1 rounded block">
                  python ar_scoring.py
                </code>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Step 3: View Predictions</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Results will be saved to JSON files:
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>- growth_forecasts_*.json</li>
                  <li>- breakout_alerts_*.json</li>
                  <li>- ar_scores_*.json</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold">Growth Forecasting</h3>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            Predict when artists will reach key milestones using historical
            growth patterns.
          </p>

          <div className="space-y-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm font-semibold mb-1">Example Output:</p>
              <div className="text-xs text-green-400">
                <p>SIO: Will hit 150K followers</p>
                <p>by January 15, 2026</p>
                <p>Confidence: 85%</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ Milestone predictions</p>
              <p>✓ Confidence scores</p>
              <p>✓ Growth rate analysis</p>
              <p>✓ Linear and exponential models</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-semibold">Breakout Detection</h3>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            Identify when artists experience viral growth or momentum spikes.
          </p>

          <div className="space-y-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm font-semibold mb-1">Example Alert:</p>
              <div className="text-xs text-orange-400">
                <p>BREAKOUT: Nahj</p>
                <p>Velocity: +340% (3.4x faster)</p>
                <p>Status: EXPLOSIVE</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ Real-time velocity tracking</p>
              <p>✓ 5 intensity levels</p>
              <p>✓ Baseline comparison</p>
              <p>✓ Multi-metric analysis</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold">A&R Scoring</h3>
          </div>

          <p className="text-sm text-gray-300 mb-4">
            Composite 0-100 score ranking artists by signability across multiple
            factors.
          </p>

          <div className="space-y-3">
            <div className="bg-black/20 rounded-lg p-3">
              <p className="text-sm font-semibold mb-1">Score Breakdown:</p>
              <div className="text-xs text-yellow-400 space-y-1">
                <p>Growth: 30% weight</p>
                <p>Engagement: 25%</p>
                <p>Catalog: 20%</p>
                <p>Consistency: 15%</p>
                <p>Market Position: 10%</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>✓ 85+: MUST SIGN</p>
              <p>✓ 75-84: HOT PROSPECT</p>
              <p>✓ 65-74: STRONG POTENTIAL</p>
              <p>✓ 50-64: WATCH LIST</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
        <h3 className="text-xl font-semibold mb-4">Why This is Valuable</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-green-400">
              For Labels and A&Rs:
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Find artists before they blow up</li>
              <li>- Data-driven signing decisions</li>
              <li>- Reduce risk with confidence scores</li>
              <li>- Competitive intelligence advantage</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-green-400">
              For Investors:
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Predict future value of artists</li>
              <li>- Track momentum in real-time</li>
              <li>- Quantify investment risk</li>
              <li>- Portfolio optimization</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm text-center">
            <strong className="text-green-400">Premium Feature:</strong>{" "}
            Predictive analytics typically sell for $99-$499/month in music
            industry platforms
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold mb-4">Implementation Timeline</h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold">Day 1-7: Data Collection</p>
              <p className="text-sm text-gray-400">
                Run daily scrapes to build historical baseline
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold">Day 8: First Predictions</p>
              <p className="text-sm text-gray-400">
                Generate growth forecasts and A&R scores
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold">Day 14+: Breakout Detection</p>
              <p className="text-sm text-gray-400">
                2+ weeks of data enables accurate velocity analysis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">4</span>
            </div>
            <div>
              <p className="font-semibold">
                Day 30+: High Confidence Forecasts
              </p>
              <p className="text-sm text-gray-400">
                1 month of data equals 80%+ prediction confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
        <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>

        <div className="space-y-4">
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Files You Need:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ growth_forecasting.py</li>
              <li>✓ breakout_detection.py</li>
              <li>✓ ar_scoring.py</li>
            </ul>
          </div>

          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Quick Start Commands:</h4>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-gray-400 mb-1">
                  1. Run daily scrapes (Day 1-7):
                </p>
                <code className="bg-black/40 px-2 py-1 rounded block">
                  python audiomack_scraper_v3_tracks.py
                </code>
              </div>
              <div>
                <p className="text-gray-400 mb-1">
                  2. Generate predictions (Day 8+):
                </p>
                <code className="bg-black/40 px-2 py-1 rounded block mb-1">
                  python growth_forecasting.py
                </code>
                <code className="bg-black/40 px-2 py-1 rounded block mb-1">
                  python breakout_detection.py
                </code>
                <code className="bg-black/40 px-2 py-1 rounded block">
                  python ar_scoring.py
                </code>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 text-center">
            <p className="text-sm">
              Pro Tip: Set up automation with GitHub Actions or cron jobs for
              daily execution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;
