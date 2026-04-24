<img width="1854" height="903" alt="image" src="https://github.com/user-attachments/assets/386984b1-8ab7-4899-bd26-3a7aa146f39f" /># Discord Web Auto Quest Extension

<img align="right" src="./assets/icon.png" width=200 alt="Discord Auto Quest Extension logo">

Extension that automatically completes Discord quests. No more manually watching videos or playing games - just click a button and let it run quests one by one automatically and work for all device.

Original Source from [**aamiaa**](https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb)  🌸


> [!NOTE]
> Join Discord ID Server Support: https://discord.gg/HbZEEuj4KJ

> [!CAUTION]
> As of April 7th 2026, Discord has expressed their intent to crack down on automating quest completion.
> Some users have received the following system message:
> 
> <img width="836" height="272" alt="image" src="https://i.postimg.cc/1XqDrjc1/quest.webp" />
> 
> Use the script at your own risk.

> [!IMPORTANT]
> **24/04/2026** 
> Use the latest version **(v1.2.6)** on the Discord Canary site: https://canary.discord.com/quest-home.
> It may work on discord.com later, but for now, use Canary Website Version.

## What it does

This extension hooks into Discord's quest system and automatically completes the requirements for all active quests sequentially. It works with:

- Video watching quests (WATCH_VIDEO, WATCH_VIDEO_ON_MOBILE)
- Desktop game playing (PLAY_ON_DESKTOP) 
- Desktop streaming (STREAM_ON_DESKTOP)
- Activity playing (PLAY_ACTIVITY)

The extension spoofs your user-agent to make Discord think you're using the desktop app, which is required for some quest types to work properly. Supports sequential quest execution to ensure stability and proper completion.

## Installation

1. Clone or download this repo
2. Open Chrome/Edge and go to `chrome://extensions/` or if you're on Opera go to `opera://extensions`
3. Toggle "Developer mode" on (top right corner)
4. Click "Load unpacked" and select the extension folder (the folder with `_metadata` and `assets` folders)
5. You're done!

## How to use

1. Go to `https://discord.com/quest-home` in your browser
2. Accept quests if you haven't already
3. Look for the "Running Quests" button in the bottom right corner with a Symbol icon
4. Click it and check the browser console (F12) for progress updates
5. Expand the panel to see quest details (shows Discord ID and credits)

The extension will automatically detect all your active quests and start completing them one by one. Progress is logged to the console so you can see what's happening for each quest.

## Requirements

- Chrome or any Chromium-based browser (Edge, Brave, etc.)
- A Discord account with quests available
- Accepted quests on the quest-home page

## How it works

The extension uses advanced techniques:

- **User-Agent override**: Modifies HTTP headers and navigator properties to mimic Discord desktop
- **Webpack module injection**: Hooks into Discord's internal stores (QuestsStore, RunningGameStore, etc.)
- **Multi-quest concurrency**: Runs all eligible quests in parallel using Promise.all
- **API spoofing**: Intercepts quest progress updates and sends fake data
- **Smart detection**: Filters quests by expiration and completion status

For streaming quests, you still need at least one other person in the voice channel - the extension can't fake that part.

## Troubleshooting

**Button doesn't appear:**
- Make sure you're on `discord.com/quest-home`
- Refresh the page
- Check that the extension is enabled in `chrome://extensions/` or `opera://extensions`

**Quest not completing:**
- Open the console (F12) and check for error messages
- Make sure you've accepted the quests first
- Some quest types work better in the actual Discord desktop app
- Try refreshing and running the code again

**User-Agent warnings:**
- The console might show warnings about user-agent detection - this is normal
- The extension uses multiple methods to override it, so it should still work

## Technical details

Built with Manifest V3. Uses:
- `declarativeNetRequest` for header modification
- Content scripts for quest page interaction
- Background service worker for script injection
- Webpack module interception for Discord internals
- Concurrent execution with async/await and Promise.all
## Mobile Version Supported (Android)

1. Download this Extension
2. **Download Lemur Browser:** [Download Lemur Browser on Play Store](https://play.google.com/store/apps/details?id=com.lemurbrowser.exts)
3. Open the browser and tap the **4 Squares Icon** (on the right side) → select **"Extensions"**.
4. Enable **Developer mode**, then tap **`+ (from .zip/crx/.user.js)`** and upload the extension file you just downloaded.
5. Open the Discord Quests Page: [Quest](https://discord.com/quest-home), accept at least one quest, select **"Playing on Desktop"**, and then **REFRESH**.
   - A **`Running Quests`** button should appear. Tap it and you're all set!
   - If it doesn't appear, try refreshing the quest page again.

**Notes:** This setup is optimized for mobile via Lemur Browser because of its Chrome extension support. 

> [!WARNING]
> This is a tool for automating Discord quests. Use at your own risk and be aware of Discord's Terms of Service. I'm not responsible if your account gets flagged or banned.

> [!IMPORTANT]
> This repository is strictly for educational purposes and security research only. It is designed to demonstrate how web APIs and user-agent spoofing work in a browser environment. Any misuse of this tool is the sole responsibility of the user. The author does not condone any actions that violate third-party Terms of Service.

