#!/usr/bin/env python3
"""
Update Latest Files Script
Copies the most recent CSV files to "latest" versions for production use
Run this after the scraper completes
"""

import os
import glob
import shutil
from datetime import datetime

def update_latest_files():
    """Copy newest CSV files to 'latest' versions"""
    data_dir = "data"
    
    if not os.path.exists(data_dir):
        print(f"❌ Error: {data_dir} directory not found")
        return False
    
    print("=" * 60)
    print("📂 Updating Latest CSV Files")
    print("=" * 60)
    
    # Find latest artist file
    artist_files = glob.glob(f"{data_dir}/audiomack_artists_*.csv")
    artist_files = [f for f in artist_files if "latest" not in f]
    
    if artist_files:
        # Sort by modification time (newest first)
        latest_artist = max(artist_files, key=os.path.getctime)
        dest_artist = f"{data_dir}/audiomack_artists_latest.csv"
        shutil.copy2(latest_artist, dest_artist)
        print(f"\n✅ Artist File Updated:")
        print(f"   Source: {os.path.basename(latest_artist)}")
        print(f"   Dest:   audiomack_artists_latest.csv")
        print(f"   Size:   {os.path.getsize(dest_artist):,} bytes")
    else:
        print("\n⚠️  No artist CSV files found")
    
    # Find latest tracks file
    track_files = glob.glob(f"{data_dir}/audiomack_tracks_*.csv")
    track_files = [f for f in track_files if "latest" not in f]
    
    if track_files:
        latest_track = max(track_files, key=os.path.getctime)
        dest_track = f"{data_dir}/audiomack_tracks_latest.csv"
        shutil.copy2(latest_track, dest_track)
        print(f"\n✅ Track File Updated:")
        print(f"   Source: {os.path.basename(latest_track)}")
        print(f"   Dest:   audiomack_tracks_latest.csv")
        print(f"   Size:   {os.path.getsize(dest_track):,} bytes")
    else:
        print("\n⚠️  No track CSV files found")
    
    # Optional: Clean up old files (keep last 30 days)
    print("\n" + "=" * 60)
    cleanup_old_files(data_dir, days=30)
    
    return True

def cleanup_old_files(data_dir, days=30):
    """Remove CSV files older than specified days"""
    cutoff_time = datetime.now().timestamp() - (days * 86400)
    
    all_csv_files = glob.glob(f"{data_dir}/audiomack_*.csv")
    all_csv_files = [f for f in all_csv_files if "latest" not in f]
    
    removed_count = 0
    removed_size = 0
    
    for file_path in all_csv_files:
        if os.path.getctime(file_path) < cutoff_time:
            try:
                file_size = os.path.getsize(file_path)
                os.remove(file_path)
                removed_count += 1
                removed_size += file_size
                print(f"🗑️  Removed: {os.path.basename(file_path)} ({file_size:,} bytes)")
            except Exception as e:
                print(f"❌ Error removing {file_path}: {e}")
    
    if removed_count > 0:
        print(f"\n✅ Cleaned up {removed_count} old file(s)")
        print(f"   Freed up: {removed_size:,} bytes ({removed_size / 1024 / 1024:.2f} MB)")
    else:
        print("ℹ️  No old files to clean up (all files < {days} days old)")

def show_current_files():
    """Display current files in data directory"""
    data_dir = "data"
    
    print("\n" + "=" * 60)
    print("📊 Current Data Files:")
    print("=" * 60)
    
    all_files = glob.glob(f"{data_dir}/*.csv")
    all_files.sort(key=os.path.getctime, reverse=True)
    
    if not all_files:
        print("No CSV files found")
        return
    
    for file_path in all_files:
        filename = os.path.basename(file_path)
        size = os.path.getsize(file_path)
        mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
        
        # Highlight "latest" files
        marker = "⭐" if "latest" in filename else "  "
        
        print(f"{marker} {filename}")
        print(f"   Size: {size:,} bytes | Modified: {mtime.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    print("\n")
    success = update_latest_files()
    show_current_files()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Update complete!")
        print("\nNext steps:")
        print("1. Run: git add data/audiomack_*_latest.csv")
        print("2. Run: git commit -m 'Update latest CSV files'")
        print("3. Run: git push")
    else:
        print("❌ Update failed!")
    print("=" * 60)
    print("\n")