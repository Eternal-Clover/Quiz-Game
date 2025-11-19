# Music Files

✅ **Current Files:**
- `inGame.mp3` - Background music during quiz gameplay
- `gameEnd.mp3` - Victory/celebration music for results page

Place your music files here:

1. **inGame.mp3** - Background music during quiz gameplay
   - Should be upbeat and energetic
   - Recommended: instrumental, non-distracting
   - Duration: 2-5 minutes (will loop)
   - Volume: Will play at 30% volume (looped)

2. **gameEnd.mp3** - Victory/celebration music for results page
   - Should be celebratory and triumphant
   - Recommended: upbeat, festive
   - Duration: 15-30 seconds
   - Volume: Will play at 50% volume (plays once)

## Free Music Resources:
- https://incompetech.com/ (Kevin MacLeod - royalty free)
- https://freemusicarchive.org/
- https://www.bensound.com/
- https://pixabay.com/music/
- https://uppbeat.io/
- https://www.chosic.com/free-music/all/

## Recommended Tracks:
### Game Music (upbeat, energetic):
- "Pixel Peeker Polka" by Kevin MacLeod
- "Wallpaper" by Kevin MacLeod
- "Cipher" by Kevin MacLeod

### Victory Music (celebratory):
- "Fanfare for Space" by Kevin MacLeod
- "Winner Winner!" by Kevin MacLeod
- "Heroic Adventure" by Kevin MacLeod

## How Music is Used:
- **Game Page** (`/game/:code`): Plays `game-music.mp3` when game starts, stops when game ends
- **Results Page** (`/results/:code`): Plays `victory-music.mp3` when results load, stops when leaving
- **Home Page** (`/`): No music plays
- **Other Pages**: No music plays

## Note:
Make sure you have the rights to use any music files you add to this folder.

## Testing Without Music Files:
The app will work fine without music files. It will simply log errors in the console but won't break the functionality.
