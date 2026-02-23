import { useEffect, useState } from "react"
import SplashScreen from "./pages/SplashScreen"
import { Route, Routes } from "react-router-dom"
import AuthPagesLayout from "./layouts/AuthPagesLayout"
import Login from "./pages/public/Login"
import Homepage from "./pages/public/Homepage"
import Register from "./pages/public/Register"
import AppLayout from "./layouts/AppLayout"
import Dashboard from "./pages/private/Dashboard"
import Sales from "./pages/private/Sales"
import Cashiers from "./pages/private/Cashiers"
import Settings from "./pages/private/Settings"
import POSTerminal from "./pages/private/POSTerminal"
import POSSettings from "./pages/private/POSSettings"
import Products from "./pages/private/Products"
import Categories from "./pages/private/Categories"
import Inventory from "./pages/private/Inventory"
import Analytics from "./pages/private/Analytics"
import VerifyEmail from "./pages/public/VerifyEmail"
import EmailVerificationHandler from "./pages/public/EmailVerificationHandler"
import ApprovalPending from "./pages/public/ApprovalPending"
import HelpSupport from "./pages/public/HelpSupport"
import ScrollTop from "./components/ScrollTop"

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
      <ScrollTop />
      <Routes>
        {/* Auth pages layout (unprotected routes) */}
        <Route element={<AuthPagesLayout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/email/verify" element={<EmailVerificationHandler />} />
          <Route path="/approval-pending" element={<ApprovalPending />} />
        </Route>

        {/* App layout (protected routes) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/pos" element={<POSTerminal />} />
          <Route path="/pos-settings" element={<POSSettings />} />
          <Route path="/cashiers" element={<Cashiers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Standalone pages (no layout) */}
        <Route path="/help" element={<HelpSupport />} />
      </Routes>
    </div>
  )
}

export default App
