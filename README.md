# Inventory Management & Financial Dashboard

## Overview

A modern, comprehensive web application built to streamline inventory tracking, manage role-based team access, and track financial performance. Developed using **React**, **Vite**, and **Firebase**, this platform offers a sleek, responsive design featuring a premium dark glassmorphism theme with dynamic teal and gold accents.

### Core Management Capabilities

- **Role-Based Access Control (RBAC):** Distinct interfaces for Administrative and Engineering roles. Engineers can operate and view the system securely, while sensitive financial metrics and purchase costs remain completely hidden. Administrator accounts possess full oversight over costs, system approvals, and revenues.
- **Inventory Tracking:** Real-time visibility into stock levels, with automated adjustments upon item purchases or when engineers place new orders. Built-in low-stock alerts ensure your inventory never runs out unexpectedly.
- **Financial Dashboard:** A powerful, dedicated administrative dashboard that automatically aggregates operational revenue, expenses, and net profit in real-time, helping decision-makers monitor the overall financial health of the organization at a glance.
- **Order Approval Workflow:** Streamlined operational workflow where engineers can submit formal stock or service orders. These are instantly routed to administrators for formal review, approval, or rejection.

## Features at a Glance

- Comprehensive Product Management (Create, Read, Update, Delete)
- Real-time stock updates and low-quantity notifications
- Native Arabic language support for regional teams and operations
- Secure user authentication, registration, and session management
- Fully responsive design optimized for seamless use on desktop, tablet, and mobile devices
- Deeply engaging UI featuring glass-pane cards, subtle modern micro-animations, and polished typography

## Technical Stack

- **Frontend Architecture:** React.js, Vite build tool
- **Styling:** Custom CSS design system, CSS Variables, smooth modern gradients, Google Fonts (Inter)
- **Backend Infrastructure:** Firebase Ecosystem (Authentication, Firestore Realtime Database, Hosting)
- **Developer Tools:** Vite local development server, ESLint, Prettier

## Running the Project Locally

### Prerequisites

- Node.js (v20 or newer)
- npm (v10 or newer)
- An active Firebase Project

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AhmadRamadan74/inventory.git
   cd inventory-app
   ```

2. **Install core dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   Initialize a new application within your Firebase Developer Console. Enable **Authentication** (Email/Password) and the **Firestore Database**. Obtain your Firebase project configuration limits and place them into a standard `.env` configuration file at the root of the project. Please follow standard Vite Firebase environment variable naming conventions (e.g., `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.). **Do not commit this `.env` file to version control.**

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to the local URL provided in your terminal (usually `http://localhost:5173`) to view and interact with the application.

## Deployment Guidelines

Because this application relies on a modern Single Page Application (SPA) architecture, it is fully optimized to deploy efficiently on static-hosting services.

To compile and deploy to **Firebase Hosting**:
```bash
# Compile for production
npm run build

# Deploy statically to Firebase
firebase deploy --only hosting
```

## Contributing Procedures

We welcome collaborative contributions to help improve this system! Please ensure that you:
1. Fork the repository.
2. Create your dedicated feature branch (`git checkout -b feature/AmazingNewFeature`).
3. Commit your modifications using clear, descriptive messages.
4. Validate that your code passes standard formatting and linting rules:
   ```bash
   npm run lint
   npm run format
   ```
5. Submit a comprehensive Pull Request describing your changes.

## License

This project is generously distributed under the strictly permissive MIT License. Please refer to the `LICENSE` document for comprehensive details.

---

*Built for modern warehouse and operation teams.*
