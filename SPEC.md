# Project: WedSnap (working name) - wedding guest camera with an AI-edited montage

You are a senior full-stack engineer building an MVP together with me, a student developer. Read this whole document first. Then build one phase at a time. At the end of each phase: make sure linting, type checking and tests pass, give me a short checklist to test on my phone, commit the work, and stop. Do not begin the next phase until I say "next phase". When something is unclear, choose a sensible default, tell me in one line what you chose, and keep going instead of asking many questions.

If the repository already contains code, do not rebuild from scratch. Read it, report what is already done compared with this document, list the gaps, and continue from the first unfinished phase. Ignore any older plan that used Laravel, PHP or XAMPP; if such files exist, tell me and remove them only after I confirm. Any database change must be a new migration.

## 1. Product

Wedding guests scan a QR code with their phone, type their name, take photos in the browser, and optionally send a wish to the couple. There is no app to install and no login. All photos go into that wedding's album. A fun leaderboard shows who took the most photos.

When the event ends, an AI editor turns the best photos and the best wishes into a montage video that feels professionally edited and is never a plain slideshow. The couple can choose a song, or the video uses the default song of the chosen style. They can play the video at the event and download it.

Payment happens outside the system through manual bank or DuitNow transfer. There is no payment gateway and no customer self-signup. I, the owner, create each event after confirming payment, then send the couple their QR code and admin PIN.

The price is RM49 per wedding, so the running cost per event must stay very low. Montage quality is the main selling point.

## 2. Hard constraints

- Development happens on Windows 11, natively. Do not use or require WSL, XAMPP, Docker, Redis or Python. Everything must run with the current Node.js LTS release and npm, in PowerShell or Git Bash.
- No scripts that only work in bash. Use npm scripts with cross-platform tools. Build file paths with Node's path utilities. Add a gitattributes file for consistent line endings.
- Production, later, is a small Linux server running Node behind a reverse proxy such as Caddy, with S3-compatible object storage. The same code must run on both Windows and Linux.

## 3. Technology stack

- Next.js with the App Router, React, strict TypeScript and Tailwind CSS.
- SQLite using the better-sqlite3 driver with Drizzle ORM and drizzle-kit migrations, with write-ahead logging and a busy timeout enabled. Use the Node LTS release so prebuilt binaries install without a compiler. If an install fails, tell me the fix instead of changing the stack.
- sharp for all image work: auto-orientation, resizing, re-encoding to JPEG, thumbnails and quality scoring. Re-encoding also strips EXIF and GPS data.
- zod for validation, bcryptjs for hashing PINs and passwords, jose or iron-session for the owner session, the qrcode package for QR codes in SVG format, idb for IndexedDB on the client, and Vitest for tests.
- ffmpeg-static as the bundled FFmpeg binary, with an environment setting to point at a system FFmpeg on Linux. At startup, verify that the filters needed for scaling, zooming, overlaying, text drawing, crossfading and color adjustment exist, and fail with a clear message if not.
- The official Anthropic SDK for the AI editor. The model name comes from an environment setting, defaulting to a small, inexpensive, vision-capable Claude model (currently Claude Haiku 5.5; I will verify the exact name in the docs). The API key comes from an environment setting and is never hardcoded.
- A pure JavaScript tempo and beat estimator (for example the music-tempo package or an equivalent), working on audio decoded by FFmpeg. No Python.
- A storage abstraction with a local disk implementation for development and an S3-compatible implementation for production, chosen by environment settings.
- Background work through a jobs table in the database, processed by a separate worker process, one job at a time, with retries and recorded failure messages.
- Internationalization through typed dictionaries for Malay (the default) and English, with the chosen language remembered in a cookie.

## 4. Roles

1. Owner (me): signs in at the owner area. There is a single account whose credentials come from the environment settings. The owner creates and manages events.
2. Event admin (the couple or family): no account. Uses the admin page of their event, protected by a 6-digit PIN that is stored hashed, with limited attempts.
3. Guest: no account. Identified by a random token kept in an httpOnly cookie, with a backup in the browser's local storage.

## 5. Guest flow

Goal: under 15 seconds and at most 3 taps from scanning the QR code to taking the first photo. The guest page lives under the event's unique slug.

1. Welcome screen: the couple's names, the date, one field for the guest's name, a one-line consent message (photos and wishes are shared with the couple and may be processed by AI to create the event video), a large Start button, and a Malay/English toggle defaulting to Malay.
2. Camera screen: live camera in the browser, a large shutter button, a flip-camera button, a small counter such as "You've taken 7 photos", and the camera stays open for continuous shooting with a brief thumbnail confirmation after each shot.
3. Photos are compressed on the phone before upload (longest side around 2000 pixels, JPEG quality around 0.8). Uploads run in the background with a unique ID per photo so that retries never create duplicates, with exponential backoff and a visible per-photo status (uploaded or waiting for signal).
4. Fallbacks: if camera permission is denied or an in-app browser blocks the camera, show a clear message, guide the guest to open the page in Chrome or Safari, and offer a "choose from gallery" upload.
5. An always-visible "Send a wish" button, never forced: up to 200 characters, with an optional attachment of one of the guest's own photos.
6. A leaderboard tab, not shown by default and purely for fun: the top 5 photographers with playful titles in Malay and English, plus the guest's own rank. Hidden photos do not count.
7. Returning guests on the same device skip the name step and keep their count.
8. Guests can join late, until the event ends. After that, show a friendly "event ended" page.
9. The design is mobile-first with large text and large buttons for older guests. No phone numbers or email addresses are collected.

## 6. Event admin flow

- Live statistics, a photo grid and a wish list, with hide, unhide and delete for each item.
- Music choice: pick a song from the royalty-free library with a short preview, or leave it on the default for the chosen style. There is also an optional "upload my own song" feature behind a clear warning and a consent checkbox (see the music section).
- Style choice: pick from the available video styles (themes).
- The video length is not chosen by the couple. The AI editor decides it from the amount of high-quality material (see the quality section).
- A large "End event and make video" button with a confirmation step. There is also an optional automatic end a set number of hours after the first upload (default 8 hours), run by the worker.
- After the event ends: show progress (queued, analyzing, planning, rendering, done or failed), a preview, a download button, and a link to the wishes keepsake page. A "Try another edit" button (at most 2 per event) re-plans the video with the cached photo analysis and possibly a different song or style, without analyzing the photos again.
- The guest QR code and link, plus a printable A5 or A6 card with the couple's names.

## 7. Owner flow

- Create an event: couple's names, date, default language, auto-end hours, retention days (default 90), style, and default song. The system generates a unique slug, a random 6-digit PIN shown only once and stored hashed, and a QR code in SVG format.
- Event list: status, photo count, storage used, montage status, estimated AI cost, a free-text payment note and a paid checkbox. There is no payment logic anywhere.
- Actions: regenerate the PIN, view the edit plan, see why photos and wishes were included or left out, retry a failed montage, force the rule-based editor, delete media now, and extend retention.
- The worker automatically purges media after the retention period.
- Development tooling: a command that imports a folder of real photos as a test event, and a command that produces and prints an edit plan for an event without rendering any video. Both let me judge the AI editor on real pictures.

## 8. Data model

Define these tables with Drizzle and migrations, with sensible indexes.

- Events: id, unique slug, couple's names, event date, language, style, default song, chosen song, custom song path, custom song consent, admin PIN hash, status, first upload time, auto-end hours, end time, retention days, purge date, owner note, paid flag, re-edit count, created time.
- Guests: id, event, name, hashed token, created time.
- Photos: id, event, guest, client-generated unique ID, file path, thumbnail path, AI thumbnail path, width, height, size, cheap quality score, perceptual hash, AI analysis, scene type, subject focus position, AI quality score, AI exclusion flag and reason, hidden flag, created time. The pair of event and client ID is unique.
- Wishes: id, event, guest, message, optional photo, hidden flag, AI quality score, AI selection flag and reason, created time.
- Montages: id, event, version number, status, which editor produced it (Claude or rule-based), the edit plan, number of photos used, number of wishes used, final duration, preview path, final path, error message, AI tokens in and out, estimated AI cost, start and finish times.
- Jobs: id, type, payload, status, attempts, next run time, last error, created and finished times.

## 9. The AI editor (the core feature)

The video must never be a plain slideshow. The editor has two interchangeable implementations behind one interface: a Claude-based editor and a rule-based fallback editor that needs no network, plus a mock editor for tests. The system uses Claude when an API key is configured. On any API error, timeout, invalid output or cost-cap hit, it falls back to the rule-based editor, so a video is always produced.

Pipeline stages, each separately testable:

1. Cheap pre-filter without AI, using sharp: measure sharpness, exposure and resolution, compute a perceptual hash, and drop clearly unusable photos (very blurry, very dark or very bright) and near-duplicates, keeping the best of each group. This stage does not enforce any fixed number of photos.
2. Vision analysis with Claude: send small thumbnails (about 512 pixels on the longest side) in batches, together with the photo IDs, and get back structured results for each photo: scene type (couple portrait, family, group, ceremony, candid, dancing, food, decor, detail, other), number of people, mood, the main subject's focus position, a safe crop area that never cuts off heads, an overall quality score from 0 to 10 covering composition, expression, emotion and technical quality, whether it is a hero-worthy shot, and whether it should be excluded with a reason (eyes closed, awkward expression, unflattering, bad framing, inappropriate, too similar to a better shot). Validate every response against a schema, store it, and cache it so it is never paid for twice.
3. Wish evaluation: the AI also scores each visible wish for quality (see the quality section).
4. Story planning with Claude, using only the saved analysis, the chosen wishes, the song's tempo and energy, and the style: produce an edit plan that follows a story arc (opening, couple and ceremony moments, family and friends, candid and fun moments, high-energy dancing, finale). The plan decides which photos are hero shots, groups similar photos into collages or fast burst sequences, sets the length of every shot in musical beats, picks the motion and transition for every shot, places wishes either over the sender's own photo or on full-screen wish cards with a blurred photo background, adds a few "photo by NAME" credits, and adds a top-photographers card from the leaderboard. The tone suits a respectful, celebratory Malaysian wedding across Malay, Chinese, Indian and mixed celebrations: nothing that mocks guests, and all captions and text are kind.
5. Plan validation: every referenced photo and wish must exist, no photo is used twice except inside a collage, the total length fits the song, text lengths are within limits, and shot lengths are within the style's limits. If validation fails, retry once, passing the error back to the AI, and then fall back to the rule-based editor.
6. Save the plan with the montage. The renderer reads only the plan and never calls AI.

The edit plan describes: a version number, the aspect ratio, the target duration, the chosen song with its tempo and beat times, the style, an ordered list of story sections, and an ordered list of shots. Each shot has a kind (photo, collage, wish card, title card, credit card or top-photographers card), the photos it uses, a layout (single, two-up, three-up or four-up), a length in beats, a motion (zoom in, zoom out, pan left, pan right, push toward the subject, or static, with an intensity), an incoming transition (hard cut, flash, crossfade, slide or zoom blur, with a length in beats), and optional overlay text such as a wish or a credit.

"Not a slideshow" rules, checked automatically on every plan including those from the rule-based editor, scaled sensibly when there is little material:
- Several different shot lengths, with faster pacing in energetic sections and slower pacing for emotional moments.
- Collage or split-screen shots and at least one fast burst sequence, whenever enough suitable photos exist.
- At least three kinds of transitions, mostly hard cuts and flashes on the beat, with crossfades used sparingly.
- Motion that follows the subject's focus position and never crops heads.
- Text moments: a title card, wish overlays or wish cards, credits and a closing card.
- Cuts that land on the beats of the chosen song.
If a plan fails these checks, fix it automatically or fall back instead of rendering a boring result.

Cost and privacy controls:
- Protect cost with configurable limits: the maximum number of photos sent for analysis per event, the number of images per request, the token limit, the request timeout, and a maximum estimated AI cost per event in ringgit. These are cost protections, not quotas on the final selection. If more photos exist than the cost limit allows, analyze the best ones first according to the cheap score.
- Retry with backoff on rate limits.
- Send only small thumbnails of photos that are not hidden. Never log image content or guest names. Make the consent text on the welcome page mention AI processing, and document in the README that photos are sent to the Anthropic API.
- All AI calls live in one module so the provider and model can be swapped.
- Tests must mock the AI SDK and must never call the real API.

## 10. Quality-based selection (AI decides the counts)

There is no fixed number of photos and no fixed number of wishes in the video. The AI editor includes only material that deserves to be there, and the video length follows from how much high-quality material exists.

Photos:
- Include a photo only if it is clearly good: sharp, well framed, flattering, with a good expression and emotional value, and distinct from other included shots.
- Leave out weak, repetitive, awkward, unflattering or inappropriate photos, even if that makes the video short.
- If there are many excellent photos, the video can be longer. If there are few, the video must be shorter and never padded with weak photos or repeats.
- Keep a healthy variety: prefer a mix of people, moments and guests, so no single guest or scene dominates, but never include a poor photo just to improve variety.
- The only limits on length are a configurable safety ceiling for render time and cost, and a sensible minimum so that very small events still get a short, well-made video.

Wishes:
- Include only high-quality wishes: sincere, specific, warm, well written or genuinely funny in a kind way, and short enough to read comfortably on screen.
- Leave out generic, duplicate, very short, spammy, careless or inappropriate wishes, and prefer variety of voices and relationships.
- Never rewrite a guest's words. Wishes may be shown whole or by choosing complete sentences, never by changing their meaning.
- Every wish that is not hidden is still kept in full in the wishes keepsake page, so no guest message is lost even if it is not used in the video.

Transparency and testing:
- Record in the database, for every photo and wish, whether it was used and the reason if it was not, and show this to the owner.
- The rule-based fallback editor must also decide by quality thresholds and score distributions, not by fixed counts.
- Tests must show that the number of selected photos and wishes changes with the input quality: a mixed set containing blurry photos, duplicates and closed-eyes shots has those removed, and a small set of good photos produces a shorter video rather than a padded one.

## 11. Music system

- A library file in the music assets folder lists the available songs with: id, title, artist, license, file name, mood, optional tempo, and tags such as romantic, upbeat, Malay acoustic or instrumental. I add royalty-free audio files myself. Never download or bundle copyrighted music. Include a short guide in the folder explaining licensing and how to add tracks.
- The first time a song is used, decode it with FFmpeg and estimate its tempo, beat times and energy over time, then cache the result. If detection confidence is low, use the tempo from the library file, otherwise a safe default grid.
- Song selection order: the couple's own uploaded song (only with consent), then the song chosen by the couple, then the default song of the style, then silence. Silence still uses a default beat grid. The whole pipeline must work with an empty library.
- Custom uploads accept common audio formats, limited by size and duration, and are verified as real audio. They require a visible warning (use only music you have the right to use, and songs you do not own may be muted or blocked if the video is posted online) and a consent checkbox. They are stored privately and deleted together with the event.
- The song is trimmed or looped to the video length with fade-in, fade-out and loudness normalization.
- The planner uses the song's tempo and energy so that high-energy moments line up with the lively photos.

## 12. Renderer

- The renderer turns the edit plan into a video using FFmpeg only. The aspect ratio is a parameter: 16:9 first, and 9:16 vertical later, using the subject focus positions for smart cropping.
- Render each shot as a short intermediate clip with its own motion, the style's color grade, text overlays using bundled open-license fonts, collage layouts and blurred-background wish cards. Then join them with beat-aligned cuts, flashes and crossfades as the plan specifies, in chunks to keep memory use low. Write overlay text through temporary files to avoid escaping problems, wrap long lines manually, and remove emoji from overlay text.
- Render a 720p preview first and mark the montage as done with the preview available, so the couple can watch quickly. Then render the 1080p final from the same saved plan, without calling AI again. Clean up temporary files.
- Record failures in the montage record with an error message and the tail of FFmpeg's error output, and offer a retry in the owner area.
- Keep CPU use low through sensible presets and sequential processing.

## 13. Security and reliability

- Validate every input with zod. For uploads, decode the image with sharp instead of trusting the file type, enforce size and pixel limits and per-guest and per-event limits, strip metadata and use random file names.
- Always resolve the event and guest on the server from the slug and token and never trust IDs sent by the client. Protect state-changing requests against cross-site attacks using same-site cookies and origin checks at minimum.
- Rate-limit uploads, wishes and PIN attempts.
- Escape all user-provided text. Never log photo content or guest names.
- Photos are private and are served only through authorized handlers or short-lived signed links.
- Never commit secrets. Keep the example environment file current, documenting the API key, the model name, the AI cost limit, the FFmpeg path and the storage settings.
- Support deletion of event data on request and automatically after the retention period.

## 14. Phases

### Phase 1 - Foundation and photo capture
Project setup (Next.js, TypeScript, Tailwind, Drizzle, SQLite, Vitest), environment handling, schema and migrations for all tables, owner sign-in seeded from the environment, the create-event form with slug, PIN and QR code, guest welcome and camera pages with client-side compression, the upload endpoint with validation, EXIF stripping and thumbnails (including a small thumbnail for the AI), idempotent uploads with simple retry, the device token and photo counter, the local storage driver, and tests. The README explains Windows setup and how to test on a phone over HTTPS using a tunnel service.
Acceptance: I can create an event, scan its QR code on my phone over HTTPS, take 5 photos, and see correct counts. Uploading the same photo ID twice creates only one record.

### Phase 2 - Wishes, leaderboard, admin, offline support, languages
Wishes with an optional photo, the leaderboard, the PIN-protected admin page, hide and delete, ending an event with confirmation, automatic ending in the worker, Malay and English dictionaries, the IndexedDB offline queue that survives reloads and syncs when back online, the in-app-browser and camera-denied fallbacks, the printable QR card, and tests.
Acceptance: uploads survive switching airplane mode on and off, hidden photos stop counting, and ending an event blocks further uploads.

### Phase 3 - The AI editor (no video rendering yet)
The test-photo import command; pre-filtering and de-duplication; the AI module with the Claude editor, the rule-based editor and the mock editor; vision analysis with caching; wish quality scoring; quality-based selection of photos and wishes as described in section 10; story planning; the edit plan structure, validation and "not a slideshow" check; cost limits; the music library loader and beat and energy analysis; the song selection screen in the admin page with previews and default-song handling; custom song upload with consent; an owner page showing the edit plan as a readable timeline together with the reasons photos and wishes were included or left out; the plan-printing command; and tests with a mocked AI covering a valid plan, an invalid plan that retries and then falls back, the API being down, and the cost limit being hit.
Acceptance: given a folder of real photos of mixed quality, the plan-printing command outputs a valid plan that passes the "not a slideshow" check, with and without an API key. The number of photos and wishes chosen differs between a high-quality set and a mixed-quality set, and weak photos are excluded with reasons.

### Phase 4 - Renderer and music mix
The plan-to-video renderer from section 12 with two styles, beat-aligned cuts, collages, bursts, wish cards, credits, the top-photographers card, the audio mix with fades and loudness normalization, the 720p preview followed by the 1080p final, failure handling with retry, and worker integration so that ending an event runs analysis, planning, preview rendering and final rendering in order.
Acceptance: ending a test event built from real photos produces a watchable 720p preview within a few minutes, with visible variety (different shot lengths, collages, a burst, wish overlays) and cuts that land on the beat.

### Phase 5 - Keepsake, re-edit, vertical video, deployment
The printable wishes keepsake page containing every visible wish, highlights, the montage download page, "Try another edit" limited to 2 using the cached analysis, 9:16 vertical export with smart cropping, owner statistics for storage and AI cost, the retention purge with tests, error pages, the S3-compatible storage driver, deployment notes (Linux server, reverse proxy, process manager for the web app and the worker, SQLite backups), and an optional browser-based smoke test.

## 15. Quality bar

- Linting, type checking and tests must pass before a phase counts as complete.
- The README grows with each phase: setup, environment settings, how to run the web app and the worker, how to test on a phone, how to add songs, and how to run the AI editor on a folder of photos. It also lists the exact npm commands.
- Test the guest pages at a 360-pixel-wide screen. Use small commits with clear messages. Do not rewrite finished phases unless something is broken.

Start now: report the state of the repository (if any), then give me a short plan for the first unfinished phase (packages, folder structure and build order), and wait for my approval before implementing.