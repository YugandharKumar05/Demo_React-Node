import { useEffect, useState } from 'react'
import UserManagement from './UserManagement'
import AccountMenu from './AccountMenu'
import Dashboard from './Dashboard'
import ResourceManagement from './ResourceManagement'
import { PRODUCT_FIELDS, ASSET_FIELDS, DEVICE_FIELDS } from './resourceConfigs'
import './App.css'

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'users', label: 'User Management', icon: '👤' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'assets', label: 'Asset Management', icon: '🗄️' },
  { id: 'devices', label: 'Registered Devices', icon: '📱' },
]

function App({ account, onLogout }) {
  const [activeModule, setActiveModule] = useState('dashboard')
  const activeLabel = activeModule === 'profile'
    ? 'Profile'
    : MODULES.find((mod) => mod.id === activeModule)?.label

  useEffect(() => {
    document.title = activeLabel ? `${activeLabel} · Demo App` : 'Demo App'
  }, [activeLabel])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Demo App</h1>
        <div className="page-header-account">
          <AccountMenu
            account={account}
            onLogout={onLogout}
            onProfile={() => setActiveModule('profile')}
          />
        </div>
      </div>

      <div className="module-row">
        {MODULES.map((mod) => (
          <button
            key={mod.id}
            type="button"
            className={`module-card ${activeModule === mod.id ? 'active' : ''}`}
            onClick={() => setActiveModule(mod.id)}
          >
            <span className="module-card-icon">{mod.icon}</span>
            <span className="module-card-label">{mod.label}</span>
          </button>
        ))}
      </div>

      {activeModule === 'dashboard' && <Dashboard account={account} onLogout={onLogout} />}

      {activeModule === 'users' && <UserManagement onLogout={onLogout} />}

      {activeModule === 'products' && (
        <ResourceManagement title="Products" endpoint="/api/products" fields={PRODUCT_FIELDS} onLogout={onLogout} />
      )}

      {activeModule === 'assets' && (
        <ResourceManagement title="Assets" endpoint="/api/assets" fields={ASSET_FIELDS} onLogout={onLogout} />
      )}

      {activeModule === 'devices' && (
        <ResourceManagement title="Devices" endpoint="/api/devices" fields={DEVICE_FIELDS} onLogout={onLogout} />
      )}

      {activeModule === 'profile' && (
        <section className="card module-placeholder profile-card">
          <h2>Profile</h2>
          <p>
            <strong>Name:</strong> {account?.name}
          </p>
          <p>
            <strong>Email:</strong> {account?.email}
          </p>
        </section>
      )}
    </div>
  )
}

export default App
