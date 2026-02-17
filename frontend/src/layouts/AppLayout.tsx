import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { useAuth } from "../contexts/AuthContext";

function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While checking auth state, avoid flashing the login page
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <ThreeDots
          height="60"
          width="60"
          radius="9"
          color="#4F46E5"
          ariaLabel="three-dots-loading"
          visible
        />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated users can see the app layout and its nested routes
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;