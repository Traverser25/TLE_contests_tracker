"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode, faUser, faEnvelope, faPhone, faLock, faUserPlus } from "@fortawesome/free-solid-svg-icons"
import "react-toastify/dist/ReactToastify.css"
import "../css/AuthPage.css"

const RegisterPage = () => {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState({})
  const navigate = useNavigate() // For redirecting after registration

  const validateForm = () => {
    const newErrors = {}
    if (!username) newErrors.username = "Username is required"
    if (!email) newErrors.email = "Email is required"
    if (!phoneNumber) newErrors.phoneNumber = "Phone Number is required"
    if (!password) newErrors.password = "Password is required"
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          phoneNumber,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.status === 201) {
        // Success: Show success message and redirect
        toast.success("Registration successful! Please log in.")
        setTimeout(() => navigate("/login"), 2000) // Redirect to login page after 2 seconds
      } else {
        // Error: Show error message
        toast.error(data.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("An error occurred. Please try again.")
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <FontAwesomeIcon icon={faCode} className="auth-logo" />
          <h1>CodeTrack</h1>
          <p className="auth-tagline">Your Ultimate Coding Contest Tracker</p>
        </div>

        <div className="auth-card">
          <h2>
            <FontAwesomeIcon icon={faUserPlus} /> Create Your Account
          </h2>
          <p className="auth-description">
            Join CodeTrack to stay updated with all coding contests and never miss an opportunity
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} /> Username <span className="required">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className={errors.username ? "error-input" : ""}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faEnvelope} /> Email <span className="required">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? "error-input" : ""}
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faPhone} /> Phone Number <span className="required">*</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className={errors.phoneNumber ? "error-input" : ""}
              />
              {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faLock} /> Password <span className="required">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className={errors.password ? "error-input" : ""}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faLock} /> Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={errors.confirmPassword ? "error-input" : ""}
              />
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-footer">
              <button type="submit" className="submit-button">
                <FontAwesomeIcon icon={faUserPlus} /> Register
              </button>
            </div>
          </form>

          <div className="auth-links">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-footer">
          <p>© {new Date().getFullYear()} CodeTrack. All rights reserved.</p>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  )
}

export default RegisterPage

