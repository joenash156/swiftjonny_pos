import { useEffect, useState } from "react"
import SplashScreen from "./components/SplashScreen"
import { Route, Routes } from "react-router-dom"
import AuthPagesLayout from "./layouts/AuthPagesLayout"
import Login from "./pages/public/Login"
import Homepage from "./pages/public/Homepage"

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
        </Route>

      </Routes>
    </div>
  )
}

export default App
