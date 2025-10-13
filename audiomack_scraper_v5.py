"""
Audiomack Artist & Track Data Scraper - V6 L-I-BIZZLE EDITION
NOW WITH IMAGE EXTRACTION: Profile pictures and album art
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
    'https://audiomack.com/elvissaywon226',
    'https://audiomack.com/fluxiimusic',
    'https://audiomack.com/teddyride',
    'https://audiomack.com/Jaredo',
    'https://audiomack.com/troublecoming',
    'https://audiomack.com/jzyno',
    'https://audiomack.com/cralorboi_cic',
    'https://audiomack.com/mccaro',
    'https://audiomack.com/jboydeprophet-1',
    'https://audiomack.com/christoph-the-change',
    'https://audiomack.com/brickson_',
    'https://audiomack.com/barsee-mocopala-kiloda',
    'https://audiomack.com/mr-church1',
    'https://audiomack.com/natif',
    'https://audiomack.com/LilMore',
    'https://audiomack.com/writerman_willy',
    'https://audiomack.com/kpanto_',
    'https://audiomack.com/boifattyofficial',
    'https://audiomack.com/buckyraw',
    'https://audiomack.com/kobazziee',
    'https://audiomack.com/jslughtofficial',
    'https://audiomack.com/j-rap-',
    'https://audiomack.com/nuchie-meek-',
    'https://audiomack.com/KELLz',
    'https://audiomack.com/Fazari',
]

# Configuration
MAX_TRACKS_PER_ARTIST = 0  # Set to 0 to scrape ALL tracks
SCRAPE_FULL_CATALOG = True

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

def extract_image_url(page, selectors):
    """
    Extract image URL from page using multiple selector strategies
    Returns the first valid image URL found
    """
    for selector in selectors:
        try:
            if page.locator(selector).count() > 0:
                element = page.locator(selector).first
                
                # Try getting src attribute
                img_url = element.get_attribute('src')
                if img_url and img_url.startswith('http'):
                    return img_url
                
                # Try getting data-src (lazy loaded images)
                img_url = element.get_attribute('data-src')
                if img_url and img_url.startswith('http'):
                    return img_url
                
                # Try getting background-image from style
                style = element.get_attribute('style')
                if style and 'background-image' in style:
                    match = re.search(r'url\(["\']?([^"\']+)["\']?\)', style)
                    if match:
                        img_url = match.group(1)
                        if img_url.startswith('http'):
                            return img_url
        except:
            continue
    
    return "N/A"

def scrape_track_page(page, track_url, artist_name):
    """
    Scrape detailed data from an individual track page
    NOW INCLUDES: Album art extraction
    """
    try:
        full_url = f"https://audiomack.com{track_url}" if not track_url.startswith('http') else track_url
        
        print(f"    🎵 Scraping track: {full_url}")
        page.goto(full_url, wait_until="domcontentloaded", timeout=30000)
        time.sleep(2)
        
        all_text = page.inner_text('body')
        
        # Extract track title
        track_title = "Unknown"
        try:
            if page.locator('h1').count() > 0:
                h1_text = page.locator('h1').first.inner_text().strip()
                if h1_text and h1_text != "":
                    track_title = h1_text
            
            if track_title == "Unknown" or len(track_title) < 2:
                try:
                    title = page.title()
                    if ' - ' in title:
                        parts = title.split(' - ')
                        if len(parts) > 1:
                            track_title = parts[1].split('|')[0].strip()
                except:
                    pass
            
            if track_title == "Unknown" or len(track_title) < 2:
                url_parts = full_url.rstrip('/').split('/')
                if len(url_parts) > 0:
                    track_slug = url_parts[-1]
                    track_title = track_slug.replace('-', ' ').title()
                    
        except:
            try:
                url_parts = full_url.rstrip('/').split('/')
                track_title = url_parts[-1].replace('-', ' ').title()
            except:
                pass
        
        # 🖼️ NEW: Extract album art / track cover image
        # ---------- UPDATED SELECTORS ----------
        album_art_selectors = [
            'img.SinglePageMusicCardImage',
            'img[data-testid="SinglePageMusicCardImage"]',
        ]
        # ---------------------------------------
        album_art = extract_image_url(page, album_art_selectors)
        
        if album_art != "N/A":
            print(f"      🖼️  Found album art: {album_art[:60]}...")
        
        # Extract play count
        plays = "N/A"
        play_patterns = [
            r'([\d,.KMB]+)\s*[Tt]otal\s*[Pp]lays?',
            r'[Tt]otal\s*[Pp]lays?\s*[:\-]?\s*([\d,.KMB]+)',
            r'(?<!Playlist\s)(?<!playlist\s)([\d,.KMB]+)\s*[Pp]lays?(?!\s*Adds)',
        ]
        
        for pattern in play_patterns[:2]:
            match = re.search(pattern, all_text, re.IGNORECASE)
            if match:
                plays = extract_number(match.group(1))
                break
        
        if plays == "N/A":
            lines = all_text.split('\n')
            for i, line in enumerate(lines):
                if 'Plays' in line and 'Playlist' not in line and 'Added' not in line:
                    combined = lines[max(0, i-1):i+2]
                    for check_line in combined:
                        match = re.search(r'([\d,.KMB]+)', check_line)
                        if match:
                            potential_plays = extract_number(match.group(1))
                            if potential_plays != "N/A":
                                plays = potential_plays
                                break
                    if plays != "N/A":
                        break
        
        # Extract likes
        likes = "N/A"
        like_patterns = [
            r'([\d,.KMB]+)\s*[Ff]avorites?',
            r'([\d,.KMB]+)\s*[Ll]ikes?',
            r'[Ff]avorites?\s*[:\-]?\s*([\d,.KMB]+)',
            r'[Ll]ikes?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        for pattern in like_patterns:
            match = re.search(pattern, all_text)
            if match:
                likes = extract_number(match.group(1))
                break
        
        # Extract playlist adds
        playlist_adds = "N/A"
        playlist_patterns = [
            r'([\d,.KMB]+)\s*[Pp]laylist\s*[Aa]dds?',
            r'[Pp]laylist\s*[Aa]dds?\s*[:\-]?\s*([\d,.KMB]+)',
        ]
        for pattern in playlist_patterns:
            match = re.search(pattern, all_text)
            if match:
                playlist_adds = extract_number(match.group(1))
                break
        
        # Extract reposts
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
        
        # Extract release date
        release_date = "N/A"
        try:
            release_date_selector = 'li.SinglePageMusicCardInfo-row:has-text("Release Date") .SinglePageMusicCardInfo-value span span'
            if page.locator(release_date_selector).count() > 0:
                release_date = page.locator(release_date_selector).first.inner_text().strip()
            
            if release_date == "N/A":
                alt_selector = '.SinglePageMusicCardInfo-row .TooltipTitle span'
                elements = page.locator(alt_selector).all()
                for element in elements:
                    text = element.inner_text().strip()
                    if any(month in text for month in ['January', 'February', 'March', 'April', 'May', 'June', 
                                                        'July', 'August', 'September', 'October', 'November', 'December']):
                        release_date = text
                        break
            
            if release_date == "N/A":
                lines = all_text.split('\n')
                for i, line in enumerate(lines):
                    if 'Release Date' in line or 'release date' in line.lower():
                        for j in range(i, min(i+5, len(lines))):
                            check_line = lines[j]
                            date_match = re.search(r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}', check_line, re.IGNORECASE)
                            if date_match:
                                release_date = date_match.group(0)
                                break
                        if release_date != "N/A":
                            break
                            
        except Exception as e:
            print(f"      Could not extract release date: {e}")
        
        track_data = {
            'artist_name': artist_name,
            'track_title': track_title,
            'track_url': full_url,
            'album_art': album_art,  # 🖼️ NEW FIELD
            'plays': plays,
            'likes': likes,
            'reposts': reposts,
            'playlist_adds': playlist_adds,
            'release_date': release_date,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        print(f"      ✓ Plays: {plays} | Likes: {likes} | Released: {release_date}")
        return track_data
        
    except Exception as e:
        print(f"      ✗ Error scraping track: {str(e)}")
        return None

def scrape_artist_page(page, url):
    """
    Scrape data from artist page and their top tracks
    NOW INCLUDES: Profile image extraction
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
        
        # Extract artist name
        artist_name = "Unknown"
        try:
            sidebar_link = page.locator('a.ArtistSidebar-name-link')
            if sidebar_link.count() > 0:
                artist_name = sidebar_link.first.inner_text().strip()
            elif page.locator('h1').count() > 0:
                h1_text = page.locator('h1').first.inner_text().strip()
                if h1_text and h1_text != "":
                    artist_name = h1_text
            elif artist_name == "Unknown":
                try:
                    title = page.title()
                    if ' - ' in title:
                        artist_name = title.split(' - ')[0].strip()
                except:
                    pass
            
            if artist_name == "Unknown":
                url_parts = url.rstrip('/').split('/')
                if len(url_parts) > 0:
                    artist_slug = url_parts[-1]
                    artist_name = artist_slug.replace('-', ' ').title()
                    
        except Exception as e:
            print(f"  ⚠️ Could not extract artist name: {e}")
            try:
                url_parts = url.rstrip('/').split('/')
                artist_name = url_parts[-1].replace('-', ' ').title()
            except:
                pass
        
        print(f"  ✓ Artist: {artist_name}")
        
        # 🖼️ NEW: Extract artist profile image
        # ---------- UPDATED SELECTORS ----------
        profile_image_selectors = [
            'img.ArtistAvatar',
            # keep a fallback that still checks class contains ArtistAvatar if Audiomack varies
            'img[class*="ArtistAvatar"]',
        ]
        # ---------------------------------------
        profile_image = extract_image_url(page, profile_image_selectors)
        
        if profile_image != "N/A":
            print(f"  🖼️  Found profile image: {profile_image[:60]}...")
        
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
        
        # Extract Member Since date
        member_since = "N/A"
        try:
            member_patterns = [
                r'Member since:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
                r'Joined:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
                r'Member Since:?\s*(\w+\s+\d{1,2},?\s+\d{4})',
            ]
            
            for pattern in member_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    member_since = match.group(1)
                    break
            
            if member_since == "N/A":
                try:
                    sidebar_selector = '.ArtistSidebar-info, .artist-info, [class*="sidebar"]'
                    if page.locator(sidebar_selector).count() > 0:
                        sidebar_text = page.locator(sidebar_selector).first.inner_text()
                        for pattern in member_patterns:
                            match = re.search(pattern, sidebar_text, re.IGNORECASE)
                            if match:
                                member_since = match.group(1)
                                break
                except:
                    pass
                    
        except Exception as e:
            print(f"  ⚠️ Could not extract member since: {e}")
        
        print(f"  📊 Followers: {followers}")
        print(f"  🎧 Total Account Plays: {total_plays}")
        print(f"  👥 Monthly Listeners: {monthly_listeners}")
        
        # Get FULL catalog by visiting /songs page
        print(f"\n  💿 Getting full catalog from /songs page...")
        track_urls = get_full_catalog(page, url, artist_name)
        
        print(f"  🎵 Found {len(track_urls)} total tracks in catalog")
        
        artist_data = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'artist_name': artist_name,
            'url': url,
            'profile_image': profile_image,  # 🖼️ NEW FIELD
            'followers': followers,
            'total_plays': total_plays,
            'monthly_listeners': monthly_listeners,
            'member_since': member_since,
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
            'profile_image': 'N/A',  # 🖼️ NEW FIELD
            'followers': 'Error',
            'total_plays': 'Error',
            'monthly_listeners': 'Error',
            'member_since': 'N/A',
            'tracks_found': 0,
            'error': str(e)
        }, []

def get_full_catalog(page, artist_url, artist_name):
    """Get complete artist catalog by visiting /songs page"""
    try:
        base_url = artist_url.rstrip('/')
        songs_url = f"{base_url}/songs"
        
        print(f"    → Navigating to: {songs_url}")
        page.goto(songs_url, wait_until="domcontentloaded", timeout=60000)
        time.sleep(3)
        
        track_urls = []
        previous_count = 0
        max_clicks = 10
        clicks = 0
        
        while clicks < max_clicks:
            current_tracks = page.locator('a[href*="/song/"]').all()
            current_count = len(current_tracks)
            
            print(f"    → Found {current_count} tracks so far...")
            
            if current_count == previous_count and clicks > 0:
                print(f"    ✓ No more tracks to load")
                break
            
            previous_count = current_count
            
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
                        time.sleep(2)
                        break
                except:
                    continue
            
            if not load_more_found:
                print(f"    ✓ No 'Load More' button found - all tracks loaded")
                break
            
            clicks += 1
        
        all_track_elements = page.locator('a[href*="/song/"]').all()
        seen_urls = set()
        
        for element in all_track_elements:
            try:
                href = element.get_attribute('href')
                if href and '/song/' in href:
                    if href.startswith('/'):
                        href = f"https://audiomack.com{href}"
                    
                    if href not in seen_urls:
                        seen_urls.add(href)
                        track_urls.append(href)
            except:
                continue
        
        if MAX_TRACKS_PER_ARTIST > 0:
            track_urls = track_urls[:MAX_TRACKS_PER_ARTIST]
        
        return track_urls
        
    except Exception as e:
        print(f"    ⚠️ Error getting full catalog: {e}")
        return get_tracks_from_main_page(page, artist_url)

def get_tracks_from_main_page(page, artist_url):
    """Fallback: Get tracks from main artist page"""
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
    """Main function to scrape all artists and their tracks"""
    print("=" * 60)
    print("🎵 L-I-BIZZLE SCRAPER V6 - WITH IMAGES")
    print("=" * 60)
    print(f"📊 Tracking {len(ARTISTS)} artists")
    print(f"🎵 Full catalog mode: {'ENABLED' if SCRAPE_FULL_CATALOG else 'DISABLED'}")
    if MAX_TRACKS_PER_ARTIST > 0:
        print(f"⚠️  Limited to {MAX_TRACKS_PER_ARTIST} tracks per artist")
    else:
        print(f"💿 Will scrape ALL tracks from each artist")
    print(f"🖼️  NOW EXTRACTING: Profile pics & album art")
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
        
        for i, artist_url in enumerate(ARTISTS, 1):
            print(f"\n[{i}/{len(ARTISTS)}] " + "=" * 50)
            
            artist_data, track_urls = scrape_artist_page(page, artist_url)
            all_artist_data.append(artist_data)
            
            if track_urls:
                print(f"\n  💿 Scraping {len(track_urls)} tracks for {artist_data['artist_name']}...")
                for track_url in track_urls:
                    track_data = scrape_track_page(page, track_url, artist_data['artist_name'])
                    if track_data:
                        all_track_data.append(track_data)
                    time.sleep(1)
            
            if i < len(ARTISTS):
                print(f"\n  ⏸️ Waiting 3 seconds before next artist...")
                time.sleep(3)
        
        browser.close()
    
    # Save artist data with images
    if all_artist_data:
        artist_filename = f"audiomack_artists_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        artist_fieldnames = ['timestamp', 'artist_name', 'url', 'profile_image', 'followers', 'total_plays', 'monthly_listeners', 'member_since', 'tracks_found']
        
        with open(artist_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=artist_fieldnames, extrasaction='ignore')
            writer.writeheader()
            writer.writerows(all_artist_data)
        
        print("\n" + "=" * 60)
        print(f"✅ Artist data saved to: {artist_filename}")
        print(f"📈 Total artists scraped: {len(all_artist_data)}")
    
    # Save track data with album art
    if all_track_data:
        track_filename = f"audiomack_tracks_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        track_fieldnames = ['timestamp', 'artist_name', 'track_title', 'track_url', 'album_art', 'plays', 'likes', 'reposts', 'playlist_adds', 'release_date']
        
        with open(track_filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=track_fieldnames)
            writer.writeheader()
            writer.writerows(all_track_data)
        
        print(f"✅ Track data saved to: {track_filename}")
        print(f"🎵 Total tracks scraped: {len(all_track_data)}")
        print(f"⏰ Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
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
