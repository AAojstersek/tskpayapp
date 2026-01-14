# Application Shell

## Overview

Sidebar navigation layout za interno finančno aplikacijo tskPay. Sidebar vsebuje glavno navigacijo na vrhu in uporabniški meni na dnu. Na mobilnih napravah se sidebar skrije v hamburger menu.

## Navigation Structure

- **Člani in skupine** → `/clani-in-skupine`
- **Stroški in obračunavanje** → `/stroski-in-obracunavanje`
- **Plačila in bančni uvoz** → `/placila-in-bancni-uvoz`
- **Pregled in poročila** → `/pregled-in-porocila` (privzeti pogled)
- **Nastavitve** → `/nastavitve`

## Components Provided

- `AppShell` — Main layout wrapper with sidebar and content area
- `MainNav` — Navigation component for sidebar
- `UserMenu` — User menu with avatar and logout option

## Props

### AppShell

- `children` — React.ReactNode (main content)
- `navigationItems` — Array of navigation items with label, href, and isActive
- `user` — Optional user object with name and avatarUrl
- `onNavigate` — Optional callback for navigation (if not provided, uses window.location)
- `onLogout` — Optional callback for logout action

### MainNav

- `items` — Array of navigation items
- `onNavigate` — Optional callback for navigation

### UserMenu

- `user` — Optional user object with name and avatarUrl
- `onLogout` — Optional callback for logout action

## Integration Notes

- Wire `onNavigate` to your routing system (React Router, Next.js router, etc.)
- Wire `onLogout` to your authentication system
- Provide user data from your auth context/store
- Set `isActive` on navigation items based on current route

