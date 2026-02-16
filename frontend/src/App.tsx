import { useEffect, useState } from "react"
import SplashScreen from "./components/SplashScreen"
import Logo from "./assets/auth-page-img.jpg"

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
      <h1 className="text-lg text-lime-400">Welcome</h1>
      <img src={Logo} alt="" className="h-28 w-28" />
    </div>
  )
}

export default App
