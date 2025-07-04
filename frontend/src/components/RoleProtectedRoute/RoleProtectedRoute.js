import { Navigate, Outlet } from "react-router-dom";

export const RoleProtectedRoute = ({
  allowedRoles,
  redirectTo = "/panel",
  children,
}) => {
  const token = localStorage.getItem("token");

  // Decode the token
  const tokenPayload = JSON.parse(atob(token.split(".")[1]));
  const rolUsuario = tokenPayload.role;

  // Check if the user's role is in the allowed roles
  if (!allowedRoles.includes(rolUsuario)) {
    return <Navigate to={redirectTo} />;
  }

  // Render children or Outlet if no children are provided
  return children ? children : <Outlet />;
};
