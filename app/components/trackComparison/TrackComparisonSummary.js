// components/trackComparison/TrackComparisonSummary.js

import React from "react";
import {
  formatNumber,
  calculateTrackAge,
  calculateTrackMetrics,
  getArtistTracks,
} from "../../lib/trackComparisonUtils";

export default function TrackComparisonSummary({ selectedTracks, allTracks }) {
  // Find winners for each category
  const mostPlays = selectedTracks.reduce((prev, curr) =>
    parseInt(curr.plays || 0) > parseInt(prev.plays || 0) ? curr : prev
  );

  const bestEngagement = selectedTracks.reduce((prev, curr) =>
    parseFloat(curr.engagement_rate || 0) >
    parseFloat(prev.engagement_rate || 0)
      ? curr
      : prev
  );

  const newestTrack = selectedTracks.reduce((prev, curr) => {
    const prevAge = calculateTrackAge(prev.release_date);
    const currAge = calculateTrackAge(curr.release_date);
    if (!prevAge) return curr;
    if (!currAge) return prev;
    return currAge.days < prevAge.days ? curr : prev;
  });

  const oldestTrack = selectedTracks.reduce((prev, curr) => {
    const prevAge = calculateTrackAge(prev.release_date);
    const currAge = calculateTrackAge(curr.release_date);
    if (!prevAge) return curr;
    if (!currAge) return prev;
    return currAge.days > prevAge.days ? curr : prev;
  });

  const bestCatalogPerformer = selectedTracks.reduce((prev, curr) => {
    const prevArtistTracks = getArtistTracks(prev.artist_name, allTracks);
    const currArtistTracks = getArtistTracks(curr.artist_name, allTracks);
    const prevMetrics = calculateTrackMetrics(
      prev,
      prevArtistTracks,
      allTracks
    );
    const currMetrics = calculateTrackMetrics(
      curr,
      currArtistTracks,
      allTracks
    );
    if (!prevMetrics) return curr;
    if (!currMetrics) return prev;
    return currMetrics.vsArtistAvg > prevMetrics.vsArtistAvg ? curr : prev;
  });

  const bestMarketPerformer = selectedTracks.reduce((prev, curr) => {
    const prevArtistTracks = getArtistTracks(prev.artist_name, allTracks);
    const currArtistTracks = getArtistTracks(curr.artist_name, allTracks);
    const prevMetrics = calculateTrackMetrics(
      prev,
      prevArtistTracks,
      allTracks
    );
    const currMetrics = calculateTrackMetrics(
      curr,
      currArtistTracks,
      allTracks
    );
    if (!prevMetrics) return curr;
    if (!currMetrics) return prev;
    return currMetrics.vsMarketAvg > prevMetrics.vsMarketAvg ? curr : prev;
  });

  return (
    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
      <h4 className="font-semibold text-lg mb-4">📊 Comparison Summary</h4>
      <div className="space-y-2 text-sm">
        {/* Most Plays */}
        <p>
          <strong>Most Plays:</strong> {mostPlays.track_title} by{" "}
          {mostPlays.artist_name} ({formatNumber(mostPlays.plays)} plays)
        </p>

        {/* Best Engagement */}
        <p>
          <strong>Best Engagement:</strong> {bestEngagement.track_title} by{" "}
          {bestEngagement.artist_name} ({bestEngagement.engagement_rate}%
          engagement rate)
        </p>

        {/* Best Catalog Performance */}
        {(() => {
          const artistTracks = getArtistTracks(
            bestCatalogPerformer.artist_name,
            allTracks
          );
          const metrics = calculateTrackMetrics(
            bestCatalogPerformer,
            artistTracks,
            allTracks
          );
          return (
            metrics && (
              <p>
                <strong>Best vs Artist Catalog:</strong>{" "}
                {bestCatalogPerformer.track_title} by{" "}
                {bestCatalogPerformer.artist_name} (+{metrics.vsArtistAvg}%
                above artist average)
              </p>
            )
          );
        })()}

        {/* Best Market Performance */}
        {(() => {
          const artistTracks = getArtistTracks(
            bestMarketPerformer.artist_name,
            allTracks
          );
          const metrics = calculateTrackMetrics(
            bestMarketPerformer,
            artistTracks,
            allTracks
          );
          return (
            metrics && (
              <p>
                <strong>Best vs Market:</strong>{" "}
                {bestMarketPerformer.track_title} by{" "}
                {bestMarketPerformer.artist_name} (+{metrics.vsMarketAvg}% above
                market average)
              </p>
            )
          );
        })()}

        {/* Newest Track */}
        {(() => {
          const age = calculateTrackAge(newestTrack.release_date);
          return (
            age && (
              <p>
                <strong>Newest Release:</strong> {newestTrack.track_title} by{" "}
                {newestTrack.artist_name} ({age.formatted})
              </p>
            )
          );
        })()}

        {/* Oldest Track */}
        {(() => {
          const age = calculateTrackAge(oldestTrack.release_date);
          return (
            age &&
            newestTrack.track_url !== oldestTrack.track_url && (
              <p>
                <strong>Oldest Track:</strong> {oldestTrack.track_title} by{" "}
                {oldestTrack.artist_name} ({age.formatted})
              </p>
            )
          );
        })()}

        {/* Most Liked */}
        {(() => {
          const mostLiked = selectedTracks.reduce((prev, curr) =>
            parseInt(curr.likes || 0) > parseInt(prev.likes || 0) ? curr : prev
          );
          return (
            <p>
              <strong>Most Liked:</strong> {mostLiked.track_title} by{" "}
              {mostLiked.artist_name} ({formatNumber(mostLiked.likes)} likes)
            </p>
          );
        })()}
      </div>
    </div>
  );
}
