# CLAUDE.md

## Project: WedSnap
A Next.js web app where wedding guests scan a QR code, take photos in the browser and send wishes. When the event ends, an AI editor chooses the best photos and wishes, plans the edit and renders a montage video. The full requirements are in SPEC.md. Always read SPEC.md before starting work and follow its phases.

### Ponytail (active)
The ponytail plugin is enabled and running at `full` level. It pushes me to write the least code that works: skip features nobody asked for, reuse what the codebase already has, and avoid new dependencies. It also keeps a ledger of gains and losses. Switch level with `/ponytail lite|full|ultra`, or say "stop ponytail" / "normal mode" to turn it off.

### How to work
- Build one phase at a time. Finish it, make sure linting, type checking and tests pass, commit, then stop and wait for me to say "next phase".
- Before big changes, show a short plan covering files and packages.
- When something is ambiguous, choose a sensible default, tell me in one line, and continue. Do not ask many questions.
- Do not rewrite finished phases unless something is broken. If the repository already has code, read it first and continue from the first unfinished phase instead of starting over.
- I am a student developer. Explain briefly what you did and why, in plain language, and point out anything worth learning.
- Never add features outside SPEC.md. Suggest them at the end instead.

### Environment (strict)
- Windows 11, native only. Do not use or suggest WSL, XAMPP, Docker, Redis or Python.
- Node.js current LTS and npm. Commands must work in both PowerShell and Git Bash.
- Use cross-platform npm scripts. No scripts that only work in bash. Build paths with Node's path utilities.
- If a package needs native compilation and fails to install, stop and tell me the fix before switching approach.
- Production later is a Linux server with Node behind a reverse proxy and S3-compatible storage. The same code must run on both systems.

### Stack
Next.js App Router, React, strict TypeScript, Tailwind, SQLite with better-sqlite3 and Drizzle, sharp, zod, bcryptjs, the qrcode package, idb, ffmpeg-static, the Anthropic SDK, a pure JavaScript beat estimator, and Vitest. File storage goes through the storage driver interface (local disk in development, S3-compatible in production).

### Commands
- The README must always list the exact npm scripts for: installing, running database migrations and seeding, the development server, the worker (jobs, AI editing, rendering), importing a folder of real photos as a test event, printing an edit plan for an event without rendering, tests, linting and type checking.
- Keep that list updated whenever scripts change.
- The camera needs HTTPS on phones. Phone testing uses a tunnel service such as Cloudflare Tunnel or ngrok pointed at the development server, with the tunnel host allowed in the Next.js configuration. Document the steps in the README.

### Code conventions
- Validate every request with zod. Keep route handlers thin, put logic in services, and put background work in jobs.
- Access the database only through Drizzle. Create migrations with drizzle-kit and commit them.
- Write tests for every route that changes data. Use shared test helpers instead of ad-hoc database inserts.
- Comment only where the reason is not obvious. No dead or commented-out code.
- All user-facing text goes through the translation dictionaries, with Malay as the default and English as the second language. No hardcoded strings in components.
- Make small commits with clear messages.

### Security and privacy (never skip)
- Validate uploads by actually decoding the image with sharp, not just checking the file type. Enforce size and pixel limits, strip metadata, use random file names, and make uploads idempotent using the client-generated ID.
- Resolve the event and guest on the server from the slug and token. Never trust IDs sent by the client.
- Rate-limit uploads, wishes and PIN attempts. Hash PINs and passwords with bcryptjs.
- Escape all user text. Never log photo content or guest names.
- Photos are private. Serve them only through authorized handlers or short-lived signed links.
- Never commit secrets. Keep the example environment file current.
- Guest pages must not collect phone numbers or email addresses.
- Photos are sent to the Anthropic API for the AI editor. Keep the consent text and the README privacy note accurate.

### AI editor
- The montage is edited by AI and is never a plain slideshow. The flow is: cheap pre-filter, vision analysis, wish scoring, story plan, validation, then a deterministic FFmpeg render. The renderer never calls AI.
- All AI code lives in the AI module behind a common editor interface with three implementations: the Claude editor, the rule-based fallback editor and a mock editor for tests. Any API failure, invalid output or cost-limit hit falls back to the rule-based editor, so a video is always produced.
- The AI decides how many photos and wishes to include, based on quality. There are no fixed quotas. Include only clearly good photos and high-quality wishes, never pad a short video with weak material, and let the video length follow from the amount of good material. The only limits are a configurable safety ceiling for render time and cost and a sensible minimum for very small events.
- Never rewrite a guest's wish. Every visible wish is still kept in full in the keepsake page even when it is not used in the video.
- Record for every photo and wish whether it was used and why not, and show this to the owner.
- Every edit plan must pass the "not a slideshow" check described in SPEC.md: varied shot lengths, collages and a fast burst when enough material exists, varied transitions, subject-aware motion, text moments and cuts on the beat.
- Respect the AI cost limits. Send only small thumbnails of photos that are not hidden. Cache analysis per photo. Never log image content or guest names.
- The model name and API key come from environment settings. Tests must mock the SDK and never call the real API.

### Cost and performance
- This sells for RM49 per wedding, so keep the cost per event very low.
- Compress photos on the phone before upload, around 2000 pixels on the longest side at about 0.8 JPEG quality.
- Process jobs one at a time, clean up temporary files, and respect the event retention period (default 90 days).
- Prefer deterministic code (sharp, FFmpeg) wherever AI is not needed.

### Frontend
- Mobile-first. Test the guest pages at a 360-pixel-wide screen. Use large buttons and large text for older users.
- Getting from a QR scan to the first photo must take 3 taps or fewer.

### Montage and music
- Music must be royalty-free and come from the music library file. Never download or bundle copyrighted music. Song selection order: the couple's own uploaded song (with consent), then the song they chose, then the style's default song, then silence. The pipeline must work with an empty library.
- Custom song uploads need the visible warning and the consent checkbox, and are deleted together with the event.
- Cuts land on the beat. Render a 720p preview first and then the 1080p final, both from the saved edit plan.
- Record failures in the montage record with an error message and provide a retry action in the owner area.
- Text overlays use bundled open-license fonts. Remove emoji from overlay text.

### Parallel sessions (only when I run several terminals)
- Each session has a role file in the docs roles folder. Stay inside the folders your role owns.
- Shared files (the database schema, package configuration and project config) are changed only by the builder session. Other roles ask me first.
- Never merge branches yourself.

### Definition of done for each phase
1. The acceptance criteria in SPEC.md are met.
2. Linting, type checking and tests pass.
3. The README is updated with how to run and test the phase.
4. I receive a short manual test checklist for my phone.
5. The changes are committed.

## gstack

Use the /browse skill from gstack for all web browsing. Never use the mcp claude-in-chrome tools, because /browse is the sanctioned, feature-complete path.

### Setup for teammates

gstack is not vendored in this repo; it is a symlink to the global install at the skills folder inside the .claude folder in the home directory, under gstack. To get the full skill set on a new machine, clone the gstack repository from GitHub (garrytan/gstack, single branch, depth 1) into that location and then run its setup script. The setup script installs bun and Playwright if they are missing. After that, all gstack skills, including /browse, are available globally.