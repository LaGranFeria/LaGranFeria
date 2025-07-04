import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      const expiracionEnMilisegundos = exp * 1000;
      const fechaExpiracion = new Date(expiracionEnMilisegundos);
      const fechaActual = new Date();

      if (fechaExpiracion <= fechaActual) {
        localStorage.removeItem("token");
        Swal.fire({
          icon: "warning",
          title: "Tu sesión ha expirado",
          text: "Te estamos redirigiendo a la página de autenticación...",
          timer: 4500,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        navigate(redirectTo);
      }
    }
  }, [token, navigate, redirectTo]);

  if (!token) {
    return <Navigate to={redirectTo} />;
  }

  return children ? children : <Outlet />;
};
