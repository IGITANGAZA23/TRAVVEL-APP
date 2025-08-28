# Project Summary
TRAVVEL is a mobile ticket booking platform designed to streamline the process of purchasing transport tickets. By enabling users to book tickets online and receive them instantly on their mobile devices, TRAVVEL aims to reduce the inconvenience caused by long queues and inadequate customer service at transport hubs. The app integrates with existing payment systems like MTN Mobile Money and MasterCard, allowing users to manage their travel plans efficiently while ensuring secure transactions. With features such as real-time updates and ticket exchanges, TRAVVEL enhances the overall travel experience.

# Project Module Description
## Core Features
1. **User Authentication**: Sign up and log in with payment integration.
2. **Route Search**: Find routes by departure and destination cities.
3. **Ticket Booking**: Book tickets for multiple passengers with QR code generation.
4. **Payment Integration**: Support for MTN Mobile Money, MasterCard, and more.
5. **Ticket Management**: View and manage booked tickets.
6. **Appeals System**: Request time changes and exchange tickets with other passengers.

# Directory Tree
```
shadcn-ui/
├── README.md                # Project documentation and overview
├── components.json          # UI component definitions
├── eslint.config.js         # ESLint configuration
├── index.html               # Main HTML file
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── public/
│   ├── favicon.svg          # Favicon for the application
│   └── robots.txt           # Robots.txt for search engines
├── src/
│   ├── App.css              # Global styles
│   ├── App.tsx              # Main application component
│   ├── components/          # UI components
│   ├── contexts/            # Context API for state management
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Application pages
│   ├── lib/                 # Utility functions
│   ├── main.tsx             # Application entry point
│   ├── vite-env.d.ts        # Vite environment types
│   ├── vite.config.ts       # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

# File Description Inventory
- **README.md**: Overview of the project, setup instructions, and features.
- **components.json**: Defines UI components used throughout the application.
- **eslint.config.js**: Configuration file for ESLint to maintain code quality.
- **index.html**: The main HTML file that serves the React application.
- **package.json**: Lists project dependencies and scripts for building and running the application.
- **postcss.config.js**: Configuration for PostCSS to process CSS files.
- **public/**: Contains static assets like the favicon and robots.txt.
- **src/**: Contains all source code files, including components, pages, contexts, and hooks.
- **tailwind.config.ts**: Configuration file for Tailwind CSS.
- **vite.config.ts**: Configuration file for Vite, the build tool used.

# Technology Stack
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Build tool for faster development and production builds.
- **Shadcn-UI**: UI component library for building accessible components.
- **Context API**: For state management across the application.

# Usage
1. **Install Dependencies**: Run the command to install all required packages.
   ```bash
   pnpm install
   ```
2. **Build the Application**: Use the following command to build the project for production.
   ```bash
   pnpm run build
   ```
3. **Run the Application**: Start the development server.
   ```bash
   pnpm run dev
   ```
