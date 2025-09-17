import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/signin", { replace: true }); // Use replace to prevent going back to the protected route
    }
  }, [navigate]);

  const token = localStorage.getItem("access_token");
  if (!token) {
    return null; // Render nothing while redirecting
  }

  return children;
};

export default ProtectedRoute;