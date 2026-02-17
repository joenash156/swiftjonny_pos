import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { setAccessToken } from "../services/api";
import Swal from "sweetalert2";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // fetch current user to start session
  useEffect(() => {
    async function checkAuth() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.post("/user/refresh");
        setAccessToken(data.accessToken); // This sets it in api.js
        const me = await api.get("/user/me");
        setUser(me.data.user);
      } catch (refreshErr) {
        console.log("User not logged in: ", refreshErr);
        localStorage.removeItem("user");
        localStorage.removeItem("theme");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Login
  async function login(email, password) {
    const response = await api.post("/user/login", {
      email,
      password,
    });

    if (response.data.success) {
      setAccessToken(response.data.accessToken); // This sets it in api.js
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("theme", JSON.stringify(response.data.user.theme));
      navigate("/expenses");
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  }

  // change theme
  async function changeTheme(theme) {
    try {
      const response = await api.patch("/user/update_theme", {
        theme,
      });

      if (response.data.success) {
        // Update user state with new theme
        setUser((prevUser) => ({
          ...prevUser,
          theme,
        }));

        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          storedUser.theme = theme;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }
        localStorage.setItem("theme", JSON.stringify(theme));

        // await Swal.fire({
        //   icon: "success",
        //   title: "Theme updated!",
        //   text: `Theme changed to ${theme} mode`,
        //   confirmButtonColor: "#10b981",
        //   toast: true,
        //   position: "top-end",
        //   showConfirmButton: false,
        //   timer: 800,
        //   timerProgressBar: true,
        // });
      }
    } catch (err) {
      console.error("Unable to update theme: ", err);
      await Swal.fire({
        icon: "error",
        title: "Update failed!",
        text: "Failed to update theme. Please try again.",
        confirmButtonColor: "#ef4444",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 800,
        timerProgressBar: true,
      });
    }
  }

  // Use useCallback to memoize the function
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await api.get("/expenses");

      if (response.data.success) {
        return response.data.expenses;
      } else {
        console.error("Failed to fetch expenses:", response.data.message);
        return [];
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      return [];
    }
  }, []);

  // Fetch single expense by ID
  const fetchExpenseById = useCallback(async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      if (response.data.success) {
        return response.data.expense;
      }
      return null;
    } catch (err) {
      console.error("Error fetching expense:", err);
      throw err;
    }
  }, []);

  // Update expense
  const updateExpense = useCallback(async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, {
        type: expenseData.type,
        title: expenseData.title,
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        payment_method: expenseData.paymentType,
        date: expenseData.date,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Expense updated successfully",
          confirmButtonColor: "#10b981",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating expense:", err);
      await Swal.fire({
        icon: "error",
        title: "Update failed!",
        text: "Failed to update expense. Please try again.",
        confirmButtonColor: "#ef4444",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      throw err;
    }
  }, []);

  // Delete expense
  const deleteExpense = useCallback(async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Expense deleted successfully",
          confirmButtonColor: "#10b981",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting expense:", err);
      await Swal.fire({
        icon: "error",
        title: "Delete failed!",
        text: "Failed to delete expense. Please try again.",
        confirmButtonColor: "#ef4444",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      throw err;
    }
  }, []);

  // Add expense
  const addExpense = useCallback(async (expenseData) => {
    try {
      const response = await api.post("/expenses/insert_expense", {
        type: expenseData.type,
        title: expenseData.title,
        amount: expenseData.amount,
        description: expenseData.description,
        category: expenseData.category,
        payment_method: expenseData.paymentType,
        date: expenseData.date,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Expense added successfully",
          confirmButtonColor: "#10b981",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding expense:", err);
      await Swal.fire({
        icon: "error",
        title: "Failed to add!",
        text: "Failed to add expense. Please try again.",
        confirmButtonColor: "#ef4444",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      throw err;
    }
  }, []);

  // logout
  async function logout() {
    try {
      await api.post("/user/logout");
      await Swal.fire({
        icon: "success",
        title: "Logout successful!",
        text: "You logged out successfully from your account",
        confirmButtonColor: "#10b981",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Logout error: ", err);
      await Swal.fire({
        icon: "error",
        title: "Logout failed!",
        text: "Something went wrong while logging out.",
        confirmButtonColor: "#3b82f6",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("theme");
      navigate("/login");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        changeTheme,
        fetchExpenses,
        fetchExpenseById,
        updateExpense,
        deleteExpense,
        addExpense,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
