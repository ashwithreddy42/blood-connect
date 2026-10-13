import { useState, useEffect } from 'react'
import { checkHealth } from '../api/bloodConnectApi'

export default function Navbar({ activeTab, onSelectTab }) {
  const [backendOnline, setBackendOnline] = useState(null)

  useEffect(() => {
    let isMounted = true
    const verifyHealth = async () => {
      try {
        const res = await checkHealth()
        if (isMounted) setBackendOnline(res?.status === 'UP')
      } catch {
        if (isMounted) setBackendOnline(false)
      }
    }
    verifyHealth()
    const timer = setInterval(verifyHealth, 20000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand" onClick={() => onSelectTab('directory')} role="button" tabIndex={0}>
          <div className="brand-icon">🩸</div>
          <div>
            <h1 className="brand-title">Blood Connect</h1>
            <p className="brand-tagline">Connecting Donors & Saving Lives</p>
          </div>
        </div>

        <div className="header-status">
          {backendOnline === true && (
            <span className="system-pill online">
              <span className="dot">●</span> Backend Online (9090)
            </span>
          )}
          {backendOnline === false && (
            <span className="system-pill offline">
              <span className="dot">●</span> Backend Disconnected
            </span>
          )}
          {backendOnline === null && (
            <span className="system-pill connecting">
              <span className="dot">●</span> Connecting...
            </span>
          )}
        </div>
      </div>

      <nav className="site-nav">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'directory' ? 'nav-tab-active' : ''}`}
          onClick={() => onSelectTab('directory')}
        >
          🔍 Donors Directory
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === 'requests' ? 'nav-tab-active' : ''}`}
          onClick={() => onSelectTab('requests')}
        >
          📋 Blood Requests
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === 'register' ? 'nav-tab-active' : ''}`}
          onClick={() => onSelectTab('register')}
        >
          🙋 Register as Donor
        </button>

        <button
          type="button"
          className={`nav-tab nav-tab-urgent ${activeTab === 'create-request' ? 'nav-tab-active' : ''}`}
          onClick={() => onSelectTab('create-request')}
        >
          🆘 Request Blood
        </button>
      </nav>
    </header>
  )
}
