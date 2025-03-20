"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCode, faUser, faLock, faSignInAlt } from "@fortawesome/free-solid-svg-icons"
import "react-toastify/dist/ReactToastify.css"
import "../css/AuthPage.css"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({})
  const navigate = useNavigate() // For redirecting after login

  const validateForm = () => {
    const newErrors = {}
    if (!username) newErrors.username = "Username is required"
    if (!password) newErrors.password = "Password is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.status === 200) {
        // Success: Store token and redirect
        localStorage.setItem("auth_code", data.token) // Store token in localStorage
        toast.success("Login successful!") // Show success message
        setTimeout(() => navigate("/"), 1500) // Redirect to home page after 1.5 seconds
      } else {
        // Error: Show error message
        toast.error(data.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
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
            <FontAwesomeIcon icon={faSignInAlt} /> Login to Your Account
          </h2>
          <p className="auth-description">Sign in to track your favorite coding contests across multiple platforms</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} /> Username <span className="required">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={errors.username ? "error-input" : ""}
              />
              {errors.username && <span className="error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faLock} /> Password <span className="required">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? "error-input" : ""}
              />
              {errors.password && <span className="error">{errors.password}</span>}
            </div>

            <div className="form-footer">
              <button type="submit" className="submit-button">
                <FontAwesomeIcon icon={faSignInAlt} /> Login
              </button>
            </div>
          </form>

          <div className="auth-links">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
            <Link to="/forgot-password" className="auth-link small">
              Forgot password?
            </Link>
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

export default LoginPage

