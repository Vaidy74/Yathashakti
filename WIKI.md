# Yathashakti Platform Documentation

Welcome to the Yathashakti project documentation!  
This all-in-one guide covers a high-level overview, platform features, usage instructions, setup, and more.

---

## Table of Contents

- [Executive Summary / Platform Overview](#executive-summary--platform-overview)
- [Platform Features](#platform-features)
- [How to Use the Platform](#how-to-use-the-platform)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)
- [References](#references)

---

## Executive Summary / Platform Overview

**Yathashakti** is a comprehensive platform for NGOs and Implementing Organizations to manage interest-free, morally repayable grants.

It is designed to help non-profit organizations efficiently manage the entire lifecycle of grants, from program definition to impact monitoring.

- **Mission:** Empower NGOs and implementing organizations with digital tools to efficiently distribute, track, and measure the impact of interest-free grants.
- **Key Benefits:**  
  - End-to-end grant lifecycle management
  - Comprehensive analytics and reporting
  - AI-powered insights and decision support
  - Enhanced transparency and accountability

---

## Platform Features

Yathashakti offers a comprehensive suite of features to manage the entire grant lifecycle:

- **Donor Management:** Track donor information, contributions, and relationships.
- **Program Management:** Define programs with multi-tabbed interface and filter capabilities.
- **Service Provider Management:** Maintain provider information with enhanced fields and complete CRUD operations.
- **Grantee Management:** Onboard and manage grantees with document upload and bulk import functionality.
- **Grant Lifecycle Management:** Handle the complete grant process from application to impact evaluation.
- **Ledger Management:** Track financial transactions with filtering, pagination, and categorization.
- **Reports & Dashboard:** Access analytics with grant statistics, charts, and custom report building.
- **AI Assistant:** Get context-aware suggestions and insights powered by Hugging Face API.
- **Authentication & Authorization:** Secure login with role-based access control and protected routes.
- **Technical Infrastructure:** Enterprise-grade security with rate limiting, CSRF protection, and input validation.

---

## How to Use the Platform

1. **Sign Up / Log In**
    - Access the secure login page
    - Authenticate using your provided credentials
    - The system enforces role-based access control
    
2. **Navigating the Dashboard**
    - The main Analytics Dashboard provides key insights at a glance
    - Access different sections through the sidebar navigation
    - Monitor section gives access to analytics dashboard and reports
    
3. **Managing Grantees**
    - Add new grantees individually or through bulk onboarding
    - View grantee list with search and filtering options
    - Access detailed grantee information and upload documents
    
4. **Managing Grants**
    - Create new grants with the structured input form
    - Track repayments and communications
    - View grant details and status
    
5. **Financial Management**
    - Record and categorize transactions
    - Access transaction details and edit/delete functionality
    - Filter transactions and view reports
    
6. **Generating Reports**
    - Use the custom report builder to select templates and fields
    - Configure filters and export options
    - Generate and export reports in PDF or Excel format
    
7. **Using the AI Assistant**
    - Access context-aware suggestions for various tasks
    - Get intelligent recommendations based on application state
    - Utilize AI-powered analysis for grants and programs

---

## Getting Started

**Prerequisites:**  
- Node.js (v14 or higher)
- PostgreSQL database
- Git

**Installation:**  
```bash
# Clone the repository
git clone https://github.com/Vaidy74/Yathashakti.git
cd Yathashakti

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database connection and auth settings

# Set up the database
npx prisma migrate dev

# Start the development server
npm run dev
```

**Quickstart:**  
1. Navigate to `http://localhost:3000` in your browser
2. Log in with your credentials
3. Explore the dashboard and features

---

## Project Structure

The Yathashakti platform follows a well-organized structure:

```
Yathashakti/
├── src/                         # Source code
│   ├── app/                     # Next.js application pages
│   │   ├── api/                 # API routes with pagination and validation
│   │   └── [various routes]/    # Application routes and pages
│   ├── components/              # React components
│   ├── contexts/                # React contexts for state management
│   ├── lib/                     # Utility functions, API clients, hooks
│   └── utils/                   # Utility functions including pagination
├── public/                      # Static assets
├── prisma/                      # Database schema and migrations
├── .github/workflows/           # CI/CD configuration
├── KANBAN.md                    # Project management board
├── README.md                    # Project overview
└── WIKI.md                      # Comprehensive documentation (this file)
```

---

## Usage

**Authentication:**  
The platform uses NextAuth.js for authentication. Users must log in to access protected features.

**Role-Based Access:**  
Different user roles have different permissions:
- Administrators have full access
- Program Managers can manage programs and grants
- Finance Officers have access to financial data
- Users have limited read access

**API Endpoints:**  
All API endpoints follow a consistent pattern with pagination, filtering, and proper error handling:

```typescript
// Example API usage
const response = await fetch('/api/grantees?page=1&limit=10&search=name');
const data = await response.json();
```

---

## Contributing

**How to Contribute:**  
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Definition of Done:**  
A task is considered complete when it meets all of the following criteria:

1. **Code Complete**: All code changes are implemented and working as expected.
2. **Testing**: Unit tests are written and passing (100% coverage required).
3. **Documentation**: Code is properly documented and any necessary user documentation is updated.
4. **Code Review**: Pull request has been approved by at least one team member.
5. **CI/CD**: All automated tests are passing in the CI/CD pipeline.
6. **Security**: Code follows security best practices and passes security scans.
7. **Performance**: Changes meet performance requirements and don't introduce regressions.
8. **Accessibility**: UI changes meet accessibility standards.
9. **Cross-browser**: Functionality works across supported browsers.

---

## FAQ

**Q: Is the platform mobile-responsive?**  
A: Yes, the UI is built with responsive design principles using Tailwind CSS.

**Q: How is data secured in the platform?**  
A: The platform implements rate limiting, CSRF protection, input validation with Zod, and role-based access control.

**Q: Can I export data from the platform?**  
A: Yes, the reporting module allows exporting data in PDF and Excel formats.

---

## Troubleshooting

**Empty Dashboard Issues:**  
- If you see an empty database notification banner, it means no data has been added yet
- Add some sample data through the respective management sections

**Authentication Issues:**  
- Ensure your credentials are correct
- Check that your user account has the appropriate permissions
- For development environment authentication issues, check the AI-01.4 task in the KANBAN board

---

## Changelog

- **May 2025**
  - Implemented server-side pagination for all list views (PO-02)
  - Added rate limiting for API endpoints (TS-01)
  - Added CSRF protection (TS-02)
  - Implemented input validation with Zod (TS-03)

- **Earlier Releases**
  - Implemented core infrastructure features
  - Created reporting and analytics capabilities
  - Developed authentication and authorization systems
  - Built comprehensive management modules (Grantee, Grant, Donor, Program, Service Provider)

---

## References

- [GitHub Repository](https://github.com/Vaidy74/Yathashakti)
- [KANBAN Board](./KANBAN.md) - Track project progress and upcoming features
- [README](./README.md) - Quick project overview and setup instructions

---

> _This documentation is updated after every completed item in the backlog to reflect the latest state of the platform._
