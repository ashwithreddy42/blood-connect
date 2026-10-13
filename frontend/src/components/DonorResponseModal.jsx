import { useState, useEffect } from 'react'
import { getDonors, acceptBloodRequest, rejectBloodRequest } from '../api/bloodConnectApi'

const COMPATIBILITY_MAP = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
}

const isCompatible = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return false
  const normRecipient = recipientGroup.trim().toUpperCase()
  const normDonor = donorGroup.trim().toUpperCase()
  const eligible = COMPATIBILITY_MAP[normRecipient] || [normRecipient]
  return eligible.includes(normDonor)
}

export default function DonorResponseModal({ request, onClose, onResponseCompleted }) {
  const [donors, setDonors] = useState([])
  const [donorsLoading, setDonorsLoading] = useState(true)
  const [selectedDonorId, setSelectedDonorId] = useState('')
  const [notes, setNotes] = useState('')
  const [submittingAction, setSubmittingAction] = useState(null) // 'accept' | 'reject' | null
  const [errorMessage, setErrorMessage] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    let isMounted = true
    const loadDonors = async () => {
      try {
        const data = await getDonors()
        if (isMounted) {
          setDonors(data || [])
          if (data && data.length > 0) {
            setSelectedDonorId(String(data[0].id))
          }
        }
      } catch (err) {
        if (isMounted) {
          const detail =
            err.response?.data?.message ||
            (typeof err.response?.data?.error === 'string' ? err.response.data.error : null) ||
            err.message ||
            'Server error'
          setErrorMessage('Could not load donor profiles: ' + detail)
        }
      } finally {
        if (isMounted) setDonorsLoading(false)
      }
    }
    loadDonors()
    return () => {
      isMounted = false
    }
  }, [])

  const selectedDonor = donors.find((d) => String(d.id) === String(selectedDonorId))
  const compatible = selectedDonor ? isCompatible(selectedDonor.bloodGroup, request.requiredBloodGroup) : false
  const isAvailable = selectedDonor ? selectedDonor.available : false

  const handleAccept = async () => {
    if (!selectedDonorId) {
      setErrorMessage('Please select a donor profile')
      return
    }
    if (!compatible) {
      setErrorMessage(
        `Selected donor (${selectedDonor?.bloodGroup}) is not medically compatible with required blood group (${request.requiredBloodGroup}). Incompatible donors cannot accept.`
      )
      return
    }
    if (!isAvailable) {
      setErrorMessage('Selected donor is currently marked as unavailable for donations.')
      return
    }

    setSubmittingAction('accept')
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const updated = await acceptBloodRequest(request.id, {
        donorId: Number(selectedDonorId),
        notes: notes.trim(),
      })
      setSuccessMessage(
        `Success! Request #${request.id} has been accepted by ${selectedDonor.name} (${selectedDonor.bloodGroup}). Status updated to ACCEPTED in Aiven MySQL.`
      )
      setTimeout(() => {
        onResponseCompleted(updated)
      }, 1200)
    } catch (err) {
      const serverMessage = err.response?.data?.message
      const serverError = typeof err.response?.data?.error === 'string' ? err.response.data.error : null
      const clientMessage = err.message || 'Failed to accept blood request.'

      if (err.response?.status === 409) {
        setErrorMessage(
          serverMessage || serverError || 'Conflict: This blood request has already been accepted or is closed.'
        )
      } else {
        setErrorMessage(serverMessage || serverError || clientMessage)
      }
    } finally {
      setSubmittingAction(null)
    }
  }

  const handleReject = async () => {
    if (!selectedDonorId) {
      setErrorMessage('Please select a donor profile')
      return
    }

    setSubmittingAction('reject')
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await rejectBloodRequest(request.id, {
        donorId: Number(selectedDonorId),
        reason: notes.trim() || 'Unavailable at this time',
      })
      setSuccessMessage(
        `Decline recorded for ${selectedDonor.name}. The request remains OPEN for other compatible donors.`
      )
      setTimeout(() => {
        onResponseCompleted(result)
      }, 1200)
    } catch (err) {
      const serverMessage = err.response?.data?.message
      const serverError = typeof err.response?.data?.error === 'string' ? err.response.data.error : null
      const clientMessage = err.message || 'Failed to decline blood request.'
      setErrorMessage(serverMessage || serverError || clientMessage)
    } finally {
      setSubmittingAction(null)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="badge-pill badge-pill-danger">Donor Response</div>
            <h3>Respond to Blood Request #{request.id}</h3>
            <p className="card-subtext">
              Needed: <strong className="highlight-tag">{request.requiredBloodGroup}</strong> at{' '}
              <strong>{request.hospitalName}</strong> ({request.hospitalLocation})
            </p>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="demo-notice-banner">
          <span className="demo-icon">⚠️</span>
          <div>
            <strong>Demonstration Access Notice:</strong>
            <p>
              Full user authentication is not yet enabled in this milestone. Select any registered donor profile below to simulate a donor accepting or rejecting this request in the Aiven MySQL database.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <div className="alert-title">Action Blocked</div>
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            <div className="alert-title">Response Processed</div>
            <p>{successMessage}</p>
          </div>
        )}

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="donor-select">Select Responding Donor Profile *</label>
            {donorsLoading ? (
              <div className="loading-inline">
                <span className="spinner"></span> Loading registered donors...
              </div>
            ) : donors.length === 0 ? (
              <div className="empty-inline-warn">
                No registered donors found. Please register a donor profile first.
              </div>
            ) : (
              <select
                id="donor-select"
                className="select"
                value={selectedDonorId}
                onChange={(e) => {
                  setSelectedDonorId(e.target.value)
                  setErrorMessage(null)
                }}
                disabled={submittingAction !== null}
              >
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — Blood Type: {d.bloodGroup} | City: {d.city} {d.available ? '(Available)' : '(Unavailable)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedDonor && (
            <div className="donor-compatibility-status">
              <div className="status-item">
                <span className="status-label">Donor Blood Group:</span>
                <span className="blood-badge">{selectedDonor.bloodGroup}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Recipient Needs:</span>
                <span className="blood-badge">{request.requiredBloodGroup}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Compatibility Match:</span>
                {compatible ? (
                  <span className="badge-match-yes">✓ Medically Compatible</span>
                ) : (
                  <span className="badge-match-no">✕ Incompatible Blood Type</span>
                )}
              </div>
              <div className="status-item">
                <span className="status-label">Availability:</span>
                {isAvailable ? (
                  <span className="badge-avail-yes">● Available</span>
                ) : (
                  <span className="badge-avail-no">○ Marked Unavailable</span>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="response-notes">Donor Note / Response Details (Optional)</label>
            <input
              id="response-notes"
              type="text"
              className="input"
              placeholder="e.g. Can reach the blood bank within 45 minutes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submittingAction !== null}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={submittingAction !== null}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-reject"
            onClick={handleReject}
            disabled={submittingAction !== null || donors.length === 0}
          >
            {submittingAction === 'reject' ? 'Recording Decline...' : 'Decline Request'}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAccept}
            disabled={
              submittingAction !== null ||
              donors.length === 0 ||
              !compatible ||
              !isAvailable
            }
          >
            {submittingAction === 'accept' ? 'Confirming Acceptance...' : 'Accept Blood Request'}
          </button>
        </div>
      </div>
    </div>
  )
}
