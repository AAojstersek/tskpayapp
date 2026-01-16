import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from './components/shell'
import { ClaniInSkupinePage } from './pages/ClaniInSkupinePage'
import { StroskiInObračunavanjePage } from './pages/StroskiInObračunavanjePage'
import { PlacilaInBancniUvozPage } from './pages/PlacilaInBancniUvozPage'
import { PregledInPorocilaPage } from './pages/PregledInPorocilaPage'
import { NastavitvePage } from './pages/NastavitvePage'
import { appStore } from './data/appStore'
import { generateRecurringCosts } from './data/recurringCosts'

const navigationItems = [
  { label: 'Pregled in poročila', href: '/pregled-in-porocila' },
  { label: 'Člani in skupine', href: '/clani-in-skupine' },
  { label: 'Stroški in obračunavanje', href: '/stroski-in-obracunavanje' },
  { label: 'Plačila in bančni uvoz', href: '/placila-in-bancni-uvoz' },
  { label: 'Nastavitve', href: '/nastavitve' },
]

// Mock user data - replace with real auth later
const mockUser = {
  name: 'Bančnik',
  avatarUrl: undefined,
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Initialize database store on app mount
  useEffect(() => {
    appStore.initialize()
      .then(async () => {
        // Generate recurring costs after store is initialized
        try {
          const generated = await generateRecurringCosts()
          if (generated > 0) {
            console.log(`Generated ${generated} recurring costs`)
          }
        } catch (error) {
          console.error('Failed to generate recurring costs:', error)
        }
      })
      .catch((error) => {
        console.error('Failed to initialize app store:', error)
      })
  }, [])

  // Mark active navigation item
  const navigationItemsWithActive = navigationItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked')
  }

  return (
    <AppShell
      navigationItems={navigationItemsWithActive}
      user={mockUser}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path="/" element={<PregledInPorocilaPage />} />
        <Route path="/pregled-in-porocila" element={<PregledInPorocilaPage />} />
        <Route path="/clani-in-skupine" element={<ClaniInSkupinePage />} />
        <Route path="/stroski-in-obracunavanje" element={<StroskiInObračunavanjePage />} />
        <Route path="/placila-in-bancni-uvoz" element={<PlacilaInBancniUvozPage />} />
        <Route path="/nastavitve" element={<NastavitvePage />} />
      </Routes>
    </AppShell>
  )
}

export default App
