# Privacy Policy for Discord Web Auto Quest Extension

**Last Updated:** 3/6/2026

## Introduction

Discord Web Auto Quest Extension ("the Extension") is a browser extension that automatically completes Discord quests in the web browser without any manual work. This privacy policy explains how the Extension handles user data and information.

## Data Collection

**The Extension does not collect, store, or transmit any user data.**

The Extension operates entirely locally within your browser and ***does not***:

- Collect personally identifiable information (name, address, email, age, identification numbers)
- Collect health information
- Collect financial or payment information
- Collect authentication information (passwords, credentials, PINs)
- Collect personal communications (emails, texts, chat messages)
- Collect location data (region, IP address, GPS coordinates)
- Collect web history or browsing data
- Collect user activity data (clicks, mouse position, scroll, keystrokes)
- Collect website content (text, images, sounds, videos, hyperlinks)
- Transmit any data to external servers or third parties
- Use analytics or tracking services
- Store data in local storage, session storage, or browser storage APIs

## How the Extension Works

The Extension:

- Only operates on `https://discord.com/*` pages
- Modifies HTTP request headers (User-Agent) for Discord.com requests to spoof the Discord Electron desktop client, which is required for Discord's quest API to respond correctly
- Injects helper scripts (`quest-code.js`) into the active Discord tab to locate Discord's internal quest store and make POST requests to Discord's own quest API endpoints (`/quests/{id}/video-progress` and `/quests/{id}/heartbeat`)
- Displays a UI button and progress panel on the Discord quest page (`/quest-home`) to allow users to trigger and monitor quest automation
- Uses console logging for debugging purposes only (logs remain local to your browser)

All functionality is performed locally within your browser. The Extension does not communicate with any external servers except for normal interactions with Discord's own API endpoints as part of standard Discord web usage.

## Permissions

The Extension requires the following permissions:

- **Host Permission (`https://discord.com/*`)**: Required to run content scripts on Discord pages, override the User-Agent header, and interact with Discord's quest API endpoints
- **Scripting Permission**: Required to inject `quest-code.js` into the active Discord tab from the background service worker, in the page's MAIN world, to access Discord's internal webpack modules for quest automation
- **ActiveTab Permission**: Required to obtain the tab ID of the currently active Discord tab so the background service worker can target the correct tab for script injection
- **DeclarativeNetRequestWithHostAccess**: Required to modify the User-Agent HTTP request header for all requests to discord.com to emulate the Discord Electron desktop client

These permissions are used solely for the Extension's core quest automation functionality and are ***not used to collect or transmit any user data***.

## Third-Party Services

The Extension does not integrate with any third-party services, analytics platforms, or data collection services. All operations occur exclusively between the user's browser and Discord's own services.

## Data Sharing

The Extension does not share any data with third parties because it does **NOT** collect any data.

## User Rights

Since the Extension ***does not collect any user data***, there is no user data to access, modify, or delete. Users can uninstall the Extension at any time through their browser's extension management interface.

## Changes to This Privacy Policy

We may update this privacy policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this policy. Continued use of the Extension after changes constitutes acceptance of the updated policy.

## Contact

If you have any questions about this privacy policy or the Extension's data practices, please contact us through the GitHub repository at [Discord-Web-Auto-Quest-Extension](https://github.com/nvckai/Discord-Web-Auto-Quest-Extension) or through the Chrome Web Store listing.

## Compliance

This Extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Other applicable privacy laws and regulations

---

**Summary:** This Extension **does NOT collect, store, or transmit any user data***. All functionality operates **locally** within your browser and only interacts with Discord's own services.

