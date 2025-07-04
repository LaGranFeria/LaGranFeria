import { useState } from "react";
import Swal from "sweetalert2";
import $ from "jquery";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

//#region SVG'S
import { ReactComponent as Panel } from "../../../assets/svgs/manager.svg";
import { ReactComponent as Logout } from "../../../assets/svgs/logout.svg";
import { ReactComponent as Show } from "../../../assets/svgs/visible.svg";
import { ReactComponent as Hide } from "../../../assets/svgs/invisible.svg";
//#endregion

import "./Login.css";

import { LoginUser } from "../../../services/UserService";

function Login() {
  //#region Constantes
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  //#endregion

  //#region Función para limpiar todos los valores de los inputs del formulario del login
  function ClearLoginInputs() {
    setUserName("");
    setPassword("");
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos
  function IsValid() {
    if (username === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar un email o usuario",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#username").focus();
        }, 500);
      });
      return false;
    } else if (password === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar una contraseña",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#password").focus();
        }, 500);
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para iniciar sesión
  async function handleLogin(event) {
    event.preventDefault();

    if (IsValid() === true) {
      try {
        const response = await LoginUser(username, password);
        if (response === true) {
          Swal.fire({
            icon: "success",
            title: "Inicio de sesión exitoso!",
            showConfirmButton: false,
            timer: 2000,
          });
          ClearLoginInputs();
          navigate("/panel");
        } else if (response.errorMessage === "Usuario desactivado") {
          Swal.fire({
            title: "Usuario desactivado",
            text: "Su cuenta está desactivada. Por favor, contacte a su superior.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        } else if (
          response.errorMessage === "Usuario/Email o contraseña incorrecta"
        ) {
          Swal.fire({
            title: "Email/Usuario o contraseña incorrecta",
            text: "Por favor, verifique su email/usuario y contraseña e intente nuevamente.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error en el inicio de sesión",
          text: "Ha ocurrido un error al intentar iniciar sesión. Por favor, inténtelo de nuevo más tarde.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Función para cerrar la sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    Swal.fire({
      icon: "warning",
      title: "Cerrando sesión",
      text: "Te estamos redirigiendo a la página de autenticación...",
      timer: 4500,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(navigate("/login"));
  };
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Login</title>
      </Helmet>

      {token === null || token === "" ? (
        <div className="login-container">
          <div className="login-content">
            <h2 className="title-login">Iniciar sesión</h2>
            <div className="search-content">
              <div className="login-column">
                <form className="form">
                  <div className="contact-field-email">
                    <input
                      className="contact-input"
                      type="text"
                      id="username"
                      value={username}
                      placeholder="Email o Usuario"
                      name="username"
                      onChange={(event) => {
                        setUserName(event.target.value);
                      }}
                    />
                  </div>

                  <div className="login-field-subject">
                    <input
                      className="contact-input-psw"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      placeholder="Contraseña"
                      name="password"
                      onChange={(event) => {
                        setPassword(event.target.value);
                      }}
                    />

                    <div
                      className="visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Show className="show-btn" />
                      ) : (
                        <Hide className="hide-btn" />
                      )}
                    </div>
                  </div>

                  <div className="login-send-button">
                    <button className="login-button2" onClick={handleLogin}>
                      Acceder
                    </button>
                  </div>

                  <p className="p-forgot-password">
                    <Link className="forgot-password" to="/reset-password">
                      ¿Has olvidado la contraseña?
                    </Link>{" "}
                    ·{" "}
                    <Link className="forgot-password" to="/create-user">
                      Registrate
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="general-container">
          <div className="notfound-content">
            <h2 className="title-login">
              Usted se encuentra logueado con el usuario:{" "}
              <b>{JSON.parse(atob(token.split(".")[1])).nameid}</b>
            </h2>

            <Link to="/panel" className="btn btn-dark category-btn">
              <Panel className="category-svg" />
              <p className="category-title">Dashboard</p>
            </Link>

            <button className="login-button" onClick={handleLogout}>
              <Logout className="logout-svg" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
  //#endregion
}

export default Login;
