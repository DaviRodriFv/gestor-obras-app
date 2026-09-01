import { Navigate } from "react-router-dom";
import { authService } from "../../services/authService";

export default function RequireRole({ allowedRoles = [], children }) {
  const user = authService.getUser();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.cargo)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
