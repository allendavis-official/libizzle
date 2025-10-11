"""
Audiomack Artist & Track Data Scraper - V5 COMPLETE
Collects detailed metrics for both artists and individual tracks
INCLUDES: Member Since date and correct Release Date extraction
"""

import csv
import time
from datetime import datetime
from playwright.sync_api import sync_playwright
import json
import re

# List of Liberian artists to track
ARTISTS = [
   "https://audiomack.com/vibeking-sio",
    'https://audiomack.com/nahj',
    'https://audiomack.com/spizeofficial',
    'https://audiomack.com/will-flash',
    'https://audiomack.com/stunn',
    # 'https://audiomack.com/elvissaywon226',
    # 'https://audiomack.com/fluxiimusic',
    # 'https://audiomack.com/teddyride',
    # 'https://audiomack.com/Jaredo',
    # 'https://audiomack.com/troublecoming',
    # 'https://audiomack.com/jzyno',
    # 'https://audiomack.com/cralorboi_cic',
    # 'https://audiomack.com/mccaro',
    # 'https://audiomack.com/jboydeprophet-1',
    # 'https://audiomack.com/christoph-the-change',
    # 'https://audiomack.com/brickson_',
    # 'https://audiomack.com/barsee-mocopala-kiloda',
    # 'https://audiomack.com/mr-church1',
    # 'https://audiomack.com/natif',
    # 'https://audiomack.com/LilMore',
    # 'https://audiomack.com/writerman_willy',
    # 'https://audiomack.com/kpanto_',
    # 'https://audiomack.com/boifattyofficial',
    # 'https://audiomack.com/buckyraw',
    # 'https://audiomack.com/kobazziee',
    # 'https://audiomack.com/jslughtofficial',
    # 'https://audiomack.com/j-rap-',
    # 'https://audiomack.com/nuchie-meek-',
    # 'https://audiomack.com/KELLz',
    # 'https://audiomack.com/Fazari',


    # Add more artist URLs here
]

# Configuration
MAX_TRACKS_PER_ARTIST = 0  # Set to 0 to scrape ALL tracks, or set a number (e.g., 20) to limit
SCRAPE_FULL_CATALOG = True  # Set to True to get complete catalog from /songs page

def extract_number(text):
    """Extract numbers from text like '1.2K', '500', '1M' etc."""
    if not text or text == "N/A":
        return "N/A"
    
    text = text.replace(',', '').strip()
    
    match = re.search(r'([\d.]+)\s*([KMB]?)', text, re.IGNORECASE)
    if match:
        num = match.group(1)
        suffix = match.group(2).upper()
        
        if suffix == 'K':
            return str(int(float(num) * 1000))
        elif suffix == 'M':
            return str(int(float(num) * 1000000))
        elif suffix == 'B':
            return str(int(float(num) * 1000000000))
        else:
            return num
    
    return text

def scrape_track_page(page, track_url, artist_name):
    """
    Scrape detailed data from an individual track page
    FIXED: Extracts correct release date from track page (not artist join date)
    """
    try:
        full_url = f"https://audiomack.com{track_url}" if not track_url.startswith('http') else track_url
        
        print(f"    🎵 Scraping track: {full_url}")
        page.goto(full_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        
        all_text = page.inner_text('body')
        
        # Extract track title - try multiple methods
        track_title = "Unknown"
        try:
            # Method 1: Try h1
            if page.locator('h1').count() > 0:
                h1_text = page.locator('h1').first.inner_text().strip()
                if h1_text and h1_text != "":
                    track_title = h1_text
            
            # Method 2: Try page title
            if track_title == "Unknown" or len(track_title) < 2:
                try:
                    title = page.title()
                    # Track titles are usually "Artist Name - Track Title | Audiomack"
                    if ' - ' in title:
                        parts = title.split(' - ')
                        if len(parts) > 1:
                            track_title = parts[1].split('|')[0].strip()
                except:
                    pass
            
            # Method 3: Extract from URL
            if track_title == "Unknown" or len(track_title) < 2:
                # URL format: /artist/song/song-name
                url_parts = full_url.rstrip('/').split('/')
                if len(url_parts) > 0:
                    track_slug = url_parts[-1]
                    track_title = track_slug.replace('-', ' ').title()
                    
        except:
            # Fallback: use URL slug
            try:
                url_parts = full_url.rstrip('/').split('/')
                track_title = url_parts[-1].replace('-', ' ').title()
            except:
                pass
        
        # Extract play count - be very specific to avoid confusion with Playlist Adds
        plays = "N/A"
        play_patterns = [
            r'([\d,.KMB]+)\s*[Tt]otal\s*[Pp]lays?',  # Match "Total Plays" specifically
            r'[Tt]otal\s*[Pp]lays?\s*[:\-]?\s*([\d,.KMB]+)',
            r'(?<!Playlist\s)(?<!playlist\s)([\d,.KMB]+)\s*[Pp]lays?(?!\s*Adds)',  # Negative lookbehind/ahead
        ]
        
        # First try to find "Total Plays" explicitly
        for pattern in play_patterns[:2]:
            match = re.search(pattern, all_text, re.IGNORECASE)
            if match:
                plays = extract_number(match.group(1))
                print(f"      Found 'Total Plays': {plays}")
                break
        
        # If still not found, look for just "Plays" but exclude "Playlist Adds"
        if plays == "N/A":
            # Split text into lines and look for the metric rows
            lines = all_text.split('\n')
            for i, line in enumerate(lines):
                # Look for a line that says "Plays" (not "Playlist Adds")
                if 'Plays' in line and 'Playlist' not in line and 'Added' not in line:
                    # The number might be on the same line or previous line
                    combined = lines[max(0, i-1):i+2]
                    for check_line in combined:
                        match = re.search(r'([\d,.KMB]+)', check_line)
                        if match:
                            potential_plays = extract_number(match.group(1))
                            # Sanity check: plays should typically be larger than likes
                            if potential_plays != "N/A":
                                plays = potential_plays
                                print(f"      Found plays from context: {plays}")
                                break
                    if plays != "N/A":
                        break
        
        # Extract likes (favorites)
        likes = "N/A"
        like_patterns = [
            r'([\d,.KMB]+)\s*[Ff]avorites?',  # Audiomack might call it "Favorites"
            r'([\d,.KMB]+)\s*[Ll]ikes?',
            r'[Ff]avorites?\s*[:\-]?\s*([\d,.KMB]+)',
            r'[Ll]ikes?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        for pattern in like_patterns:
            match = re.search(pattern, all_text)
            if match:
                likes = extract_number(match.group(1))
                print(f"      Found likes/favorites: {likes}")
                break
        
        # Extract playlist adds separately (don't confuse with plays)
        playlist_adds = "N/A"
        playlist_patterns = [
            r'([\d,.KMB]+)\s*[Pp]laylist\s*[Aa]dds?',
            r'[Pp]laylist\s*[Aa]dds?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        for pattern in playlist_patterns:
            match = re.search(pattern, all_text)
            if match:
                playlist_adds = extract_number(match.group(1))
                print(f"      Found playlist adds: {playlist_adds}")
                break
        
        # Extract reposts/shares
        reposts = "N/A"
        repost_patterns = [
            r'([\d,.KMB]+)\s*[Rr]eposts?',
            r'([\d,.KMB]+)\s*[Ss]hares?',
            r'[Rr]eposts?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        for pattern in repost_patterns:
            match = re.search(pattern, all_text)
            if match:
                reposts = extract_number(match.group(1))
                break
        
        # 🔧 FIXED: Extract actual release date from the correct element
        release_date = "N/A"
        try:
            # Method 1: Try to find the specific release date element
            release_date_selector = 'li.SinglePageMusicCardInfo-row:has-text("Release Date") .SinglePageMusicCardInfo-value span span'
            if page.locator(release_date_selector).count() > 0:
                release_date = page.locator(release_date_selector).first.inner_text().strip()
                print(f"      Found release date (Method 1): {release_date}")
            
            # Method 2: Try alternative selector
            if release_date == "N/A":
                alt_selector = '.SinglePageMusicCardInfo-row .TooltipTitle span'
                elements = page.locator(alt_selector).all()
                for element in elements:
                    text = element.inner_text().strip()
                    # Check if it looks like a date (has month and year)
                    if any(month in text for month in ['January', 'February', 'March', 'April', 'May', 'June', 
                                                        'July', 'August', 'September', 'October', 'November', 'December']):
                        release_date = text
                        print(f"      Found release date (Method 2): {release_date}")
                        break
            
            # Method 3: Search in the page text for "Release Date:" pattern
            if release_date == "N/A":
                lines = all_text.split('\n')
                for i, line in enumerate(lines):
                    if 'Release Date' in line or 'release date' in line.lower():
                        # Check next few lines for date
                        for j in range(i, min(i+5, len(lines))):
                            check_line = lines[j]
                            # Look for date pattern
                            date_match = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}', check_line, re.IGNORECASE)
                            if date_match:
                                release_date = date_match.group(0)
                                print(f"      Found release date (Method 3): {release_date}")
                                break
                        if release_date != "N/A":
                            break
                            
        except Exception as e:
            print(f"      Could not extract release date: {e}")
        
        track_data = {
            'artist_name': artist_name,
            'track_title': track_title,
            'track_url': full_url,
            'plays': plays,
            'likes': likes,
            'reposts': reposts,
            'playlist_adds': playlist_adds,
            'release_date': release_date,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        print(f"      ✓ Plays: {plays} | Likes: {likes} | Playlist Adds: {playlist_adds} | Released: {release_date}")
        return track_data
        
    except Exception as e:
        print(f"      ✗ Error scraping track: {str(e)}")
        return None

def scrape_artist_page(page, url):
    """
    Scrape data from artist page and their top tracks
    NEW: Includes Member Since date extraction
    """
    print(f"\n🎵 Scraping: {url}")
    
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(5)
        
        try:
            page.wait_for_selector('h1', timeout=10000)
        except:
            print("  ⚠️ Page loaded slowly, continuing anyway...")
        
        all_text = page.inner_text('body')
        
        # Extract artist name - use the actual display name from sidebar
        artist_name = "Unknown"
        try:
            # Method 1: Try the ArtistSidebar-name-link (MOST ACCURATE)
            sidebar_link = page.locator('a.ArtistSidebar-name-link')
            if sidebar_link.count() > 0:
                artist_name = sidebar_link.first.inner_text().strip()
                print(f"  ✓ Found artist name from sidebar: {artist_name}")
            
            # Method 2: Try h1 if sidebar not found
            elif page.locator('h1').count() > 0:
                h1_text = page.locator('h1').first.inner_text().strip()
                if h1_text and h1_text != "":
                    artist_name = h1_text
                    print(f"  ✓ Found artist name from h1: {artist_name}")
            
            # Method 3: Try page title
            elif artist_name == "Unknown":
                try:
                    title = page.title()
                    # Audiomack titles are usually "Artist Name - Listen Free on Audiomack"
                    if ' - ' in title:
                        artist_name = title.split(' - ')[0].strip()
                        print(f"  ✓ Found artist name from title: {artist_name}")
                except:
                    pass
            
            # Method 4: Extract from URL as last resort
            if artist_name == "Unknown":
                url_parts = url.rstrip('/').split('/')
                if len(url_parts) > 0:
                    artist_slug = url_parts[-1]
                    # Clean up the slug (remove dashes, capitalize)
                    artist_name = artist_slug.replace('-', ' ').title()
                    print(f"  ⚠️ Using URL slug as fallback: {artist_name}")
                    
        except Exception as e:
            print(f"  ⚠️ Could not extract artist name: {e}")
            # Fallback: use URL slug
            try:
                url_parts = url.rstrip('/').split('/')
                artist_name = url_parts[-1].replace('-', ' ').title()
            except:
                pass
        
        print(f"  ✓ Artist: {artist_name}")
        
        # Extract followers
        followers = "N/A"
        follower_patterns = [
            r'([\d,.KMB]+)\s*[Ff]ollowers?',
            r'[Ff]ollowers?\s*[:\-]?\s*([\d,.KMB]+)',
            r'([\d,.KMB]+)\s*[Ff]ans?'
        ]
        
        for pattern in follower_patterns:
            match = re.search(pattern, all_text)
            if match:
                followers = extract_number(match.group(1))
                break
        
        print(f"  📊 Followers: {followers}")
        
        # Extract Total Account Plays
        total_plays = "N/A"
        plays_patterns = [
            r'([\d,.KMB]+)\s*[Tt]otal\s*[Aa]ccount\s*[Pp]lays?',
            r'[Tt]otal\s*[Aa]ccount\s*[Pp]lays?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        
        for pattern in plays_patterns:
            match = re.search(pattern, all_text)
            if match:
                total_plays = extract_number(match.group(1))
                break
        
        # Extract Monthly Listeners
        monthly_listeners = "N/A"
        listener_patterns = [
            r'([\d,.KMB]+)\s*[Mm]onthly\s*[Ll]isteners?',
            r'[Mm]onthly\s*[Ll]isteners?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        
        for pattern in listener_patterns:
            match = re.search(pattern, all_text)
            if match:
                monthly_listeners = extract_number(match.group(1))
                break
        
        # 🆕 Extract Member Since date
        member_since = "N/A"
        try:
            # Method 1: Look for "Member since" text
            member_patterns = [
                r'Member since:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
                r'Joined:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
                r'Member Since:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
            ]
            
            for pattern in member_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    member_since = match.group(1)
                    print(f"  📅 Member Since: {member_since}")
                    break
            
            # Method 2: Try to find it in the sidebar
            if member_since == "N/A":
                try:
                    sidebar_selector = '.ArtistSidebar-info, .artist-info, [class*="sidebar"]'
                    if page.locator(sidebar_selector).count() > 0:
                        sidebar_text = page.locator(sidebar_selector).first.inner_text()
                        for pattern in member_patterns:
                            match = re.search(pattern, sidebar_text, re.IGNORECASE)
                            if match:
                                member_since = match.group(1)
                                print(f"  📅 Member Since (sidebar): {member_since}")
                                break
                except:
                    pass
                    
        except Exception as e:
            print(f"  ⚠️ Could not extract member since: {e}")
        
        print(f"  🎧 Total Account Plays: {total_plays}")
        print(f"  👥 Monthly Listeners: {monthly_listeners}")
        
        # NOW: Get FULL catalog by visiting /songs page
        print(f"\n  💿 Getting full catalog from /songs page...")
        track_urls = get_full_catalog(page, url, artist_name)
        
        print(f"  🎵 Found {len(track_urls)} total tracks in catalog")
        
        artist_data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'artist_name': artist_name,
            'url': url,
            'followers': followers,
            'total_plays': total_plays,
            'monthly_listeners': monthly_listeners,
            'member_since': member_since,  # 🆕 NEW FIELD
            'tracks_found': len(track_urls)
        }
        
        print(f"  ✅ Artist data collected!")
        return artist_data, track_urls
        
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'artist_name': 'Error',
            'url': url,
            'followers': 'Error',
            'total_plays': 'Error',
            'monthly_listeners': 'Error',
            'member_since': 'N/A',  # 🆕 NEW FIELD
            'tracks_found': 0,
            'error': str(e)
        }, []

def get_full_catalog(page, artist_url, artist_name):
    """
    Get complete artist catalog by visiting /songs page and loading all tracks
    """
    try:
        # Construct /songs URL
        base_url = artist_url.rstrip('/')
        songs_url = f"{base_url}/songs"
        
        print(f"    → Navigating to: {songs_url}")
        page.goto(songs_url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(3)
        
        track_urls = []
        previous_count = 0
        max_clicks = 10  # Prevent infinite loops
        clicks = 0
        
        # Keep clicking "Load More" until no more tracks load
        while clicks < max_clicks:
            # Find all track links currently visible
            current_tracks = page.locator('a[href*="/song/"]').all()
            current_count = len(current_tracks)
            
            print(f"    → Found {current_count} tracks so far...")
            
            # Check if we found new tracks
            if current_count == previous_count and clicks > 0:
                print(f"    ✓ No more tracks to load")
                break
            
            previous_count = current_count
            
            # Look for "Load More" button - try multiple selectors
            load_more_found = False
            load_more_selectors = [
                'button:has-text("Load More")',
                'button:has-text("Show More")',
                'button:has-text("View More")',
                'a:has-text("Load More")',
                'a:has-text("Show More")',
                '[class*="load-more"]',
                '[class*="show-more"]'
            ]
            
            for selector in load_more_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        print(f"    → Clicking 'Load More' button...")
                        page.locator(selector).first.click()
                        load_more_found = True
                        time.sleep(2)  # Wait for new tracks to load
                        break
                except:
                    continue
            
            if not load_more_found:
                print(f"    ✓ No 'Load More' button found - all tracks loaded")
                break
            
            clicks += 1
        
        # Extract all unique track URLs
        all_track_elements = page.locator('a[href*="/song/"]').all()
        seen_urls = set()
        
        for element in all_track_elements:
            try:
                href = element.get_attribute('href')
                if href and '/song/' in href:
                    # Normalize URL
                    if href.startswith('/'):
                        href = f"https://audiomack.com{href}"
                    
                    # Avoid duplicates
                    if href not in seen_urls:
                        seen_urls.add(href)
                        track_urls.append(href)
            except:
                continue
        
        # Limit to MAX_TRACKS_PER_ARTIST if set
        if MAX_TRACKS_PER_ARTIST > 0:
            track_urls = track_urls[:MAX_TRACKS_PER_ARTIST]
            print(f"    → Limited to {MAX_TRACKS_PER_ARTIST} tracks (MAX_TRACKS_PER_ARTIST setting)")
        
        return track_urls
        
    except Exception as e:
        print(f"    ⚠️ Error getting full catalog: {e}")
        print(f"    → Falling back to tracks from main page...")
        # Fallback: get tracks from main artist page
        return get_tracks_from_main_page(page, artist_url)

def get_tracks_from_main_page(page, artist_url):
    """
    Fallback: Get tracks from main artist page if /songs fails
    """
    try:
        track_urls = []
        track_selectors = ['a[href*="/song/"]']
        
        for selector in track_selectors:
            elements = page.locator(selector).all()
            if len(elements) > 0:
                for element in elements[:MAX_TRACKS_PER_ARTIST if MAX_TRACKS_PER_ARTIST > 0 else 999]:
                    href = element.get_attribute('href')
                    if href and '/song/' in href:
                        if href.startswith('/'):
                            href = f"https://audiomack.com{href}"
                        if href not in track_urls:
                            track_urls.append(href)
                break
        
        return track_urls
    except:
        return []

def main():
    """
    Main function to scrape all artists and their tracks
    """
    print("=" * 60)
    print("🎵 AUDIOMACK SCRAPER V5 - COMPLETE WITH TENURE & AGE DATA")
    print("=" * 60)
    print(f"📊 Tracking {len(ARTISTS)} artists")
    print(f"🎵 Full catalog mode: {'ENABLED' if SCRAPE_FULL_CATALOG else 'DISABLED'}")
    if MAX_TRACKS_PER_ARTIST > 0:
        print(f"⚠️  Limited to {MAX_TRACKS_PER_ARTIST} tracks per artist")
    else:
        print(f"💿 Will scrape ALL tracks from each artist")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    all_artist_data = []
    all_track_data = []
    
    with sync_playwright() as p:
        print("🌐 Launching browser...\n")
        browser = p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled']
        )
        
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport={'width': 1920, 'height': 1080}
        )
        
        page = context.new_page()
        
        # Scrape each artist
        for i, artist_url in enumerate(ARTISTS, 1):
            print(f"\n[{i}/{len(ARTISTS)}] " + "=" * 50)
            
            # Get artist data and track URLs
            artist_data, track_urls = scrape_artist_page(page, artist_url)
            all_artist_data.append(artist_data)
            
            # Scrape individual tracks
            if track_urls:
                print(f"\n  💿 Scraping {len(track_urls)} tracks for {artist_data['artist_name']}...")
                for track_url in track_urls:
                    track_data = scrape_track_page(page, track_url, artist_data['artist_name'])
                    if track_data:
                        all_track_data.append(track_data)
                    time.sleep(1)  # Be respectful between track requests
            
            # Wait between artists
            if i < len(ARTISTS):
                print(f"\n  ⏸️ Waiting 3 seconds before next artist...")
                time.sleep(3)
        
        browser.close()
    
    # Save artist data
    if all_artist_data:
        artist_filename = f"audiomack_artists_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        # 🆕 UPDATED: Added member_since to fieldnames
        artist_fieldnames = ['timestamp', 'artist_name', 'url', 'followers', 'total_plays', 'monthly_listeners', 'member_since', 'tracks_found']
        
        with open(artist_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=artist_fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(all_artist_data)
        
        print("\n" + "=" * 60)
        print(f"✅ Artist data saved to: {artist_filename}")
        print(f"📈 Total artists scraped: {len(all_artist_data)}")
    
    # Save track data
    if all_track_data:
        track_filename = f"audiomack_tracks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        track_fieldnames = ['timestamp', 'artist_name', 'track_title', 'track_url', 'plays', 'likes', 'reposts', 'playlist_adds', 'release_date']
        
        with open(track_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=track_fieldnames)
            writer.writeheader()
            writer.writerows(all_track_data)
        
        print(f"✅ Track data saved to: {track_filename}")
        print(f"🎵 Total tracks scraped: {len(all_track_data)}")
        print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Print summary
        successful_artists = sum(1 for d in all_artist_data if d['artist_name'] != 'Error')
        print(f"\n📊 Summary:")
        print(f"  ✓ Artists successful: {successful_artists}")
        print(f"  ✗ Artists with errors: {len(all_artist_data) - successful_artists}")
        print(f"  🎵 Tracks scraped: {len(all_track_data)}")
        print(f"  📊 Avg tracks per artist: {len(all_track_data) / max(successful_artists, 1):.1f}")
        
    else:
        print("\n⚠️ No data collected")

if __name__ == "__main__":
    main()