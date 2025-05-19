# Yathashakti

A comprehensive platform for NGOs and Implementing Organizations to manage interest-free, morally repayable grants.

## Project Overview

Yathashakti facilitates the entire lifecycle of grants: from program definition and donor fund management to grantee onboarding (via Service Providers), grant disbursement to Service Providers, systematic repayment tracking from grantees (primarily via UPI), communication logging, and impact monitoring.

## Core Features

- Donor Management
- Program Management
- Service Provider Management
- Grantee Management
- Grant Lifecycle Management
- Ledger Management
- Task Management
- Dashboard & Reporting
- AI-Powered Features

## Technical Stack

- **Frontend Framework:** Next.js (App Router)
- **UI Library:** React
- **Component Library:** ShadCN UI (built on Radix UI & Tailwind CSS)
- **Styling:** Tailwind CSS
- **State Management:** React Context API, React Hooks, TanStack Query
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Validation:** Zod
- **File Handling:** Multer for uploads, CSV Parser for bulk imports
- **AI Integration:** OpenAI API (for program summaries and risk assessment)

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (create a `.env.local` file with database connection and auth settings)
4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- `/src/app` - Next.js application pages
- `/src/components` - React components
- `/src/lib` - Utility functions, API clients, and hooks
- `/src/contexts` - React contexts for state management
- `/public` - Static assets
- `/src/__tests__` - Test files including unit, E2E, and user journey tests
- `/cypress` - Cypress E2E testing configuration and tests
- `/.github/workflows` - CI/CD configuration for GitHub Actions

## Testing

The project includes comprehensive test automation:

### Unit Tests

Run unit tests with Jest:

```bash
npm test
```

Unit tests cover individual components and API functionality, ensuring each part of the application works correctly in isolation.

### End-to-End Tests

E2E tests use Cypress to simulate real user interactions:

```bash
# Install Cypress (if not already installed)
npm install cypress

# Open Cypress test runner
npx cypress open

# Run tests headlessly
npx cypress run
```

### User Journey Tests

Documented test cases for key user flows are available in `/src/__tests__/user-journeys`.

### CI/CD Integration

Tests run automatically on GitHub Actions when code is pushed or pull requests are created. The configuration is in `.github/workflows/test.yml`.

## Deployment

The application can be built for production using:

```bash
npm run build
npm start
```

## License

Proprietary
