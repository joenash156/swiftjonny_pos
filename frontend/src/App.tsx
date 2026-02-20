import { useEffect, useState } from "react"
import SplashScreen from "./pages/SplashScreen"
import { Route, Routes } from "react-router-dom"
import AuthPagesLayout from "./layouts/AuthPagesLayout"
import Login from "./pages/public/Login"
import Homepage from "./pages/public/Homepage"
import Register from "./pages/public/Register"
import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/private/Dashboard"
import VerifyEmail from "./pages/public/VerifyEmail"
import EmailVerificationHandler from "./pages/public/EmailVerificationHandler"

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) return <SplashScreen />

  return (
    <div>
      <Routes>
        {/* Auth pages layout (unprotected routes) */}
        <Route element={<AuthPagesLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email/verify" element={<EmailVerificationHandler />} />
        </Route>

        {/* App layout (protected routes) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
