import { useState, useEffect, useCallback } from 'react'
import { getBloodRequests } from '../api/bloodConnectApi'
import DonorResponseModal from './DonorResponseModal'

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function BloodRequestsList({ onNavigateToCreateRequest }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [groupFilter, setGroupFilter] = useState('ALL')
  const [activeResponseRequest, setActiveResponseRequest] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBloodRequests({ bloodGroup: groupFilter })
      setRequests(data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load blood requests')
    } finally {
      setLoading(false)
    }
  }, [groupFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent'
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  const handleResponseCompleted = (updatedData) => {
    setActiveResponseRequest(null)
    setActionNotice(
      updatedData?.action === 'REJECTED'
        ? 'Decline recorded. The request remains OPEN for other compatible donors.'
        : 'Donor accepted successfully! The request status is now updated to ACCEPTED.'
    )
    fetchRequests()
    setTimeout(() => {
      setActionNotice(null)
    }, 5000)
  }

  return (
    <div className="requests-container">
      <div className="section-header-row">
        <div>
          <h2>Active Blood Requests</h2>
          <p className="section-subtext">
            Urgent requests from hospitals and patients. Donors can review and respond directly.
          </p>
        </div>
        {onNavigateToCreateRequest && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNavigateToCreateRequest}
          >
            + New Blood Request
          </button>
        )}
      </div>

      {actionNotice && (
        <div className="alert alert-success">
          <div className="alert-title">Status Updated</div>
          <p>{actionNotice}</p>
        </div>
      )}

      <div className="filter-card">
        <div className="filter-grid">
          <div className="filter-field">
            <label htmlFor="req-filter-group">Filter by Blood Group</label>
            <select
              id="req-filter-group"
              className="select"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g === 'ALL' ? 'All Blood Groups' : g}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={fetchRequests}
              disabled={loading}
            >
              Refresh Feed
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-title">Could not load requests</div>
          <p>{error}</p>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchRequests}>
            Try Again
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <span className="spinner"></span>
          <p>Loading active blood requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📋</div>
          <h3>No Blood Requests Found</h3>
          <p>
            {groupFilter !== 'ALL'
              ? `There are currently no active requests for blood group ${groupFilter}.`
              : 'There are no active blood requests listed at this moment.'}
          </p>
          {onNavigateToCreateRequest && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onNavigateToCreateRequest}
            >
              Create a Request Now
            </button>
          )}
        </div>
      ) : (
        <div className="request-grid">
          {requests.map((item) => {
            const isAccepted = item.status === 'ACCEPTED'
            const isClosed = item.status === 'CLOSED'
            const isOpen = item.status === 'OPEN' || (!isAccepted && !isClosed)

            return (
              <div
                key={item.id}
                className={`request-card card ${isAccepted ? 'request-card-accepted' : ''}`}
              >
                <div className="request-card-top">
                  <div className="group-callout">
                    <span className="group-label">Needed:</span>
                    <span className="blood-badge blood-badge-large">
                      {item.requiredBloodGroup}
                    </span>
                  </div>
                  <span
                    className={`status-badge ${
                      isAccepted
                        ? 'status-accepted'
                        : isClosed
                        ? 'status-closed'
                        : 'status-open'
                    }`}
                  >
                    ● {item.status || 'OPEN'}
                  </span>
                </div>

                <div className="hospital-info">
                  <h3 className="hospital-name">{item.hospitalName}</h3>
                  <p className="hospital-location">📍 {item.hospitalLocation}</p>
                </div>

                <div className="request-meta-box">
                  <div className="meta-item">
                    <span className="meta-label">Requester:</span>
                    <span className="meta-value">{item.requesterName}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Contact:</span>
                    <a href={`tel:${item.contactNumber}`} className="meta-link phone-callout">
                      📞 {item.contactNumber}
                    </a>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Posted:</span>
                    <span className="meta-value">{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Display Accepted Donor Information if already accepted */}
                {isAccepted && item.acceptedDonor && (
                  <div className="accepted-donor-box">
                    <div className="accepted-header">
                      <span className="accepted-icon">✓</span>
                      <strong>Donor Confirmed</strong>
                    </div>
                    <div className="accepted-name">
                      {item.acceptedDonor.name} ({item.acceptedDonor.bloodGroup})
                    </div>
                    <div className="accepted-details">
                      <span>📍 {item.acceptedDonor.city}</span>
                      <span>
                        📞{' '}
                        <a href={`tel:${item.acceptedDonor.phone}`} className="accepted-phone">
                          {item.acceptedDonor.phone}
                        </a>
                      </span>
                    </div>
                    {item.respondedAt && (
                      <span className="accepted-time">
                        Responded: {formatDate(item.respondedAt)}
                      </span>
                    )}
                  </div>
                )}

                {/* Action button when request is OPEN */}
                {isOpen && (
                  <div className="request-actions-row">
                    <button
                      type="button"
                      className="btn btn-respond"
                      onClick={() => setActiveResponseRequest(item)}
                    >
                      Respond as Donor
                    </button>
                  </div>
                )}

                <div className="request-footer-notice">
                  <span>
                    {isAccepted
                      ? 'Donor response confirmed in database. Further coordination is underway.'
                      : 'Community listing • Voluntary donors can accept or decline.'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Donor Response Modal */}
      {activeResponseRequest && (
        <DonorResponseModal
          request={activeResponseRequest}
          onClose={() => setActiveResponseRequest(null)}
          onResponseCompleted={handleResponseCompleted}
        />
      )}
    </div>
  )
}
