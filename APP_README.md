# tskPay Application

Financial management application for a ski-running club.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/
│   └── shell/          # Application shell components (AppShell, MainNav, UserMenu)
├── pages/              # Route pages (placeholder pages for now)
├── types/              # TypeScript data model types
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles with design tokens
```

## Routes

- `/` or `/pregled-in-porocila` - Dashboard (default)
- `/clani-in-skupine` - Member management
- `/stroski-in-obracunavanje` - Cost management
- `/placila-in-bancni-uvoz` - Payment and bank import
- `/nastavitve` - Settings

## Milestone 1: Foundation ✅

✅ Design tokens configured (Tailwind CSS)
✅ Google Fonts set up (Inter, JetBrains Mono)
✅ Data model types created
✅ Routing structure set up (React Router)
✅ Application shell wired up
✅ Navigation working
✅ Placeholder pages created
✅ Responsive design (mobile-friendly)

## Next Steps

- **Milestone 2:** Implement Člani in skupine feature
- **Milestone 3:** Implement Stroški in obračunavanje feature
- **Milestone 4:** Implement Plačila in bančni uvoz feature
- **Milestone 5:** Implement Pregled in poročila feature

See `instructions/one-shot-instructions.md` for detailed implementation guide.
