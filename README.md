# Taher Enterprise — Backend

The backend REST API for the Taher Enterprise gas management application. Built with Node.js, Express, TypeScript, and MongoDB, it provides authentication, product management, customer quota management, payment integration, and supporting services.

## Features

- **Authentication:** User authentication and session-related functionality.
- **User Management:** User account management.
- **Product Management:** Create, retrieve, update, and manage product information.
- **Category Management:** Organize products by category.
- **Brand Management:** Manage product brands.
- **Type and Section Management:** Manage product types and website sections.
- **Quota Management:** Handle customer quota requests.
- **Payment Integration:** Support payment workflows using SSLCommerz.
- **Image Uploads:** Integrate with Cloudinary for image storage.
- **Email and OTP:** Support email-related and one-time-password functionality.
- **Request Validation:** Validate incoming requests using the project's validation middleware.
- **Error Handling:** Centralized error-handling and not-found middleware.
- **Database Integration:** Store application data in MongoDB using Mongoose.
- **Caching and Supporting Services:** Integrate with Redis.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Redis
- JSON Web Tokens (JWT)
- Passport.js
- Zod (request validation)
- Cloudinary
- SSLCommerz
- Nodemailer / SMTP email integration

## Prerequisites

Before running the backend, install or obtain access to:

- Node.js and npm
- A MongoDB database
- A Redis instance
- Cloudinary credentials
- SMTP email credentials
- SSLCommerz credentials for payment functionality

Some integrations may require valid credentials to work fully. Configure them according to your development or deployment environment.

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_BACKEND_REPOSITORY_URL>
cd <YOUR_BACKEND_PROJECT_DIRECTORY>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the backend project root. The application loads environment variables through `dotenv`.

Example configuration:

```env
PORT=5000
DB_URL=mongodb://127.0.0.1:27017/taher-enterprise
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

BCRYPT_SALT_ROUNDS=10

JWT_ACCESS_EXPIRES=15m
JWT_ACCESS_SECRET=replace_with_a_secure_secret
JWT_REFRESH_SECRET=replace_with_a_secure_secret
JWT_REFRESH_EXPIRES=7d

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=

SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=replace_with_a_secure_password

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_USER=
SMTP_PASS=
SMTP_PORT=587
SMTP_HOST=
SMTP_FROM=

SSL_STORE_ID=
SSL_STORE_PASS=
SSL_PAYMENT_API=
SSL_VALIDATION_API=
SSL_SUCCESS_FRONTEND_URL=
SSL_FAIL_FRONTEND_URL=
SSL_CANCEL_FRONTEND_URL=
SSL_SUCCESS_BACKEND_URL=
SSL_FAIL_BACKEND_URL=
SSL_CANCEL_BACKEND_URL=
SSL_IPN_URL=
```

**Important:** This is a template, not a guarantee that every variable name matches your current configuration. Check `src/app/config/env.ts` and your existing `.env` file before using it. Your configuration loader also requires `SSL_IPN_URL`; make sure any additional variables used by your code are included.

Never commit your real `.env` file or share private credentials publicly.

### 4. Run the development server

Use the development command defined in your `package.json`. If the project has a `dev` script, run:

```bash
npm run dev
```

The server connects to MongoDB and starts listening on the configured port. It also initializes Redis and seeds the super-admin account according to the existing startup logic.

By default, the API base path is:

```text
/api/v1
```

The root endpoint is:

```text
GET /
```

It returns a welcome response for Taher Enterprise.

### 5. Build for production

If your project defines the corresponding scripts, use:

```bash
npm run build
npm start
```

Check `package.json` for the exact build and start commands.

## API Modules

The API routes are registered under `/api/v1`.

| Base path | Purpose |
|---|---|
| `/api/v1/auth` | Authentication |
| `/api/v1/user` | User management |
| `/api/v1/otp` | OTP functionality |
| `/api/v1/section` | Section management |
| `/api/v1/type` | Product type management |
| `/api/v1/categories` | Category management |
| `/api/v1/brand` | Brand management |
| `/api/v1/products` | Product management |
| `/api/v1/quota` | Customer quota management |
| `/api/v1/upload` | Upload functionality |
| `/api/v1/payment` | Payment operations |

The HTTP methods, request bodies, response structures, and authorization requirements depend on each module's route and controller definitions.

## Project Structure

```text
backend/
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   └── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Security and Configuration

- Keep secrets in environment variables.
- Validate incoming request data before processing it.
- Enforce authentication and role-based authorization on protected endpoints.
- Avoid exposing private user information or payment credentials in API responses.
- Configure CORS for trusted frontend origins.
- Use secure cookie settings and HTTPS in production.
- Keep production database credentials and API keys private.

## Deployment

Configure the production environment variables and ensure MongoDB, Redis, Cloudinary, SMTP, and payment credentials are available as required.

Set `FRONTEND_URL` to the deployed frontend origin and configure the frontend API URL to point to the deployed backend.

Test authentication, product operations, quota workflows, image uploads, and payment callbacks after deployment.

## License

This project was developed by Shafiqul Islam.
