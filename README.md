# WedSnap

A Next.js web app for wedding guests to scan a QR code, take photos in the browser, and send wishes. When the event ends, an AI editor chooses the best photos and wishes, plans the edit, and renders a montage video.

## Setup

### Prerequisites
- Node.js current LTS
- npm
- SQLite with better-sqlite3
- Sharp
- FFmpeg
- A tunnel service such as Cloudflare Tunnel or ngrok for HTTPS on phones

### Install Dependencies

```bash
npm install
```

### Database Setup

1. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=file:./dev.db
   JWT_SECRET=your_jwt_secret
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

2. Run database migrations:
   ```bash
   npm run migrate
   ```

3. Seed the database:
   ```bash
   npm run seed
   ```

### Development Server

Run the development server:

```bash
npm run dev
```

### Worker (Jobs, AI Editing, Rendering)

Run the worker for processing jobs:

```bash
npm run worker
```

### Importing a Folder of Real Photos as a Test Event

To import a folder of photos for testing:

```bash
npm run import-photos -- --path /path/to/photos
```

### Print an Edit Plan for an Event Without Rendering

To print an edit plan for an event:

```bash
npm run print-edit-plan -- --eventId <eventId>
```

### Testing

Run tests:

```bash
npm run test
```

### Linting and Type Checking

Run linting and type checking:

```bash
npm run lint
npm run type-check
```

### Camera Testing

To test the camera functionality on a phone:

1. Set up a tunnel service such as Cloudflare Tunnel or ngrok:
   ```bash
   ngrok http 3000
   ```

2. Allow the tunnel host in the Next.js configuration.

3. Scan the QR code provided by the tunnel service.

## Project Structure

- **/app**: Next.js application routes and pages
- **/components**: Reusable React components
- **/lib**: Utility functions and libraries
- **/services**: Business logic and API services
- **/styles**: Tailwind CSS styles
- **/utils**: Utility functions
- **/ai**: AI-related logic and editor implementations
- **/database**: Database schema and migrations
- **/tests**: Test files

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Notes

- The camera needs HTTPS on phones. Use a tunnel service for development.
- Photos are private and served only through authorized handlers or short-lived signed links.
- Never log photo content or guest names.

### Prerequisites
- Node.js current LTS
- npm
- SQLite with better-sqlite3
- Sharp
- FFmpeg
- A tunnel service such as Cloudflare Tunnel or ngrok for HTTPS on phones

### Install Dependencies

```bash
npm install
```

### Database Setup

1. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL=file:./dev.db
   JWT_SECRET=your_jwt_secret
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

2. Run database migrations:
   ```bash
   npm run migrate
   ```

3. Seed the database:
   ```bash
   npm run seed
   ```

### Development Server

Run the development server:

```bash
npm run dev
```

### Worker (Jobs, AI Editing, Rendering)

Run the worker for processing jobs:

```bash
npm run worker
```

### Importing a Folder of Real Photos as a Test Event

To import a folder of photos for testing:

```bash
npm run import-photos -- --path /path/to/photos
```

### Print an Edit Plan for an Event Without Rendering

To print an edit plan for an event:

```bash
npm run print-edit-plan -- --eventId <eventId>
```

### Testing

Run tests:

```bash
npm run test
```

### Linting and Type Checking

Run linting and type checking:

```bash
npm run lint
npm run type-check
```

### Camera Testing

To test the camera functionality on a phone:

1. Set up a tunnel service such as Cloudflare Tunnel or ngrok:
   ```bash
   ngrok http 3000
   ```

2. Allow the tunnel host in the Next.js configuration.

3. Scan the QR code provided by the tunnel service.

## Project Structure

- **/app**: Next.js application routes and pages
- **/components**: Reusable React components
- **/lib**: Utility functions and libraries
- **/services**: Business logic and API services
- **/styles**: Tailwind CSS styles
- **/utils**: Utility functions
- **/ai**: AI-related logic and editor implementations
- **/database**: Database schema and migrations
- **/tests**: Test files

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Notes

- The camera needs HTTPS on phones. Use a tunnel service for development.
- Photos are private and served only through authorized handlers or short-lived signed links.
- Never log photo content or guest names.