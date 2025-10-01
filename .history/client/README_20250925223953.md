# Letterboxd Clone - Client

This is the frontend client for the Letterboxd Clone application, built with React and Vite.

## Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable components
│   │   ├── auth/          # Authentication components
│   │   │   ├── LoginSignup.jsx
│   │   │   └── LoginSignup.css
│   │   ├── common/        # Common/shared components
│   │   │   ├── Header.jsx
│   │   │   └── Searchbar.jsx
│   │   ├── movie/         # Movie-related components
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── movieDetails.css
│   │   │   └── MovieGrid.jsx
│   │   └── ui/            # Basic UI components
│   │       └── Moviecard.jsx
│   ├── pages/             # Page components
│   │   └── Home.jsx
│   ├── assets/            # Static assets (images, icons)
│   │   ├── icons/         # Icon files
│   │   └── images/        # Image files
│   ├── styles/            # Global styles
│   │   ├── App.css
│   │   ├── index.css
│   │   └── home.css
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Application entry point
├── package.json
├── vite.config.js
└── index.html
```

## Component Organization

- **components/auth/**: Authentication-related components (login, signup)
- **components/common/**: Reusable components used across multiple pages (header, searchbar)
- **components/movie/**: Movie-specific components (details, grid)
- **components/ui/**: Basic UI building blocks (cards, buttons)
- **pages/**: Top-level page components
- **assets/**: Static files organized by type
- **styles/**: Global CSS files

## Development

To run the development server:

```bash
npm install
npm run dev
```

## Build

To build for production:

```bash
npm run build
```