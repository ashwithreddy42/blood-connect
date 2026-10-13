import { useState } from 'react'
import { registerDonor } from '../api/bloodConnectApi'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function DonorRegistrationForm({ onDonorAdded, onViewDirectory }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: 'A+',
    city: '',
    available: true,
  })

  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [clientErrors, setClientErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: null }))
    }
    if (errorMessage) setErrorMessage(null)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Full name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.bloodGroup) errors.bloodGroup = 'Please select a blood group'

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
      const response = await registerDonor({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        bloodGroup: formData.bloodGroup,
        city: formData.city.trim(),
        available: formData.available,
      })

      setSuccessData(response)
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        bloodGroup: 'A+',
        city: '',
        available: true,
      })
      if (onDonorAdded) onDonorAdded(response)
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage(err.response.data?.message || 'This email address is already registered as a donor.')
      } else if (err.response?.data?.details) {
        const details = err.response.data.details
        const messages = Object.entries(details).map(([k, v]) => `${k}: ${v}`).join(', ')
        setErrorMessage(`Validation error: ${messages}`)
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage(err.message || 'Failed to connect to backend server. Make sure port 9090 is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="badge-pill">Be a Lifesaver</div>
        <h2>Register as a Blood Donor</h2>
        <p className="card-subtext">
          Join our network of voluntary blood donors. Your contact details will allow recipients in need to find you.
        </p>
      </div>

      {successData && (
        <div className="alert alert-success">
          <div className="alert-title">Registration Successful!</div>
          <p>
            Thank you, <strong>{successData.name}</strong>! You have been successfully registered as a donor with blood group <strong>{successData.bloodGroup}</strong> in <strong>{successData.city}</strong>.
          </p>
          <div className="alert-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSuccessData(null)}
            >
              Register Another Donor
            </button>
            {onViewDirectory && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onViewDirectory}
              >
                View Donor Directory
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <div className="alert-title">Registration Failed</div>
          <p>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="donor-name">Full Name *</label>
            <input
              id="donor-name"
              type="text"
              name="name"
              className={`input ${clientErrors.name ? 'input-error' : ''}`}
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.name && <span className="field-error">{clientErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-email">Email Address *</label>
            <input
              id="donor-email"
              type="email"
              name="email"
              className={`input ${clientErrors.email ? 'input-error' : ''}`}
              placeholder="e.g. sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.email && <span className="field-error">{clientErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-password">Account Password *</label>
            <input
              id="donor-password"
              type="password"
              name="password"
              className={`input ${clientErrors.password ? 'input-error' : ''}`}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.password && <span className="field-error">{clientErrors.password}</span>}
            <span className="field-hint">Your password is securely encrypted and never revealed.</span>
          </div>

          <div className="form-group">
            <label htmlFor="donor-phone">Contact Phone Number *</label>
            <input
              id="donor-phone"
              type="tel"
              name="phone"
              className={`input ${clientErrors.phone ? 'input-error' : ''}`}
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.phone && <span className="field-error">{clientErrors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donor-bloodGroup">Blood Group *</label>
            <select
              id="donor-bloodGroup"
              name="bloodGroup"
              className="select"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={loading}
            >
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="donor-city">City / Location *</label>
            <input
              id="donor-city"
              type="text"
              name="city"
              className={`input ${clientErrors.city ? 'input-error' : ''}`}
              placeholder="e.g. Hyderabad, Mumbai, Bangalore"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
            />
            {clientErrors.city && <span className="field-error">{clientErrors.city}</span>}
          </div>
        </div>

        <div className="checkbox-group">
          <input
            id="donor-available"
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="donor-available">
            <strong>Currently available to donate blood</strong>
            <span className="checkbox-subtext">You can change your availability at any time when required.</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-content">
                <span className="spinner"></span> Registering...
              </span>
            ) : (
              'Submit Donor Registration'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
