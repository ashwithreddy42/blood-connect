import { useState, useEffect, useCallback } from 'react'
import { getDonors, getCompatibleDonors } from '../api/bloodConnectApi'

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const BLOOD_GROUPS_SINGLE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function DonorDirectory({ onNavigateToRegister }) {
  const [activeTab, setActiveTab] = useState('directory') // 'directory' | 'compatible'

  // Standard Directory State
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState('ALL')
  const [cityFilter, setCityFilter] = useState('')

  // Compatible Search State
  const [patientBloodGroup, setPatientBloodGroup] = useState('A+')
  const [compatibleCity, setCompatibleCity] = useState('')
  const [compatibleResult, setCompatibleResult] = useState(null)
  const [compatibleLoading, setCompatibleLoading] = useState(false)
  const [compatibleError, setCompatibleError] = useState(null)

  const fetchDirectory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDonors({
        bloodGroup: selectedGroup,
        city: cityFilter,
      })
      setDonors(data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load donors from server')
    } finally {
      setLoading(false)
    }
  }, [selectedGroup, cityFilter])

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectory()
    }
  }, [fetchDirectory, activeTab])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchDirectory()
  }

  const handleClearFilter = () => {
    setSelectedGroup('ALL')
    setCityFilter('')
  }

  const handleCompatibleSearch = async (e) => {
    e.preventDefault()
    setCompatibleLoading(true)
    setCompatibleError(null)
    try {
      const data = await getCompatibleDonors(patientBloodGroup, compatibleCity)
      setCompatibleResult(data)
    } catch (err) {
      setCompatibleError(err.response?.data?.message || err.message || 'Failed to search compatible donors')
      setCompatibleResult(null)
    } finally {
      setCompatibleLoading(false)
    }
  }

  return (
    <div className="directory-container">
      <div className="section-header-row">
        <div>
          <h2>Donor Network</h2>
          <p className="section-subtext">
            Search voluntary donors in your city or find medically compatible donor matches.
          </p>
        </div>
        <div className="sub-nav-pill">
          <button
            type="button"
            className={`pill-btn ${activeTab === 'directory' ? 'pill-btn-active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            All Donors Directory
          </button>
          <button
            type="button"
            className={`pill-btn ${activeTab === 'compatible' ? 'pill-btn-active' : ''}`}
            onClick={() => setActiveTab('compatible')}
          >
            Compatible Matcher
          </button>
        </div>
      </div>

      {activeTab === 'directory' ? (
        <>
          <form className="filter-card" onSubmit={handleFilterSubmit}>
            <div className="filter-grid">
              <div className="filter-field">
                <label htmlFor="filter-group">Blood Group</label>
                <select
                  id="filter-group"
                  className="select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g === 'ALL' ? 'All Blood Groups' : g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="filter-city">City</label>
                <input
                  id="filter-city"
                  type="text"
                  className="input"
                  placeholder="e.g. Hyderabad, Delhi"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>

              <div className="filter-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Searching...' : 'Filter Donors'}
                </button>
                {(selectedGroup !== 'ALL' || cityFilter !== '') && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleClearFilter}
                    disabled={loading}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </form>

          {error && (
            <div className="alert alert-error">
              <div className="alert-title">Could not load donors</div>
              <p>{error}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={fetchDirectory}>
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Fetching donors from Blood Connect backend...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">🩸</div>
              <h3>No Donors Found</h3>
              <p>
                {selectedGroup !== 'ALL' || cityFilter !== ''
                  ? 'No donors matched your filter criteria. Try searching without specific filters.'
                  : 'There are currently no registered donors in the system.'}
              </p>
              {onNavigateToRegister && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onNavigateToRegister}
                >
                  Register as the First Donor
                </button>
              )}
            </div>
          ) : (
            <div className="donor-grid">
              {donors.map((donor) => (
                <div key={donor.id} className="donor-card card">
                  <div className="donor-card-top">
                    <span className="blood-badge">{donor.bloodGroup}</span>
                    <span
                      className={`availability-badge ${
                        donor.available ? 'badge-avail-yes' : 'badge-avail-no'
                      }`}
                    >
                      {donor.available ? '● Available' : '○ Unavailable'}
                    </span>
                  </div>

                  <h3 className="donor-name">{donor.name}</h3>

                  <div className="donor-meta-list">
                    <div className="meta-item">
                      <span className="meta-label">Location:</span>
                      <span className="meta-value">{donor.city}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Phone:</span>
                      <a href={`tel:${donor.phone}`} className="meta-link">
                        {donor.phone}
                      </a>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Email:</span>
                      <a href={`mailto:${donor.email}`} className="meta-link">
                        {donor.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="compatible-section">
          <form className="filter-card" onSubmit={handleCompatibleSearch}>
            <div className="compatible-explainer">
              <h3>Find Medically Compatible Donors</h3>
              <p>
                Select the recipient patient's blood group to find eligible blood types that can be safely transfused.
              </p>
            </div>

            <div className="filter-grid">
              <div className="filter-field">
                <label htmlFor="patient-group">Recipient Patient's Blood Group *</label>
                <select
                  id="patient-group"
                  className="select"
                  value={patientBloodGroup}
                  onChange={(e) => setPatientBloodGroup(e.target.value)}
                >
                  {BLOOD_GROUPS_SINGLE.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="compat-city">City / Region (Optional)</label>
                <input
                  id="compat-city"
                  type="text"
                  className="input"
                  placeholder="e.g. Hyderabad"
                  value={compatibleCity}
                  onChange={(e) => setCompatibleCity(e.target.value)}
                />
              </div>

              <div className="filter-actions">
                <button type="submit" className="btn btn-primary" disabled={compatibleLoading}>
                  {compatibleLoading ? 'Searching...' : 'Find Matches'}
                </button>
              </div>
            </div>
          </form>

          {compatibleError && (
            <div className="alert alert-error">
              <div className="alert-title">Search Error</div>
              <p>{compatibleError}</p>
            </div>
          )}

          {compatibleLoading && (
            <div className="loading-state">
              <span className="spinner"></span>
              <p>Calculating compatible blood groups and searching available donors...</p>
            </div>
          )}

          {compatibleResult && !compatibleLoading && (
            <div className="compatible-results-box">
              <div className="compatibility-summary-banner">
                <div>
                  <div className="summary-title">
                    Recipient Group: <span className="highlight-tag">{compatibleResult.requestedBloodGroup}</span>
                  </div>
                  <div className="summary-sub">
                    Eligible Donor Blood Types:{' '}
                    <strong>{compatibleResult.compatibleGroups?.join(', ')}</strong>
                  </div>
                </div>
                <div className="summary-count">
                  <span className="count-number">{compatibleResult.totalFound}</span>
                  <span className="count-label">Available Donors</span>
                </div>
              </div>

              {compatibleResult.donors?.length === 0 ? (
                <div className="empty-state card">
                  <div className="empty-icon">🔍</div>
                  <h3>No Available Donors Matched</h3>
                  <p>
                    No available donors registered with compatible blood types ({compatibleResult.compatibleGroups?.join(', ')})
                    {compatibleCity ? ` in ${compatibleCity}` : ''}.
                  </p>
                </div>
              ) : (
                <div className="donor-grid">
                  {compatibleResult.donors?.map((donor) => (
                    <div key={donor.id} className="donor-card card">
                      <div className="donor-card-top">
                        <span className="blood-badge">{donor.bloodGroup}</span>
                        <span className="badge-tag-compat">Compatible Match</span>
                      </div>
                      <h3 className="donor-name">{donor.name}</h3>
                      <div className="donor-meta-list">
                        <div className="meta-item">
                          <span className="meta-label">Location:</span>
                          <span className="meta-value">{donor.city}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Phone:</span>
                          <a href={`tel:${donor.phone}`} className="meta-link">
                            {donor.phone}
                          </a>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Email:</span>
                          <a href={`mailto:${donor.email}`} className="meta-link">
                            {donor.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
