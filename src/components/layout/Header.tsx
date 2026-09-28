import { useEffect } from 'react'
import { Wifi, WifiOff, Server, Clock, User, ChevronDown } from 'lucide-react'
import { useSessionStore } from '@/stores/useSessionStore'
import type { ConnectionStatus } from '@/types/pos.types'
import './Header.css'

const statusClass: Record<ConnectionStatus, string> = {
  online: 'status-badge status-badge--online',
  'edge-only': 'status-badge status-badge--edge-only',
  offline: 'status-badge status-badge--offline',
}

const statusIcon: Record<ConnectionStatus, React.ReactNode> = {
  online: <Wifi size={13} />,
  'edge-only': <Server size={13} />,
  offline: <WifiOff size={13} />,
}

const statusLabel: Record<ConnectionStatus, string> = {
  online: 'Online',
  'edge-only': 'Edge Only',
  offline: 'Offline',
}

export function Header() {
  const { session, connectionStatus, currentTime, tickClock } = useSessionStore()

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

  return (
    <header className="header">
      {/* Left: Brand & Status */}
      <div className="header__brand">
        <div className="header__logo">POS</div>
        <div className="header__brand-info">
          <span className="header__brand-name">CloudPOS</span>
          <span className="header__terminal-id">{session?.terminalId ?? '—'}</span>
        </div>
        <div className={statusClass[connectionStatus]}>
          {statusIcon[connectionStatus]}
          <span>{statusLabel[connectionStatus]}</span>
        </div>
      </div>

      {/* Center: Clock */}
      <div className="header__clock">
        <Clock size={14} className="header__clock-icon" />
        <div>
          <div className="header__clock-time">{formattedTime}</div>
          <div className="header__clock-date">{formattedDate}</div>
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
