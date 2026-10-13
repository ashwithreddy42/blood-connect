import { useState } from 'react'
import Navbar from './components/Navbar'
import DonorDirectory from './components/DonorDirectory'
import DonorRegistrationForm from './components/DonorRegistrationForm'
import BloodRequestsList from './components/BloodRequestsList'
import CreateBloodRequestForm from './components/CreateBloodRequestForm'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'requests' | 'register' | 'create-request'

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'directory' && (
          <DonorDirectory
            onNavigateToRegister={() => setActiveTab('register')}
          />
        )}

        {activeTab === 'requests' && (
          <BloodRequestsList
            onNavigateToCreateRequest={() => setActiveTab('create-request')}
          />
        )}

        {activeTab === 'register' && (
          <DonorRegistrationForm
            onViewDirectory={() => setActiveTab('directory')}
            onDonorAdded={() => {
              // Registration callback
            }}
          />
        )}

        {activeTab === 'create-request' && (
          <CreateBloodRequestForm
            onViewRequests={() => setActiveTab('requests')}
            onRequestCreated={() => {
              // Request callback
            }}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>Blood Connect</strong> — Voluntary Blood Donation Network
          </div>
          <div className="footer-links">
            <span>Powered by Spring Boot 3 &amp; Aiven MySQL</span>
            <span>•</span>
            <span>Local Dev Environment (Port 9090)</span>
          </div>
          <p className="footer-disclaimer">
            Blood Connect facilitates direct peer communication between voluntary blood donors and recipients. Always verify blood compatibility with qualified medical professionals at certified medical institutions.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
