# Private Chat Application

A production-ready, sleep-proof private chatting web app designed for 2 people.

## 1. System Architecture

- **Frontend**: React + Next.js 16 (App Router). Chosen for its robust server-side rendering, built-in API routes, and modern developer experience.
- **Backend**: Next.js API Routes. Keeps the project monolithic and simple to deploy on Vercel or Fly.io without managing a separate server.
- **Real-time**: Pusher (WebSockets). Provides reliable, low-latency messaging with automatic reconnection and fallback to polling if needed.
- **Database**: PostgreSQL (via Prisma ORM). Ensures persistent storage and data integrity.
- **File Storage**: S3-compatible (e.g., Cloudflare R2 or AWS S3). Scalable and reliable for handling images, videos, and documents.

## 2. Database Schema

### Message
- `id`: UUID (Primary Key)
- `content`: Text (Optional)
- `type`: Enum (TEXT, IMAGE, VIDEO, DOCUMENT)
- `fileUrl`: String (Optional)
- `fileName`: String (Optional)
- `fileSize`: Integer (Optional)
- `senderId`: String
- `senderName`: String
- `status`: String (default: "sent")
- `createdAt`: DateTime

### RateLimit
- `ip`: String
- `key`: String
- `count`: Integer
- `lastAttempt`: DateTime

## 3. API Design

- `POST /api/auth/login`: Validates CAPTCHA and secret code. Returns a JWT session cookie.
- `GET /api/auth/session`: Returns the current user session.
- `GET /api/messages`: Fetches the last 100 messages.
- `POST /api/messages`: Sends a new message and triggers a real-time event.
- `PUT /api/messages/status`: Marks messages as read.
- `POST /api/upload`: Generates an S3 presigned URL for secure file uploads.
- `POST /api/link-preview`: Fetches metadata for URL previews.

## 4. Frontend Structure

- **Pages**:
  - `/`: Landing page with login form.
  - `/chat`: Main chat interface (protected by proxy/middleware).
- **Components**:
  - `ChatHeader`: Displays status and logout.
  - `MessageList`: Handles scroll-to-bottom and message rendering.
  - `MessageBubble`: Renders different content types and read receipts.
  - `MessageInput`: Handles text input, file selection, and uploads.
  - `LinkPreview`: Async component for link metadata.

## 5. Security Flow

1. **Access**: Users must solve a math-based CAPTCHA and provide a 4-5 digit secret code.
2. **Verification**: The server verifies the CAPTCHA against a session cookie and the secret code against an environment-stored Bcrypt hash.
3. **Redirection**: If the secret code is wrong, the user is redirected to a configurable external URL (e.g., Google) to prevent brute-force discovery.
4. **Rate Limiting**: IP-based rate limiting on the login endpoint.
5. **Authorization**: All chat routes and APIs are protected by a JWT-signed HTTP-only cookie, verified in the Next.js `proxy.ts`.

## 6. Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment variables and platform-specific steps.
