import { useState } from "react";
import Swal from "sweetalert2";
import $ from "jquery";

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./CreateUser.css";

import { ReactComponent as Show } from "../../../assets/svgs/visible.svg";
import { ReactComponent as Hide } from "../../../assets/svgs/invisible.svg";

import { SaveUsersNotLogged } from "../../../services/UserService";

function CreateUser() {
  //#region Constantes
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  //#endregion

  //#region Funcion para limpiar todos los valores de los inputs del formulario
  function ClearUserInputs() {
    setNombre("");
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordRepeat("");
  }
  //#endregion

  //#region Funcion para verificar si los valores ingresados a traves de los input son correctos
  function IsValid() {
    if (nombre === "") {
      Swal.fire({
        icon: "error",
        title: "El nombre completo no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#nombre").focus();
        }, 500);
      });

      return false;
    } else if (username === "") {
      Swal.fire({
        icon: "error",
        title: "El nombre de usuario no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#username").focus();
        }, 500);
      });

      return false;
    } else if (email === "") {
      Swal.fire({
        icon: "error",
        title: "El email no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#email").focus();
        }, 500);
      });

      return false;
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      Swal.fire({
        icon: "error",
        title: "Formato de email incorrecto",
        text: "Ingrese un email válido",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#email").focus();
        }, 500);
      });
      return false;
    } else if (password === "") {
      Swal.fire({
        icon: "error",
        title: "La contraseña no puede estar vacía",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#password").focus();
        }, 500);
      });

      return false;
    } else if (password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "La contraseña debe tener al menos 6 caracteres",
        text: "Por favor, ingrese una contraseña con al menos 6 caracteres.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#password").focus();
        }, 500);
      });

      return false;
    } else if (passwordRepeat === "") {
      Swal.fire({
        icon: "error",
        title: "Debe repetir su contraseña",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#passwordrepeat").focus();
        }, 500);
      });

      return false;
    } else if (password !== passwordRepeat) {
      Swal.fire({
        icon: "error",
        title: "Las contraseñas no coinciden",
        text: "Por favor, asegúrese de que las contraseñas coincidan.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#passwordrepeat").focus();
        }, 500);
      });

      return false;
    }
    return true;
  }
  //#endregion

  //#region Funcion para insertar un usuario a la base de datos
  async function SaveUserNotLogged(event) {
    event.preventDefault();

    IsValid();

    if (IsValid() === true) {
      try {
        const response = await SaveUsersNotLogged({
          rol: 6,
          nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
          username: username,
          password: password,
          email: email,
        });

        if (response.data.statusCode === 200) {
          Swal.fire({
            icon: "success",
            title: "Usuario registrado exitosamente",
            text: "Espere a que su cuenta sea activada por un superior. Se le enviará un correo electrónico cuando su cuenta esté activa.",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#6c757d",
            timer: 8000,
            timerProgressBar: true,
          });
          ClearUserInputs();
          navigate("/login");
        } else if (
          response.data.errorMessage.includes(
            "Este nombre de usuario ya se encuentra registrado"
          )
        ) {
          Swal.fire({
            icon: "error",
            title: "El nombre de usuario ingresado ya se encuentra registrado",
            text: "Modifique el campo",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          }).then(function () {
            setTimeout(function () {
              $("#username").focus();
            }, 500);
          });
        } else if (
          response.data.errorMessage.includes(
            "Este email ya se encuentra registrado"
          )
        ) {
          Swal.fire({
            icon: "error",
            title: "El email ingresado ya se encuentra registrado",
            text: "Modifique el campo",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          }).then(function () {
            setTimeout(function () {
              $("#email").focus();
            }, 500);
          });
        }
      } catch (err) {
        Swal.fire({
          title: err,
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Registrar Usuario</title>
      </Helmet>

      <div className="login-container">
        <div className="login-content">
          <h2 className="title-login">Registrar usuario</h2>
          <div className="search-content">
            <div className="login-column">
              <form className="form">
                <div className="contact-field-email">
                  <input
                    className="contact-input"
                    type="text"
                    id="nombre"
                    value={nombre}
                    placeholder="Nombre completo"
                    name="nombre"
                    onChange={(event) => {
                      setNombre(event.target.value);
                    }}
                  />
                </div>

                <div className="contact-field-email">
                  <input
                    className="contact-input"
                    type="text"
                    id="username"
                    value={username}
                    placeholder="Nombre de usuario"
                    name="username"
                    onChange={(event) => {
                      setUsername(event.target.value);
                    }}
                  />
                </div>

                <div className="contact-field-email">
                  <input
                    className="contact-input"
                    type="text"
                    id="email"
                    value={email}
                    placeholder="Email"
                    name="email"
                    onChange={(event) => {
                      setEmail(event.target.value);
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

                <div className="login-field-subject">
                  <input
                    className="contact-input-psw"
                    type={showPasswordRepeat ? "text" : "password"}
                    id="passwordrepeat"
                    value={passwordRepeat}
                    placeholder="Repetir contraseña"
                    name="passwordrepeat"
                    onChange={(event) => {
                      setPasswordRepeat(event.target.value);
                    }}
                  />

                  <div
                    className="visibility"
                    onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                  >
                    {showPasswordRepeat ? (
                      <Show className="show-btn" />
                    ) : (
                      <Hide className="hide-btn" />
                    )}
                  </div>
                </div>

                <div className="login-send-button">
                  <button className="login-button2" onClick={SaveUserNotLogged}>
                    Registrarte
                  </button>
                </div>

                <Link className="create-user-password" to="/login">
                  ¿Ya tienes una cuenta?
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  //#endregion
}

export default CreateUser;
