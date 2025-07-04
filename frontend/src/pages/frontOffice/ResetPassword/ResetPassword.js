import { useState } from "react";
import Swal from "sweetalert2";
import $ from "jquery";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import "./ResetPassword.css";

import { ReactComponent as Show } from "../../../assets/svgs/visible.svg";
import { ReactComponent as Hide } from "../../../assets/svgs/invisible.svg";

import {
  SearchUsers,
  VerifyUsers,
  UpdatePasswordNotLoggedUsers,
} from "../../../services/UserService";

function ResetPassword() {
  //#region Constantes
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  const [mostrarSearch, setMostrarSearch] = useState(true);
  const [mostrarVerify, setMostrarVerify] = useState(false);
  const [mostrarReset, setMostrarReset] = useState(false);

  const [intervalId, setIntervalId] = useState(null);
  const [contador, setContador] = useState(60); // Se inicializa el contador en 60 segundos
  //#endregion

  //#region Función para ocultar una fraccion del email
  function ocultarEmail(email) {
    const partes = email.split("@");
    const nombreUsuario = partes[0];
    const dominio = partes[1];

    const oculto = "*".repeat(nombreUsuario.length - 3); // Oculta todos los caracteres excepto los últimos 3
    const visible = nombreUsuario.slice(-3); // Obtiene los últimos 3 caracteres

    return `${oculto}${visible}@${dominio}`;
  }
  //#endregion

  //#region Función para iniciar el contador y el intervalo
  function iniciarContador() {
    const id = setInterval(() => {
      setContador((prevContador) => prevContador - 1);
    }, 1000);
    setIntervalId(id);
  }
  //#endregion

  //#region Función para detener el contador y el intervalo
  function detenerContador() {
    clearInterval(intervalId);
    setIntervalId(null);
  }
  //#endregion

  //#region Función para verificar si el valor ingresado a traves del input existe (usuario)
  function IsValidSearch() {
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
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si el valor ingresado a traves del input es correcto (código)
  function IsValidVerify() {
    if (code === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar el código de verificación",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#code").focus();
        }, 500);
      });
      return false;
    } else if (code.length < 6) {
      Swal.fire({
        icon: "error",
        title: "El código debe tener 6 dígitos",
        text: "Por favor, ingrese el código con su formato correcto.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#code").focus();
        }, 500);
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si el valor ingresado a traves del input es correcto (password)
  function IsValidReset() {
    if (password === "") {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar una contraseña nueva",
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
        title: "La contraseña nueva debe tener al menos 6 caracteres",
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

  //#region Función para buscar el usuario en la base de datos
  async function SearchUser(event) {
    event.preventDefault();
    // Deshabilitar el botón para evitar clics repetidos
    $("#p-resend").prop("disabled", true).css("cursor", "default");

    // Detener el contador actual si existe
    if (intervalId) {
      detenerContador();
    }

    if (IsValidSearch() === true) {
      try {
        const response = await SearchUsers({
          username: username.includes("@") ? "" : username,
          email: username.includes("@") ? username : "",
        });
        if (response.data.isSuccess === true) {
          setEmail(response.data.email);
          Swal.fire({
            icon: "success",
            title: "Código de Verificación Enviado",
            text: "Se ha enviado un código de verificación a su casilla de email. Por favor, ingréselo para verificar su cuenta.",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#6c757d",
            timer: 8000,
            timerProgressBar: true,
          });
          setMostrarSearch(false);
          setMostrarVerify(true);

          // Iniciar el contador
          setContador(60);
          iniciarContador();

          // Deshabilita el botón durante el contador regresivo
          setTimeout(() => {
            clearInterval(intervalId);
            // Habilitar el botón cuando el contador llegue a cero
            $("#p-resend").removeAttr("disabled").css("cursor", "pointer");
          }, 60000); // 60 segundos
        } else if (
          response.data.errorMessage === "Usuario/Email no registrado"
        ) {
          Swal.fire({
            title: "Email o Usuario no registrado",
            text: "Vuelve a intentarlo con otra información.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error al buscar email o usuario",
          text: "Ha ocurrido un error al intentar buscar el email o usuario. Por favor, inténtelo de nuevo más tarde.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Función para verificar el codigo de verificación ingresado por el usuario
  async function VerifyUser(event) {
    event.preventDefault();

    if (IsValidVerify() === true) {
      try {
        const response = await VerifyUsers({
          username: username.includes("@") ? "" : username,
          email: username.includes("@") ? username : "",
          codigoVerificacion: code,
        });
        if (response.data.isSuccess === true) {
          Swal.fire({
            icon: "success",
            title: "Código de verificación validado correctamente",
            text: "A continuación ingrese su nueva contraseña",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#6c757d",
            timer: 4000,
            timerProgressBar: true,
          });
          setMostrarSearch(false);
          setMostrarVerify(false);
          setMostrarReset(true);
        } else if (
          response.data.errorMessage === "Código de verificación incorrecto"
        ) {
          Swal.fire({
            title: "Código de verificación incorrecto",
            text: "El número que has introducido no coincide con tu código. Comprueba el código y vuelve a intentarlo.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error al verificar el código de verificación",
          text: "Ha ocurrido un error al intentar buscar el email o usuario. Por favor, inténtelo de nuevo más tarde.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      }
    }
  }
  //#endregion

  //#region Función para actualizar la contraseña del usuario
  async function UpdatePasswordNotLoggedUser(event) {
    event.preventDefault();

    if (IsValidReset() === true) {
      try {
        const response = await UpdatePasswordNotLoggedUsers({
          password: password,
          email: email,
          codigoVerificacion: code,
        });
        if (response.data.isSuccess === true) {
          Swal.fire({
            icon: "success",
            title: "Contraseña actualizada correctamente",
            text: "A continuación serás redirigido a la página de inicio de sesión.",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#6c757d",
            timer: 6000,
            timerProgressBar: true,
          });
          setMostrarSearch(true);
          setMostrarVerify(false);
          setMostrarReset(false);
          navigate("/login");
        } else if (
          response.data.errorMessage ===
          "La contraseña proporcionada es la misma que la actual"
        ) {
          Swal.fire({
            title: "No se pudo modificar la contraseña",
            text: "Ingrese una contraseña diferente a la actual.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        } else if (
          response.data.errorMessage === "Código de verificación incorrecto"
        ) {
          Swal.fire({
            title: "No se pudo modificar la contraseña",
            text: "Ha ocurrido un error al intentar modificar la contraseña. Por favor, inténtelo de nuevo más tarde.",
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error al modificar la contraseña",
          text: "Ha ocurrido un error al intentar modificar la contraseña. Por favor, inténtelo de nuevo más tarde.",
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
        <title>La Gran Feria | Recuperar cuenta</title>
      </Helmet>

      <div className="login-container">
        {mostrarSearch && (
          <div className="resetpassword-content">
            <h2 className="title-login">Recupera tu cuenta</h2>
            <p>Introduce tu email o usuario para buscar tu cuenta.</p>
            <div className="search-content">
              <div className="login-column">
                <form>
                  <div className="contact-field-email">
                    <input
                      className="search2-input"
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

                  <div className="search-button">
                    <Link className="cancel-button link-reset" to="/login">
                      Cancelar
                    </Link>

                    <button className="login-button2" onClick={SearchUser}>
                      Buscar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {mostrarVerify && (
          <div className="resetpassword-content">
            <h2 className="title-login">Introduce el código de verificación</h2>
            <p>
              Comprueba si has recibido un mensaje con tu código de 6 dígitos en
              tu dirección de email.
            </p>
            <b className="email-oculto">{`${ocultarEmail(email)}`}</b>

            <div className="search-content">
              <div className="login-column">
                <form className="code-form">
                  <div className="contact-field-email">
                    <input
                      className="search2-input"
                      type="number"
                      id="code"
                      value={code}
                      placeholder="Código de verificación"
                      name="code"
                      maxLength="6"
                      onChange={(event) => {
                        const inputVal = event.target.value;
                        const formattedVal = inputVal.replace(/\D/g, ""); // Elimina caracteres no numéricos
                        const truncatedVal = formattedVal.slice(0, 6); // Trunca la entrada a 6 dígitos
                        setCode(truncatedVal);
                      }}
                    />
                  </div>

                  <button
                    className={`create-user-password p-resend ${
                      contador > 0 ? "counter-text-disabled" : ""
                    }`}
                    id="p-resend"
                    onClick={SearchUser}
                    disabled={contador > 0}
                  >
                    {contador === 0 || contador < 0
                      ? "Reenviar código"
                      : `Reenviar en ${contador} segundos`}
                  </button>

                  <div className="search-button">
                    <button
                      className="cancel-button link-reset"
                      onClick={() => {
                        setMostrarSearch(true);
                        setMostrarVerify(false);
                        setUserName("");
                      }}
                    >
                      Cancelar
                    </button>

                    <button className="login-button2" onClick={VerifyUser}>
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {mostrarReset && (
          <div className="resetpassword-content">
            <h2 className="title-login">Elige una contraseña nueva</h2>
            <p>
              Crea una contraseña nueva de <b>seis caracteres como mínimo</b>.
              Una contraseña segura tiene una combinación de letras, números y
              signos de puntuación.
            </p>

            <div className="search-content">
              <div className="login-column">
                <form>
                  <div className="login-field-subject">
                    <input
                      className="search2-input"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      placeholder="Contraseña nueva"
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
                      className="search2-input"
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

                  <div className="search-button">
                    <button
                      className="cancel-button link-reset"
                      onClick={() => {
                        setMostrarSearch(true);
                        setMostrarVerify(false);
                        setMostrarReset(false);
                        setUserName("");
                        setEmail("");
                        setPassword("");
                        setPasswordRepeat("");
                        setCode("");
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      className="login-button2"
                      onClick={UpdatePasswordNotLoggedUser}
                    >
                      Continuar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  //#endregion
}

export default ResetPassword;
