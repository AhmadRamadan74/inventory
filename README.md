# Inventory Management Web App

![Inventory App Screenshot](file:///C:/Users/Rmdn/.gemini/antigravity/brain/a446798a-19bc-4224-86f1-fb4f00266ffa/inventory_app_screenshot_1775142296638.png)

## Overview

A modern, responsive web application for managing inventory, built with **React**, **Vite**, and **Firebase**. The app supports Arabic language, role‑based access (Admin & Engineer), and provides a sleek glass‑morphism UI with dark mode, vibrant teal and gold accents.

## Features

- **Product Management** – Create, read, update, and delete products.
- **Purchase Tracking** – Automatic inventory updates on purchases.
- **Low‑Stock Alerts** – Real‑time notifications when stock is low.
- **Order Workflow** – Engineers place orders, admins approve or reject.
- **Role‑Based UI** – Engineers cannot see purchase costs; admins have full visibility.
- **Responsive Design** – Works on desktop, tablet, and mobile devices.
- **Premium UI** – Glass‑morphism cards, smooth micro‑animations, and custom typography (Inter).

## Tech Stack

- **Frontend**: React, Vite, vanilla CSS (custom design system), Google Fonts (Inter)
- **Backend / Services**: Firebase Authentication, Firestore, Hosting
- **Build & Tooling**: Vite dev server (`npm run dev`), ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm (v10 or later)
- A Firebase project with Authentication and Firestore enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/inventory-app.git
cd inventory-app

# Install dependencies
npm install
```

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable **Authentication** (Email/Password) and **Firestore**.
3. Copy the Firebase config from the project settings.
4. Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the App

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The app will automatically reload on code changes.

## Deployment

The app can be deployed to **Firebase Hosting** or any static‑site host.

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes with clear messages.
4. Open a Pull Request describing the changes.

Make sure to run linting and formatting before submitting:

```bash
npm run lint
npm run format
```

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

*Built with love by the inventory‑app team.*
