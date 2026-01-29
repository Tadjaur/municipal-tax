# Municipal Tax Management System

A comprehensive tax management system for municipalities in Gabon, built with Firebase, Hono.js, React, and HeroUI.

## Features

- 🏛️ **Admin Portal**: Complete dashboard for tax administration
- 👥 **Economic Operator Management**: Registration, approval, and service assignment
- 💰 **Payment Processing**: MyPayga integration for Airtel Money payments
- 📊 **Analytics Dashboard**: Real-time revenue tracking and tax distribution
- 🔐 **Role-Based Access Control**: Admin, Agent, and Operator roles
- 📝 **Audit Logging**: Complete trail of all data modifications
- 📱 **Responsive Design**: Works on desktop and mobile

## Technology Stack

### Backend
- **Hono.js** - Fast web framework
- **Firebase Cloud Functions** - Serverless backend
- **Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **MyPayga API** - Payment processing

### Frontend
- **Vite** - Build tool
- **React 18** - UI library
- **HeroUI** - Component library
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Zustand** - State management
- **React Router** - Navigation

### Development
- **TypeScript** - Type safety
- **Bun** - Package manager
- **Vitest** - Testing framework
- **Zod** - Schema validation

## Project Structure

```
municipal-tax/
├── packages/
│   ├── web-admin/          # Admin dashboard
│   ├── web-client/         # Client portal  
│   ├── functions/          # Hono.js Cloud Functions
│   └── shared/             # Shared types and utilities
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- Bun package manager
- Firebase CLI
- MyPayga account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd municipal-tax
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup Firebase**
   ```bash
   firebase login
   firebase init
   ```
   - Select your Firebase project
   - Configure Firestore, Functions, and Hosting

4. **Configure environment variables**

   For web-admin:
   ```bash
   cd packages/web-admin
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

   For functions:
   ```bash
   cd packages/functions
   cp .env.example .env
   # Add your MyPayga API keys
   ```

5. **Start development servers**

   Terminal 1 - Firebase emulators:
   ```bash
   firebase emulators:start
   ```

   Terminal 2 - Admin portal:
   ```bash
   bun run dev:admin
   ```

   Terminal 3 - Client portal (optional):
   ```bash
   bun run dev:client
   ```

### Firebase Emulator UI

Access the Firebase Emulator UI at: http://localhost:4000

- **Auth**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Hosting**: http://localhost:5000

## Development

### Running Tests

```bash
bun test
```

Watch mode:
```bash
bun test:watch
```

### Building for Production

Build all packages:
```bash
bun run build:admin
bun run build:client
bun run build:functions
```

### Deployment

Deploy admin portal:
```bash
firebase deploy --only hosting:admin
```

Deploy client portal:
```bash
firebase deploy --only hosting:client
```

Deploy functions:
```bash
firebase deploy --only functions
```

Deploy everything:
```bash
firebase deploy
```

## API Documentation

### Authentication

All API endpoints (except payment callback) require a Firebase Auth token:

```
Authorization: Bearer <firebase-id-token>
```

### Endpoints

**Services**
- `GET /api/services` - List all services
- `POST /api/services` - Create service (Admin only)
- `PUT /api/services/:id` - Update service (Admin only)
- `DELETE /api/services/:id` - Delete service (Admin only)

**Payments**
- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments/initiate` - Initiate payment
- `POST /api/payments/callback` - MyPayga callback (no auth required)
- `POST /api/payments/:id/send-receipt` - Send receipt (Admin)

## User Roles

### Admin
- Full system access
- Manage services
- Approve operators
- Assign services to operators
- View all payments
- Send receipts

### Agent
- Create economic operators
- Create payment requests
- View operators and payments

### Operator (Economic Operator)
- Register business
- View assigned services
- View payment history
- Request payments for expired services

## MyPayga Integration

The system integrates with MyPayga for Airtel Money payments in Gabon.

### Test Credentials (Sandbox)

- Test Phone Number: `07712345`
- Country: `GA` (Gabon)
- Network: Airtel Gabon

### Callback Verification

All callbacks from MyPayga are verified using HMAC SHA512 signatures to ensure authenticity.

## Security

- Firestore security rules enforce role-based access
- All API requests require authentication
- Payment callbacks verified with HMAC signatures
- Audit logging for all data modifications
- Environment variables for sensitive data

## Future Migration to Cloudflare

The current implementation uses Firebase services but is designed for easy migration to Cloudflare:

- Backend uses standard HTTP (Hono.js can run on Cloudflare Workers)
- Database queries use abstraction layer
- Storage operations are modular
- Auth can be swapped with Cloudflare Access

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support, contact: [your-email@example.com]
