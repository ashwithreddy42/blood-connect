import { useState } from 'react'
import { createBloodRequest } from '../api/bloodConnectApi'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function CreateBloodRequestForm({ onRequestCreated, onViewRequests }) {
  const [formData, setFormData] = useState({
    requesterName: '',
    requiredBloodGroup: 'A+',
    hospitalName: '',
    hospitalLocation: '',
    contactNumber: '',
  })

  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [clientErrors, setClientErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (errorMessage) setErrorMessage(null)
  }

  const validate = () => {
    const errors = {}
    if (!formData.requesterName.trim()) errors.requesterName = 'Requester name is required'
    if (!formData.requiredBloodGroup) errors.requiredBloodGroup = 'Required blood group is required'
    if (!formData.hospitalName.trim()) errors.hospitalName = 'Hospital name is required'
    if (!formData.hospitalLocation.trim()) errors.hospitalLocation = 'Hospital location/city is required'
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Emergency contact number is required'

    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setErrorMessage(null)
    setSuccessData(null)

    try {
      const response = await createBloodRequest({
        requesterName: formData.requesterName.trim(),
        requiredBloodGroup: formData.requiredBloodGroup,
        hospitalName: formData.hospitalName.trim(),
        hospitalLocation: formData.hospitalLocation.trim(),
        contactNumber: formData.contactNumber.trim(),
      })

      setSuccessData(response)
      setFormData({
        requesterName: '',
        requiredBloodGroup: 'A+',
        hospitalName: '',
        hospitalLocation: '',
        contactNumber: '',
      })
      if (onRequestCreated) onRequestCreated(response)
    } catch (err) {
      if (err.response?.data?.details) {
        const details = err.response.data.details
        const messages = Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')
        setErrorMessage(`Validation error: ${messages}`)
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage(err.message || 'Failed to submit blood request. Verify backend is running on port 9090.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="badge-pill badge-pill-danger">Urgent Need</div>
        <h2>Create a Blood Request</h2>
        <p className="card-subtext">
          Submit an urgent request for blood. It will appear on the active requests feed for voluntary donors to see.
        </p>
      </div>

      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <p>
          <strong>Notice:</strong> This request is listed directly in the community feed so donors can reach out to you directly. Automatic donor notification and hospital medical verification are not yet implemented.
        </p>
      </div>

      {successData && (
        <div className="alert alert-success">
          <div className="alert-title">Blood Request Created!</div>
          <p>
            Request <strong>#{successData.id}</strong> for blood group <strong>{successData.requiredBloodGroup}</strong> at <strong>{successData.hospitalName}</strong> has been posted with status <strong>{successData.status}</strong>.
          </p>
          <div className="alert-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSuccessData(null)}
            >
              Post Another Request
            </button>
            {onViewRequests && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onViewRequests}
              >
                View Active Requests
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <div className="alert-title">Request Submission Failed</div>
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="req-name">Requester / Contact Person *</label>
            <input
              id="req-name"
              type="text"
              name="requesterName"
              className={`input ${clientErrors.requesterName ? 'input-error' : ''}`}
              placeholder="e.g. Dr. Ramesh or Patient Family"
              value={formData.requesterName}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.requesterName && <span className="field-error">{clientErrors.requesterName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="req-bloodGroup">Required Blood Group *</label>
            <select
              id="req-bloodGroup"
              name="requiredBloodGroup"
              className="select"
              value={formData.requiredBloodGroup}
              onChange={handleChange}
              disabled={loading}
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="req-hospital">Hospital Name *</label>
            <input
              id="req-hospital"
              type="text"
              name="hospitalName"
              className={`input ${clientErrors.hospitalName ? 'input-error' : ''}`}
              placeholder="e.g. Apollo Hospital, Care Hospital"
              value={formData.hospitalName}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.hospitalName && <span className="field-error">{clientErrors.hospitalName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="req-location">Hospital Location / City *</label>
            <input
              id="req-location"
              type="text"
              name="hospitalLocation"
              className={`input ${clientErrors.hospitalLocation ? 'input-error' : ''}`}
              placeholder="e.g. Jubilee Hills, Hyderabad"
              value={formData.hospitalLocation}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.hospitalLocation && <span className="field-error">{clientErrors.hospitalLocation}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="req-contact">Emergency Contact Phone *</label>
            <input
              id="req-contact"
              type="tel"
              name="contactNumber"
              className={`input ${clientErrors.contactNumber ? 'input-error' : ''}`}
              placeholder="e.g. +91 9123456780"
              value={formData.contactNumber}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.contactNumber && <span className="field-error">{clientErrors.contactNumber}</span>}
            <span className="field-hint">Donors will dial this number directly to confirm donation details.</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-content">
                <span className="spinner"></span> Posting Request...
              </span>
            ) : (
              'Publish Blood Request'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
