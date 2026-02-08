# Deployment Guide

This app is optimized for deployment on **Vercel** or **Fly.io**.

## Environment Variables

The following environment variables are REQUIRED:

### Database (PostgreSQL)
- `DATABASE_URL`: Your PostgreSQL connection string.

### Authentication
- `CHAT_SECRET_CODE`: The 4-5 digit numeric code for access (e.g., `12345`).
- `CHAT_SECRET_HASHED`: The Bcrypt hash of the secret code (use a tool to generate this).
- `WRONG_CODE_REDIRECT_URL`: URL to redirect users who enter the wrong code (e.g., `https://www.google.com`).
- `JWT_SECRET`: A long, random string for signing session tokens.

### Pusher (Real-time)
- `NEXT_PUBLIC_PUSHER_KEY`: Your Pusher App Key.
- `NEXT_PUBLIC_PUSHER_CLUSTER`: Your Pusher Cluster (e.g., `mt1`).
- `PUSHER_APP_ID`: Your Pusher App ID.
- `PUSHER_SECRET`: Your Pusher Secret.

### S3 Storage (S3-Compatible, e.g., Cloudflare R2, AWS S3)
- `S3_ACCESS_KEY_ID`: Your S3 access key.
- `S3_SECRET_ACCESS_KEY`: Your S3 secret key.
- `S3_REGION`: Your S3 region (e.g., `auto`).
- `S3_ENDPOINT`: Your S3 endpoint (e.g., `https://<id>.r2.cloudflarestorage.com`).
- `S3_BUCKET_NAME`: Your bucket name.
- `NEXT_PUBLIC_S3_PUBLIC_URL`: The public URL base for accessing files (e.g., `https://pub-<id>.r2.dev`).

### Config
- `MAX_FILE_SIZE`: Maximum file size in bytes (default `52428800` for 50MB).

---

## Deploying to Vercel

1. Push this repository to GitHub.
2. Connect the repository to Vercel.
3. In the project settings, add all the environment variables listed above.
4. Vercel will automatically detect Next.js and deploy.
5. Run `npx prisma db push` (or `prisma migrate deploy`) against your production database to set up the schema.

## Deploying to Fly.io

1. Install Fly CLI.
2. Run `fly launch` in the project root.
3. When prompted, add a Postgres database.
4. Set secrets using `fly secrets set KEY=VALUE` for all the environment variables.
5. Deploy using `fly deploy`.
6. Use `fly ssh console` and run `npx prisma db push` to initialize the database.
