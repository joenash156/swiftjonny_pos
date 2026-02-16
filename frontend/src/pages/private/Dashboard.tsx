import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Dashboard() {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard! Here you can manage your account and view your activity.</p>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center">
        <i className="fa-solid fa-bolt text-white mr-2"></i>
        Logout
      </button>
    </div>
  )
}

export default Dashboard