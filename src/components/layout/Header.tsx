import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Wifi,
  WifiOff,
  Server,
  RefreshCw,
  Clock,
  User,
  ChevronDown,
  ShoppingCart,
  UtensilsCrossed,
  ChefHat,
  Settings,
} from 'lucide-react'
import { useSessionStore } from '@/stores/useSessionStore'
import type { ConnectionStatus } from '@/types/pos.types'
import './Header.css'

const statusClass: Record<ConnectionStatus, string> = {
  online: 'status-badge status-badge--online',
  'edge-only': 'status-badge status-badge--edge-only',
  offline: 'status-badge status-badge--offline',
  syncing: 'status-badge status-badge--syncing',
}

export function Header() {
  const { session, connectionStatus, pendingSyncCount, currentTime, tickClock } = useSessionStore()

  useEffect(() => {
    const timer = setInterval(tickClock, 1000)
    return () => clearInterval(timer)
  }, [tickClock])

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  function renderStatusBadge() {
    if (connectionStatus === 'syncing') {
      return (
        <div className={statusClass.syncing} title="Syncing pending orders with backend">
          <RefreshCw size={13} className="status-badge__spin" />
          <span>Syncing{pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}</span>
        </div>
      )
    }

    if (connectionStatus === 'online') {
      return (
        <div className={statusClass.online} title="Connected to POS backend API">
          <Wifi size={13} />
          <span>Online</span>
        </div>
      )
    }

    if (connectionStatus === 'edge-only') {
      return (
        <div className={statusClass['edge-only']} title="Connected to local edge server only">
          <Server size={13} />
          <span>Edge Only</span>
        </div>
      )
    }

    return (
      <div className={statusClass.offline} title="Operating offline — transactions stored locally">
        <WifiOff size={13} />
        <span>{pendingSyncCount > 0 ? `Offline (${pendingSyncCount})` : 'Offline'}</span>
      </div>
    )
  }

  return (
    <header className="header">
      {/* Left: Brand & Status */}
      <div className="header__brand">
        <div className="header__logo">POS</div>
        <div className="header__brand-info">
          <span className="header__brand-name">CloudPOS</span>
          <span className="header__terminal-id">{session?.terminalId ?? '—'}</span>
        </div>
        {renderStatusBadge()}
      </div>

      {/* Center: Nav links & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <nav className="header__nav">
          <NavLink to="/" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`} end>
            <ShoppingCart size={14} />
            <span>Register</span>
          </NavLink>
          <NavLink to="/tables" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
            <UtensilsCrossed size={14} />
            <span>Tables</span>
          </NavLink>
          <NavLink to="/kds" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
            <ChefHat size={14} />
            <span>KDS</span>
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `header__nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={14} />
            <span>Admin</span>
          </NavLink>
        </nav>

        <div className="header__clock">
          <Clock size={14} className="header__clock-icon" />
          <div>
            <div className="header__clock-time">{formattedTime}</div>
            <div className="header__clock-date">{formattedDate}</div>
          </div>
        </div>
      </div>

      {/* Right: Cashier */}
      <div className="header__cashier">
        <div className="header__cashier-info">
          <span className="header__cashier-name">{session?.cashierName ?? 'Guest'}</span>
          <span className="header__cashier-shift">
            Shift opened{' '}
            {session?.openedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button className="header__cashier-btn no-select">
          <div className="header__avatar">
            <User size={14} />
          </div>
          <ChevronDown size={12} className="header__chevron" />
        </button>
      </div>
    </header>
  )
}
