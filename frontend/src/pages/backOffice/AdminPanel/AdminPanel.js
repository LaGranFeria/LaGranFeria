import { useState } from "react";

import Swal from "sweetalert2";
import $ from "jquery";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./AdminPanel.css";

//#region SVG'S
import { ReactComponent as Products } from "../../../assets/svgs/product.svg";
import { ReactComponent as Categories } from "../../../assets/svgs/category.svg";
import { ReactComponent as Orders } from "../../../assets/svgs/orders.svg";
import { ReactComponent as Seller } from "../../../assets/svgs/seller.svg";
import { ReactComponent as Shipment } from "../../../assets/svgs/shipment.svg";
import { ReactComponent as Payment } from "../../../assets/svgs/paymentInput.svg";
import { ReactComponent as Dolar } from "../../../assets/svgs/dolar.svg";
import { ReactComponent as Logout } from "../../../assets/svgs/logout.svg";
import { ReactComponent as Statistic } from "../../../assets/svgs/statistic.svg";
import { ReactComponent as Manager } from "../../../assets/svgs/manager2.svg";
import { ReactComponent as Supervisor } from "../../../assets/svgs/supervisor.svg";
import { ReactComponent as Users } from "../../../assets/svgs/users.svg";
import { ReactComponent as ResetPassword } from "../../../assets/svgs/resetpassword.svg";
import { ReactComponent as Settings } from "../../../assets/svgs/settings.svg";
import { ReactComponent as PasswordInput } from "../../../assets/svgs/password.svg";
import { ReactComponent as Update } from "../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../assets/svgs/closebtn.svg";
import { ReactComponent as Show } from "../../../assets/svgs/visible.svg";
import { ReactComponent as Hide } from "../../../assets/svgs/invisible.svg";
import { ReactComponent as Faqs } from "../../../assets/svgs/faqs.svg";
//#endregion

import { UpdatePasswordUsers } from "../../../services/UserService";

function AdminPanel() {
  //#region Constantes
  const token = localStorage.getItem("token");
  const nombreUsuario = JSON.parse(atob(token.split(".")[1])).unique_name;
  const nombreUsuarioDecodificado = decodeURIComponent(
    escape(nombreUsuario)
  ).replace(/Ã­/g, "í");
  const rolUsuario = JSON.parse(atob(token.split(".")[1])).role;
  const username = JSON.parse(atob(token.split(".")[1])).nameid;

  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  //#endregion

  //#region Función para cerrar el modal manualmente mediante el codigo
  function CloseModal() {
    $(document).ready(function () {
      $("#btn-close-modal").click();
    });

    setShowPassword(false);
    setShowPasswordRepeat(false);
  }
  //#endregion

  //#region Función para actualizar la contraseña
  async function UpdatePassword(event) {
    event.preventDefault();

    if (IsValid() === true) {
      try {
        const response = await UpdatePasswordUsers(
          {
            password: password,
            username: username,
          },
          headers
        );
        if (response.data.isSuccess === true) {
          Swal.fire({
            icon: "success",
            title: "Contraseña actualizada correctamente",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#6c757d",
            timer: 4000,
            timerProgressBar: true,
          });
          CloseModal();
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
        } else {
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

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos
  function IsValid() {
    if (password === "") {
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

  //#region Función para limpiar todos los valores de los inputs del formulario
  function ClearPasswordInputs() {
    setPassword("");
    setPasswordRepeat("");
  }
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Panel</title>
      </Helmet>
      <section className="general-container">
        <div className="general-content">
          <div className="wel-out">
            <h2 className="error welc-title">
              ¡Bienvenido {nombreUsuarioDecodificado}!
            </h2>

            <div className="botones-panel-div">
              <button
                className="btn-logout"
                data-bs-toggle="modal"
                data-bs-target="#modal"
                aria-label="Cambiar Contraseña"
                onClick={() => {
                  ClearPasswordInputs();
                  setTimeout(function () {
                    $("#password").focus();
                  }, 500);
                }}
              >
                <ResetPassword className="logout" />
              </button>

              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-configuraciones"
                  className="btn-logout"
                  aria-label="Configuraciones"
                >
                  <Settings className="logout" />
                </Link>
              )}

              <Link to="/login" className="btn-logout" aria-label="Logout">
                <Logout className="logout" />
              </Link>
            </div>
          </div>

          {/* modal con el formulario para actualizar la contraseña */}
          <div
            className="modal fade"
            id="modal"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title" id="exampleModalLabel">
                    Actualizar Contraseña
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <label className="label">Contraseña:</label>
                        <div className="form-group-input password-input">
                          <span className="input-group-text">
                            <PasswordInput className="input-group-svg" />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="input"
                            id="password"
                            value={password}
                            onChange={(event) => {
                              setPassword(event.target.value);
                            }}
                          />

                          <div
                            className="visibility2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Show className="show-btn2" />
                            ) : (
                              <Hide className="hide-btn2" />
                            )}
                          </div>
                        </div>

                        <label className="label">Repetir contraseña:</label>
                        <div className="form-group-input password-input2">
                          <span className="input-group-text">
                            <PasswordInput className="input-group-svg" />
                          </span>
                          <input
                            type={showPasswordRepeat ? "text" : "password"}
                            className="input"
                            id="passwordrepeat"
                            value={passwordRepeat}
                            onChange={(event) => {
                              setPasswordRepeat(event.target.value);
                            }}
                          />

                          <div
                            className="visibility2"
                            onClick={() =>
                              setShowPasswordRepeat(!showPasswordRepeat)
                            }
                          >
                            {showPasswordRepeat ? (
                              <Show className="show-btn2" />
                            ) : (
                              <Hide className="hide-btn2" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div id="div-btn-update">
                        <button
                          className="btn btn-warning btn-edit-color"
                          id="btn-update"
                          onClick={UpdatePassword}
                        >
                          <div className="btn-save-update-close">
                            <Update className="update-btn" />
                            <p className="p-save-update-close">Actualizar</p>
                          </div>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      ClearPasswordInputs();
                      CloseModal();
                    }}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <h2 className="title-error">
            Cliqué en la sección que desee gestionar
          </h2>

          <div className="secciones antes-faqs-terms">
            <div className="seccion-dividida2">
              {(rolUsuario === "Vendedor" ||
                rolUsuario === "Supervisor" ||
                rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-productos"
                  className="btn btn-dark category-btn"
                >
                  <Products className="category-svg" />
                  <p className="category-title">Productos</p>
                </Link>
              )}

              {(rolUsuario === "Vendedor" ||
                rolUsuario === "Supervisor" ||
                rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-categorias"
                  className="btn btn-dark category-btn"
                >
                  <Categories className="category-svg" />
                  <p className="category-title">Categorías</p>
                </Link>
              )}

              {(rolUsuario === "Vendedor" ||
                rolUsuario === "Supervisor" ||
                rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-pedidos"
                  className="btn btn-dark category-btn"
                >
                  <Orders className="category-svg" />
                  <p className="category-title">Pedidos</p>
                </Link>
              )}

              {(rolUsuario === "Gerente" || rolUsuario === "SuperAdmin") && (
                <Link
                  to="/estadisticas-pedidos"
                  className="btn btn-dark category-btn"
                >
                  <Statistic className="category-svg" />
                  <p className="category-title">Estadísticas</p>
                </Link>
              )}

              {rolUsuario === "SuperAdmin" && (
                <Link
                  to="/gestionar-usuarios"
                  className="btn btn-dark category-btn"
                >
                  <Users className="category-svg" />
                  <p className="category-title">Usuarios</p>
                </Link>
              )}

              {rolUsuario === "Admin" && (
                <Link
                  to="/gestionar-gerentes"
                  className="btn btn-dark category-btn"
                >
                  <Manager className="category-svg" />
                  <p className="category-title">Gerentes</p>
                </Link>
              )}

              {rolUsuario === "Gerente" && (
                <Link
                  to="/gestionar-supervisores"
                  className="btn btn-dark category-btn"
                >
                  <Supervisor className="category-svg" />
                  <p className="category-title">Supervisores</p>
                </Link>
              )}

              {rolUsuario === "Supervisor" && (
                <Link
                  to="/gestionar-vendedores"
                  className="btn btn-dark category-btn"
                >
                  <Seller className="category-svg" />
                  <p className="category-title">Vendedores</p>
                </Link>
              )}

              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-entregas"
                  className="btn btn-dark category-btn"
                >
                  <Shipment className="category-svg" />
                  <p className="category-title">Entregas</p>
                </Link>
              )}

              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-cotizacion"
                  className="btn btn-dark category-btn"
                >
                  <Dolar className="category-svg" />
                  <p className="category-title">Dólar</p>
                </Link>
              )}

              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <Link
                  to="/gestionar-medios-pago"
                  className="btn btn-dark category-btn"
                >
                  <Payment className="category-svg" />
                  <p className="category-title">Medios de pago</p>
                </Link>
              )}
            </div>
          </div>

          <div className="social-media">
            <div className="faqs-terms-container">
              <Link
                to="/preguntas-frecuentes"
                aria-label="Preguntas frecuentes"
              >
                <Faqs className="faqs-term-svg" />
              </Link>
              <Link to="/preguntas-frecuentes" className="term-faq-title">
                Preguntas frecuentes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default AdminPanel;
