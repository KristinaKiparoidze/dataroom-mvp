# Data Room

> Take-home project by Kristina Kiparoidze

Production-ready data room MVP built with Vite + React 19 + TypeScript + Tailwind CSS.

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Opens at http://localhost:5173

# Run tests
npm run test

# Build for production
npm run build
npm run preview  # Preview production build
```

### Project Structure

The codebase follows a clean architecture:

- **`src/data/`** - Pure functions for all business logic (CRUD operations)
- **`src/components/`** - React UI components (11 files, fully typed)
- **`src/utils/`** - Helper functions (naming, date filtering)
- **`src/tests/`** - 70+ unit and integration tests

### Development Notes

- Uses **React 19** with strict TypeScript
- **Tailwind CSS 4** for styling (no custom CSS needed)
- **Vitest** for testing (Jest-compatible API)
- **ESLint** with React Hooks rules enforced

## Features

**Core:** Nested folders, PDF upload (5MB max), search, filters (type/date), auto-save to localStorage  
**UX:** Inline rename, keyboard navigation, toast notifications, responsive (mobile → desktop)  
**Quality:** 70+ tests, TypeScript strict mode, full accessibility (ARIA, keyboard), clean architecture

## Screenshots

![Home View](./public/01-home.png)

![File Preview](./public/02-preview-file.png)

![Search & Filters](./public/03-filters.png)

## Architecture

```
src/
├── components/         # React components (11 files)
│   ├── Breadcrumbs.tsx     # Navigation path with clickable segments
│   ├── FileViewer.tsx      # PDF modal viewer with pdfjs rendering
│   ├── ItemContextMenu.tsx # Three-dot menu for rename/delete
│   ├── ItemList.tsx        # List container for folders and files
│   ├── ItemRow.tsx         # Individual row with inline edit & menu
│   ├── Toolbar.tsx         # Create folder, upload, back actions
│   ├── ToastStack.tsx      # Toast notification system
│   ├── icons.tsx           # SVG icons as React components
│   └── ...
├── data/              # Business logic (pure functions)
│   ├── dataService.ts     # localStorage persistence
│   ├── fileActions.ts     # File CRUD operations
│   ├── folderActions.ts   # Folder CRUD operations
│   └── initializeState.ts # Default data setup
├── utils/             # Helpers
│   ├── dates.ts           # Date constants for filtering
│   └── naming.ts          # Auto-deduplication logic
├── tests/             # Test suite (70+ tests)
│   ├── data/actions.test.ts       # Full CRUD operation tests
│   ├── utils/naming.test.ts       # Naming logic & duplicate detection
│   ├── components/ItemContextMenu.test.tsx # Menu component tests
│   └── setup.ts           # Test environment config
├── App.tsx            # Main orchestrator (494 lines)
├── types.ts           # TypeScript interfaces
├── main.tsx           # React entry point
└── index.css          # Tailwind CSS imports
```

## Key Design Decisions

**1. Pure Functional Data Layer**

- All CRUD operations (`folderActions.ts`, `fileActions.ts`) are pure functions
- Returns new state instead of mutations → trivial to test, no side effects
- Makes backend migration straightforward (swap localStorage for API calls)

**2. Auto-Resolution Over Errors**

- Duplicate names auto-increment: `file.pdf` → `file (1).pdf` → `file (2).pdf`
- Google Drive UX pattern: users never see "name already exists" errors
- Smart number extraction: renaming `Report (5).pdf` to `Report.pdf` becomes `Report (6).pdf` if conflict

**3. Scoped Search by Design**

- Only searches current folder (not recursive)
- Prevents overwhelming results in deep hierarchies (e.g., 100+ nested folders)
- Trade-off: sacrifices global search for better UX in typical use cases

**4. localStorage as Persistence Layer**

- Base64 encoding for PDF storage (simplifies MVP, no backend needed)
- 5MB file limit (browser quota constraint)
- Easy migration path: swap `saveState()`/`loadState()` with API calls

**5. Component Architecture**

- Inline editing (`ItemRow`) instead of modal dialogs → faster interaction
- Context menus show on hover → reduces visual clutter
- Toast notifications → non-blocking feedback, preserves user context

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9 (strict), Tailwind CSS 4
- **Build:** Vite 7, ESLint, Vitest
- **PDF:** pdfjs-dist 4.1 with worker support
- **Storage:** localStorage with base64 encoding
