import Swal from "sweetalert2";
import { ReactComponent as Filter } from "../../../../assets/svgs/filter.svg";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./UserManager.css";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Delete } from "../../../../assets/svgs/delete.svg";
import { ReactComponent as Add } from "../../../../assets/svgs/add.svg";
import { ReactComponent as Save } from "../../../../assets/svgs/save.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Show } from "../../../../assets/svgs/visible.svg";
import { ReactComponent as Hide } from "../../../../assets/svgs/invisible.svg";
import { ReactComponent as Verificar } from "../../../../assets/svgs/verificar.svg";
import { ReactComponent as Pendiente } from "../../../../assets/svgs/pendiente.svg";
import { ReactComponent as ManagerInput } from "../../../../assets/svgs/manager2.svg";
import { ReactComponent as UserInput } from "../../../../assets/svgs/users.svg";
import { ReactComponent as SupervisorInput } from "../../../../assets/svgs/supervisor.svg";
import { ReactComponent as SellerInput } from "../../../../assets/svgs/seller.svg";
import { ReactComponent as UsernameInput } from "../../../../assets/svgs/username.svg";
import { ReactComponent as EmailInput } from "../../../../assets/svgs/email.svg";
import { ReactComponent as RolInput } from "../../../../assets/svgs/rol.svg";
import { ReactComponent as PasswordInput } from "../../../../assets/svgs/password.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetUsers,
  GetUsersByRole,
  SaveUsers,
  DeleteUsers,
  UpdateUsers,
  UpdateUsersActive,
} from "../../../../services/UserService";

function UserManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const pathname = window.location.pathname.toLowerCase();

  const [idUsuario, setIdUsuario] = useState("");

  const [nombre, setNombre] = useState("");
  const [prevNombre, setPrevNombre] = useState("");

  const [username, setUsername] = useState("");
  const [prevUsername, setPrevUsername] = useState("");

  const [email, setEmail] = useState("");
  const [prevEmail, setPrevEmail] = useState("");

  const [disponibilidadCatalogo, setDisponibilidadCatalogo] = useState("");
  const [prevDisponibilidadCatalogo, setPrevDisponibilidadCatalogo] =
    useState("");

  const [password, setPassword] = useState("");

  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [rol, setRol] = useState("");
  const [prevRol, setPrevRol] = useState("");

  const [activo, setActivo] = useState("");
  const [prevActivo, setPrevActivo] = useState("");

  const [modalTitle, setModalTitle] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);

  const [allUsers, setAllUsers] = useState([]);

  const [users, setUsers] = useState([]);

  const [originalUsersList, setOriginalUsersList] = useState(users);

  const [title, setTitle] = useState("Detalles de Usuarios");

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");

  const [inactive, setInactive] = useState(false);
  const [rolFiltrado, setRolFiltrado] = useState("");

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(20);
  const lastIndex = currentPage * usersPerPage;
  const firstIndex = lastIndex - usersPerPage;
  const usersTable = users.slice(firstIndex, lastIndex);
  const npage = Math.ceil(users.length / usersPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [maxPageNumbersToShow, setMaxPageNumbersToShow] = useState(9);
  const minPageNumbersToShow = 0;
  //#endregion
  //#endregion

  //#region UseEffect
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const result = await GetUsers();
        setAllUsers(result);

        if (pathname.includes("gerentes")) {
          (async () => {
            const gerentes = await GetUsersByRole("Gerente");
            setUsers(gerentes);
            setOriginalUsersList(gerentes);
            setTitle("Detalles de Gerentes");
          })();
        } else if (pathname.includes("supervisores")) {
          (async () => {
            const supervisores = await GetUsersByRole("Supervisor");
            setUsers(supervisores);
            setOriginalUsersList(supervisores);
            setTitle("Detalles de Supervisores");
          })();
        } else if (pathname.includes("vendedores")) {
          (async () => {
            const vendedores = await GetUsersByRole("Vendedor");
            setUsers(vendedores);
            setOriginalUsersList(vendedores);
            setTitle("Detalles de Vendedores");
          })();
        } else if (pathname.includes("usuarios")) {
          setUsers(result);
          setOriginalUsersList(result);
          setTitle("Detalles de Usuarios");
        }

        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setUsersPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setUsersPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setUsersPerPage(3);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setUsersPerPage(4);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setUsersPerPage(5);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setUsersPerPage(6);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setUsersPerPage(7);
      setMaxPageNumbersToShow(1);
    } else {
      setUsersPerPage(10);
      setMaxPageNumbersToShow(9);
    }
  }, []);
  //#endregion

  //#region Función para desactivar un usuario
  const Pending = async (user) => {
    const idUsuario = user.idUsuario;

    Swal.fire({
      icon: "warning",
      title: pathname.includes("gerentes")
        ? `¿Está seguro de que desea desactivar al siguiente gerente: ${user.nombre}?`
        : pathname.includes("supervisores")
        ? `¿Está seguro de que desea desactivar al siguiente supervisor: ${user.nombre}?`
        : pathname.includes("vendedores")
        ? `¿Está seguro de que desea desactivar al siguiente vendedor: ${user.nombre}?`
        : `¿Está seguro de que desea desactivar al siguiente usuario: ${user.nombre}?`,
      text: "Se cambiará el estado del usuario a inactivo",
      confirmButtonText: "Aceptar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f8bb86",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UpdateUsersActive(
            users.find((u) => u.idUsuario === idUsuario).idUsuario || idUsuario,
            {
              idUsuario: idUsuario,
              activo: false,
              idRol: pathname.includes("supervisores")
                ? 4
                : pathname.includes("gerentes")
                ? 3
                : pathname.includes("vendedores")
                ? 5
                : GetRolId(
                    users.find((u) => u.idUsuario === idUsuario).rol || ""
                  ),
            },
            headers
          );
          Swal.fire({
            icon: "success",
            title: "Estado del usuario actualizado exitosamente!",
            showConfirmButton: false,
            timer: 2000,
          });

          if (pathname.includes("gerentes")) {
            const gerentes = await GetUsersByRole("Gerente");
            setUsers(gerentes);
          } else if (pathname.includes("supervisores")) {
            const supervisores = await GetUsersByRole("Supervisor");
            setUsers(supervisores);
          } else if (pathname.includes("vendedores")) {
            const vendedores = await GetUsersByRole("Vendedor");
            setUsers(vendedores);
          } else if (pathname.includes("usuarios")) {
            const result = await GetUsers();
            setUsers(result);
          }

          setUsers((prevUsers) => {
            setOriginalUsersList(prevUsers);

            if (filterType === "inactive") {
              const result = prevUsers.filter((user) => {
                return user.activo === false;
              });
              if (pathname.includes("gerentes")) {
                setTitle("Detalles de Gerentes inactivos");
              } else if (pathname.includes("supervisores")) {
                setTitle("Detalles de Supervisores inactivos");
              } else if (pathname.includes("vendedores")) {
                setTitle("Detalles de Vendedores inactivos");
              } else {
                setTitle("Detalles de Usuarios inactivos");
              }
              setUsers(result);
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName("Inactivo");
              setFilterType("inactive");
              setCurrentPage(1);
            } else if (filterType === "role") {
              const result = prevUsers.filter((user) => {
                return user.rol === rolFiltrado;
              });

              setTitle(`Detalles de Usuarios con rol ${rolFiltrado}`);

              setUsers(result);
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(rolFiltrado);
              setFilterType("role");
              setCurrentPage(1);
            }

            if (filterType === "other") {
              setUsers(prevUsers);
            } else {
              return prevUsers;
            }
          });
        } catch (error) {
          Swal.fire({
            title: error,
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      }
    });
  };
  //#endregion

  //#region Función para activar un usuario
  const Verify = async (user) => {
    const idUsuario = user.idUsuario;

    Swal.fire({
      icon: "warning",
      title:
        user.rol === "Predeterminado"
          ? pathname.includes("gerentes")
            ? `¿Está seguro de que desea activar al siguiente usuario: ${user.nombre} como gerente?`
            : pathname.includes("supervisores")
            ? `¿Está seguro de que desea activar al siguiente usuario: ${user.nombre} como supervisor?`
            : pathname.includes("vendedores")
            ? `¿Está seguro de que desea activar al siguiente usuario: ${user.nombre} como vendedor?`
            : `¿Está seguro de que desea activar al siguiente usuario: ${user.nombre}?`
          : pathname.includes("gerentes")
          ? `¿Está seguro de que desea activar al siguiente gerente: ${user.nombre}?`
          : pathname.includes("supervisores")
          ? `¿Está seguro de que desea activar al siguiente supervisor: ${user.nombre}?`
          : pathname.includes("vendedores")
          ? `¿Está seguro de que desea activar al siguiente vendedor: ${user.nombre}?`
          : `¿Está seguro de que desea activar al siguiente usuario: ${user.nombre}?`,
      text: "Se cambiará el estado del usuario a activo",
      confirmButtonText: "Aceptar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f8bb86",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UpdateUsersActive(
            users.find((u) => u.idUsuario === idUsuario).idUsuario || idUsuario,
            {
              idUsuario: idUsuario,
              activo: true,
              idRol: pathname.includes("supervisores")
                ? 4
                : pathname.includes("gerentes")
                ? 3
                : pathname.includes("vendedores")
                ? 5
                : GetRolId(
                    users.find((u) => u.idUsuario === idUsuario).rol || ""
                  ),
            },
            headers
          );
          Swal.fire({
            icon: "success",
            title: "Estado del usuario actualizado exitosamente!",
            showConfirmButton: false,
            timer: 2000,
          });

          if (pathname.includes("gerentes")) {
            const gerentes = await GetUsersByRole("Gerente");
            setUsers(gerentes);
          } else if (pathname.includes("supervisores")) {
            const supervisores = await GetUsersByRole("Supervisor");
            setUsers(supervisores);
          } else if (pathname.includes("vendedores")) {
            const vendedores = await GetUsersByRole("Vendedor");
            setUsers(vendedores);
          } else if (pathname.includes("usuarios")) {
            const result = await GetUsers();
            setUsers(result);
          }

          setUsers((prevUsers) => {
            setOriginalUsersList(prevUsers);

            if (filterType === "inactive") {
              const result = prevUsers.filter((user) => {
                return user.activo === false;
              });
              if (pathname.includes("gerentes")) {
                setTitle("Detalles de Gerentes inactivos");
              } else if (pathname.includes("supervisores")) {
                setTitle("Detalles de Supervisores inactivos");
              } else if (pathname.includes("vendedores")) {
                setTitle("Detalles de Vendedores inactivos");
              } else {
                setTitle("Detalles de Usuarios inactivos");
              }
              setUsers(result);
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName("Inactivo");
              setFilterType("inactive");
              setCurrentPage(1);
            } else if (filterType === "role") {
              const result = prevUsers.filter((user) => {
                return user.rol === rolFiltrado;
              });

              setTitle(`Detalles de Usuarios con rol ${rolFiltrado}`);

              setUsers(result);
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(rolFiltrado);
              setFilterType("role");
              setCurrentPage(1);
            }
            if (filterType === "other") {
              setUsers(prevUsers);
            } else {
              return prevUsers;
            }
          });
        } catch (error) {
          Swal.fire({
            title: error,
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f27474",
          });
        }
      }
    });
  };
  //#endregion

  const handleCheckboxChangeCatalogo = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setDisponibilidadCatalogo((prevState) => {
      // Si el checkbox se selecciona y es "Entrega por depósito"
      if (value === "1" && isChecked) {
        return prevState.includes("2") ? ["1", "2"] : ["1"];
      }
      // Si el checkbox se selecciona y es "Entrega a domicilio"
      if (value === "2" && isChecked) {
        return prevState.includes("1") ? ["1", "2"] : ["2"];
      }
      // Si ambos checkboxes están seleccionados
      if (isChecked && prevState.includes("1") && prevState.includes("2")) {
        return ["1", "2"];
      }
      // Si el checkbox se deselecciona
      return prevState.filter((item) => item !== value);
    });
  };

  //#region Función para limpiar los filtros
  const ClearFilter = () => {
    setUsers(originalUsersList); // trae la lista de usuarios original, sin ningun filtro
    setFilterName("");
    setFilterType("");
    setRolFiltrado("");
    if (pathname.includes("gerentes")) {
      setTitle("Detalles de Gerentes");
    } else if (pathname.includes("supervisores")) {
      setTitle("Detalles de Supervisores");
    } else if (pathname.includes("vendedores")) {
      setTitle("Detalles de Vendedores");
    } else {
      setTitle("Detalles de Usuarios");
    }
    document.getElementById("clear-filter").style.display = "none";
    document.getElementById("clear-filter2").style.display = "none"; // esconde del DOM el boton de limpiar filtros
    setCurrentPage(1);
    if (inactive === true) {
      setInactive(false);
    }
    window.scrollTo(0, 0);
  };
  //#endregion

  //#region Función para filtrar por inactivos
  const filterResultInactive = (inactive) => {
    if (inactive === false) {
      // setUsers(originalUsersList);
      setOriginalUsersList(users);
      const result = users.filter((users) => {
        return users.activo === false;
      });
      if (pathname.includes("gerentes")) {
        setTitle("Detalles de Gerentes inactivos");
      } else if (pathname.includes("supervisores")) {
        setTitle("Detalles de Supervisores inactivos");
      } else if (pathname.includes("vendedores")) {
        setTitle("Detalles de Vendedores inactivos");
      } else {
        setTitle("Detalles de Usuarios inactivos");
      }
      setUsers(result);
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName("Inactivo");
      setFilterType("inactive");
      setCurrentPage(1);
      window.scrollTo(0, 0);
      setRolFiltrado("");
    } else {
      ClearFilter();
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por tipo de pedido
  const filterResultRole = async (role) => {
    try {
      setUsers(originalUsersList);
      const result = originalUsersList.filter((originalUsersList) => {
        return originalUsersList.rol === role;
      });
      setUsers(result);

      setTitle(`Detalles de usuarios con rol ${role}`);
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName(role);
      setFilterType("role");
      setCurrentPage(1);
      window.scrollTo(0, 0);
    } catch {
      console.log("Error al filtrar usuarios por rol");
    }
  };
  //#endregion

  //#region Funciones para la paginacion
  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }
  //#endregion

  //#region Función para limpiar todos los valores de los inputs del formulario
  function ClearUserInputs() {
    setIdUsuario("");

    setNombre("");
    setUsername("");
    setEmail("");
    setPassword("");
    setPasswordRepeat("");
    setRol("");
    setActivo("");
    setDisponibilidadCatalogo("");
  }
  //#endregion

  //#region Función para obtener el id del rol de un usuario
  function GetRolId(rolNombre) {
    switch (rolNombre) {
      case "Admin":
        return 2;
      case "Gerente":
        return 3;
      case "Supervisor":
        return 4;
      case "Vendedor":
        return 5;
      case "Predeterminado":
        return 6;
      default:
        return null; // Otra opción puede ser lanzar un error o devolver un valor predeterminado
    }
  }
  //#endregion

  //#region Función para obtener los valores almacenados de un usuario y cargar cada uno de ellos en su input correspondiente
  function RetrieveUserInputs(user) {
    setIdUsuario(user.idUsuario);
    setNombre(user.nombre);
    setUsername(user.username);
    setEmail(user.email);

    if (user.rol === "Admin") {
      setRol(2);
    } else if (user.rol === "Gerente") {
      setRol(3);
    } else if (user.rol === "Supervisor") {
      setRol(4);
    } else if (user.rol === "Vendedor") {
      setRol(5);
    } else if (user.rol === "Predeterminado") {
      setRol(6);
    }

    const disponibilidadCatalogoValue = user.disponibilidadCatalogo;
    if (disponibilidadCatalogoValue === 1) {
      setDisponibilidadCatalogo(["1"]);
      setPrevDisponibilidadCatalogo(["1"]);
    } else if (disponibilidadCatalogoValue === 2) {
      setDisponibilidadCatalogo(["2"]);
      setPrevDisponibilidadCatalogo(["2"]);
    } else if (disponibilidadCatalogoValue === 3) {
      setDisponibilidadCatalogo(["1", "2"]);
      setPrevDisponibilidadCatalogo(["1", "2"]);
    }

    setActivo(user.activo);

    setPrevNombre(user.nombre);
    setPrevUsername(user.username);
    setPrevEmail(user.email);

    if (user.rol === "Admin") {
      setPrevRol(2);
    } else if (user.rol === "Gerente") {
      setPrevRol(3);
    } else if (user.rol === "Supervisor") {
      setPrevRol(4);
    } else if (user.rol === "Vendedor") {
      setPrevRol(5);
    } else if (user.rol === "Predeterminado") {
      setPrevRol(6);
    }

    setPrevActivo(user.activo);
  }
  //#endregion

  //#region Función para volver el formulario a su estado inicial, borrando los valores de los inputs, cargando los selects y refrezcando la lista de usuarios
  async function InitialState() {
    ClearUserInputs();

    const result = await GetUsers();
    setAllUsers(result);

    if (pathname.includes("gerentes")) {
      const gerentes = await GetUsersByRole("Gerente");
      setUsers(gerentes);
      setOriginalUsersList(gerentes);
    } else if (pathname.includes("supervisores")) {
      const supervisores = await GetUsersByRole("Supervisor");
      setUsers(supervisores);
      setOriginalUsersList(supervisores);
    } else if (pathname.includes("vendedores")) {
      const vendedores = await GetUsersByRole("Vendedor");
      setUsers(vendedores);
      setOriginalUsersList(vendedores);
    } else {
      setUsers(result);
      setOriginalUsersList(result);
    }
  }
  //#endregion

  //#region Función para cerrar el modal manualmente mediante el codigo
  function CloseModal() {
    $(document).ready(function () {
      $("#btn-close-modal").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal de filtros manualmente mediante el codigo
  function CloseFilterModal() {
    $(document).ready(function () {
      $("#btn-close-modal-filters").click();
    });
  }
  //#endregion

  //#region Función para mostrar el boton de Guardar de manera normal
  function ShowSaveButton() {
    const btnSave = document.getElementById("btn-save");
    const divBtnSave = document.getElementById("div-btn-save");
    btnSave.style.pointerEvents = "all";
    btnSave.style.opacity = "1";
    divBtnSave.style.cursor = "default";
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves del input son correctos
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
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
      ShowSaveButton();
      return false;
    } else if (pathname.includes("usuarios") && rol === "") {
      Swal.fire({
        icon: "error",
        title: "El rol no puede estar vacío",
        text: "Seleccione un rol",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      ShowSaveButton();
      return false;
    } else if (
      (pathname.includes("usuarios") &&
        rol == 5 &&
        disponibilidadCatalogo === "") ||
      (Array.isArray(disponibilidadCatalogo) &&
        disponibilidadCatalogo.length === 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar en que catálogo se encuentra disponible",
        text: "Clickeé en el/los botón/es de los catálogos donde se encuentre disponible",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      ShowSaveButton();
      return false;
    } else if (activo === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar si se encuentra inactivo",
        text: "Clickeé el botón en caso de que la mismo se encuentre inactivo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      ShowSaveButton();
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos en el update
  function IsValidUpdate() {
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
    } else if (pathname.includes("usuarios") && rol === "") {
      Swal.fire({
        icon: "error",
        title: "El rol no puede estar vacío",
        text: "Seleccione un rol",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });

      return false;
    } else if (
      (pathname.includes("usuarios") &&
        rol == 5 &&
        disponibilidadCatalogo === "") ||
      (Array.isArray(disponibilidadCatalogo) &&
        disponibilidadCatalogo.length === 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar en que catálogo se encuentra disponible",
        text: "Clickeé en el/los botón/es de los catálogos donde se encuentre disponible",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      ShowSaveButton();
      return false;
    } else if (activo === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar si se encuentra inactivo",
        text: "Clickeé el botón en caso de que la mismo se encuentre inactivo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });

      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si los valores ingresados a traves de los inputs no esta repetidos
  function IsRepeated() {
    for (let i = 0; i < allUsers.length; i++) {
      if (
        username.toLowerCase() === allUsers[i].username.toLowerCase() &&
        username !== prevUsername
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

        if (modalTitle.includes("Registrar")) {
          ShowSaveButton();
        }

        return true;
      } else if (
        email.toLowerCase() === allUsers[i].email.toLowerCase() &&
        email !== prevEmail
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

        if (modalTitle.includes("Registrar")) {
          ShowSaveButton();
        }

        return true;
      }
    }
    return false;
  }
  //#endregion

  //#region Función para verificar si los valores de los input estan vacios
  function IsEmpty() {
    if (nombre !== "") {
      return false;
    } else if (username !== "") {
      return false;
    } else if (email !== "") {
      return false;
    } else if (password !== "") {
      return false;
    } else if (disponibilidadCatalogo !== "") {
      return false;
    } else if (activo !== true) {
      return false;
    }
    return true;
  }
  //#endregion

  function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  //#region Función para verificar si se actualizo al menos un valor de los inputs
  function IsUpdated() {
    if (
      prevNombre.toLowerCase() !== nombre.toLocaleLowerCase() ||
      prevUsername.toLowerCase() !== username.toLocaleLowerCase() ||
      prevEmail.toLowerCase() !== email.toLocaleLowerCase() ||
      (pathname.includes("usuarios") && prevRol != rol) ||
      !arraysEqual(prevDisponibilidadCatalogo, disponibilidadCatalogo) ||
      prevActivo !== activo
    ) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para insertar un usuario
  async function SaveUser(event) {
    event.preventDefault();

    const btnSave = document.getElementById("btn-save");
    const divBtnSave = document.getElementById("div-btn-save");
    btnSave.style.pointerEvents = "none";
    btnSave.style.opacity = "0.5";
    divBtnSave.style.cursor = "wait";

    IsValid();
    IsRepeated();

    if (IsValid() === true && IsRepeated() === false) {
      try {
        await SaveUsers(
          {
            idRol: pathname.includes("supervisores")
              ? 4
              : pathname.includes("gerentes")
              ? 3
              : pathname.includes("vendedores")
              ? 5
              : rol,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            username: username,
            password: password,
            activo: activo,
            email: email,
            disponibilidadCatalogo:
              !disponibilidadCatalogo || disponibilidadCatalogo.length === 0
                ? 0
                : disponibilidadCatalogo.length === 1
                ? disponibilidadCatalogo.includes("1")
                  ? 1
                  : 2
                : 3,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: pathname.includes("vendedores")
            ? "Vendedor registrado exitosamente!"
            : pathname.includes("supervisores")
            ? "Supervisor registrado exitosamente!"
            : pathname.includes("gerentes")
            ? "Gerente registrado exitosamente!"
            : "Usuario registrado exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        CloseModal();
        ShowSaveButton();
        InitialState();
        ClearFilter();
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

  //#region Función para actualizar un usuario ya existente
  async function UpdateUser(event) {
    event.preventDefault();

    IsRepeated();

    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title: pathname.includes("vendedores")
          ? "No puede actualizar el vendedor sin modificar ningun campo"
          : pathname.includes("supervisores")
          ? "No puede actualizar el supervisor sin modificar ningun campo"
          : pathname.includes("gerentes")
          ? "No puede actualizar el gerente sin modificar ningun campo"
          : "No puede actualizar el usuario sin modificar ningun campo",
        text: "Modifique al menos un campo para poder actualizarlo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (
      IsValidUpdate() === true &&
      IsUpdated() === true &&
      IsRepeated() === false
    ) {
      try {
        await UpdateUsers(
          users.find((u) => u.idUsuario === idUsuario).idUsuario || idUsuario,
          {
            idUsuario: idUsuario,
            idRol: pathname.includes("supervisores")
              ? 4
              : pathname.includes("gerentes")
              ? 3
              : pathname.includes("vendedores")
              ? 5
              : rol,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            username: username,
            activo: activo,
            email: email,
            disponibilidadCatalogo:
              !disponibilidadCatalogo || disponibilidadCatalogo.length === 0
                ? 0
                : disponibilidadCatalogo.length === 1
                ? disponibilidadCatalogo.includes("1")
                  ? 1
                  : 2
                : 3,
          },
          headers
        );

        Swal.fire({
          icon: "success",
          title: pathname.includes("vendedores")
            ? "Vendedor actualizado exitosamente!"
            : pathname.includes("supervisores")
            ? "Supervisor actualizado exitosamente!"
            : pathname.includes("gerentes")
            ? "Gerente actualizado exitosamente!"
            : "Usuario actualizado exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });

        CloseModal();
        // InitialState();

        ClearUserInputs();

        const result = await GetUsers();
        setAllUsers(result);

        if (pathname.includes("gerentes")) {
          const gerentes = await GetUsersByRole("Gerente");
          setUsers(gerentes);
          setOriginalUsersList(gerentes);
        } else if (pathname.includes("supervisores")) {
          const supervisores = await GetUsersByRole("Supervisor");
          setUsers(supervisores);
          setOriginalUsersList(supervisores);
        } else if (pathname.includes("vendedores")) {
          const vendedores = await GetUsersByRole("Vendedor");
          setUsers(vendedores);
          setOriginalUsersList(vendedores);
        } else if (pathname.includes("usuarios")) {
          setUsers(result);
          setOriginalUsersList(result);
        }

        setUsers((prevUsers) => {
          setOriginalUsersList(prevUsers);

          if (filterType === "inactive") {
            const result = prevUsers.filter((user) => {
              return user.activo === false;
            });
            if (pathname.includes("gerentes")) {
              setTitle("Detalles de Gerentes inactivos");
            } else if (pathname.includes("supervisores")) {
              setTitle("Detalles de Supervisores inactivos");
            } else if (pathname.includes("vendedores")) {
              setTitle("Detalles de Vendedores inactivos");
            } else {
              setTitle("Detalles de Usuarios inactivos");
            }
            setUsers(result);
            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setFilterName("Inactivo");
            setFilterType("inactive");
            setCurrentPage(1);
          } else if (filterType === "role") {
            const result = prevUsers.filter((user) => {
              return user.rol === rolFiltrado;
            });

            setTitle(`Detalles de Usuarios con rol ${rolFiltrado}`);

            setUsers(result);
            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setFilterName(rolFiltrado);
            setFilterType("role");
            setCurrentPage(1);
          }

          if (filterType === "other") {
            setUsers(prevUsers);
          } else {
            return prevUsers;
          }
        });
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

  //#region Función para eliminar un usuario existente
  async function DeleteUser(id) {
    try {
      let resultado = await DeleteUsers(id, headers);

      if (resultado.data.statusCode === 400) {
        Swal.fire({
          icon: "error",
          title:
            "No puede eliminar este vendedor ya que el mismo se encuentra seleccionado dentro de uno o mas pedidos",
          text: "Primero debera eliminar el/los pedidos que contienen al vendedor que desea eliminar o cambiarle/s su vendedor",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: pathname.includes("vendedores")
            ? "Vendedor eliminado exitosamente!"
            : pathname.includes("supervisores")
            ? "Supervisor eliminado exitosamente!"
            : pathname.includes("gerentes")
            ? "Gerente eliminado exitosamente!"
            : "Usuario eliminado exitosamente",
          showConfirmButton: false,
          timer: 2000,
        });
        InitialState();
        ClearFilter();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error,
        text: error.message,
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
    }
  }
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Gestionar Usuarios</title>
      </Helmet>

      <section className="general-container">
        <div className="general-content">
          <div className="general-title">
            <div className="title-header">
              <Link to="/panel" className="btn btn-info btn-back">
                <div className="btn-back-content">
                  <Back className="back" />
                  <p className="p-back">Regresar</p>
                </div>
              </Link>

              <h2 className="title title-general">{title}</h2>

              {isLoading === false && (
                <button
                  type="button"
                  className="btn btn-success btn-add"
                  data-bs-toggle="modal"
                  data-bs-target="#modal"
                  onClick={() => {
                    ClearUserInputs();
                    setModalTitle(() => {
                      if (pathname.includes("vendedores")) {
                        return "Registrar Vendedor";
                      } else if (pathname.includes("supervisores")) {
                        return "Registrar Supervisor";
                      } else if (pathname.includes("gerentes")) {
                        return "Registrar Gerente";
                      } else {
                        return "Registrar Usuario";
                      }
                    });
                    setTimeout(function () {
                      $("#nombre").focus();
                    }, 500);
                    setActivo(true);
                  }}
                >
                  <div className="btn-add-content">
                    <Add className="add" />
                    <p className="p-add">Añadir</p>
                  </div>
                </button>
              )}
            </div>

            {isLoading === false &&
              (users.length > 1 || users.length === 0 ? (
                <p className="total">
                  Hay {users.length}{" "}
                  {pathname.includes("vendedores")
                    ? "vendedores"
                    : pathname.includes("supervisores")
                    ? "supervisores"
                    : pathname.includes("gerentes")
                    ? "gerentes"
                    : "usuarios"}
                  .
                </p>
              ) : (
                <p className="total">
                  Hay {users.length}{" "}
                  {pathname.includes("vendedores")
                    ? "vendedor"
                    : pathname.includes("supervisores")
                    ? "supervisor"
                    : pathname.includes("gerentes")
                    ? "gerente"
                    : "usuario"}
                  .
                </p>
              ))}
          </div>

          {/* modal con el formulario para registrar un usuario */}
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
                    {modalTitle}
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <input
                          type="text"
                          className="input"
                          id="idUsuario"
                          hidden
                          value={idUsuario}
                          onChange={(event) => {
                            setIdUsuario(event.target.value);
                          }}
                        />

                        <label className="label">Nombre completo:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            {pathname.includes("vendedores") ? (
                              <SellerInput className="input-group-svg" />
                            ) : pathname.includes("supervisores") ? (
                              <SupervisorInput className="input-group-svg" />
                            ) : pathname.includes("gerentes") ? (
                              <ManagerInput className="input-group-svg" />
                            ) : (
                              <UserInput className="input-group-svg" />
                            )}
                          </span>
                          <input
                            type="text"
                            className="input"
                            id="nombre"
                            value={nombre}
                            onChange={(event) => {
                              setNombre(event.target.value);
                            }}
                          />
                        </div>

                        <label className="label">Nombre de usuario:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <UsernameInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            id="username"
                            value={username}
                            onChange={(event) => {
                              setUsername(event.target.value);
                            }}
                          />
                        </div>

                        <label className="label">Email:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <EmailInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            id="email"
                            value={email}
                            onChange={(event) => {
                              setEmail(event.target.value);
                            }}
                          />
                        </div>

                        {modalTitle.includes("Registrar") && (
                          <>
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
                            <div className="form-group-input password-input">
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
                          </>
                        )}

                        {pathname.includes("usuarios") ? (
                          <div>
                            <label className="label selects" htmlFor="roles">
                              Rol:
                            </label>
                            <div className="form-group-input password-input">
                              <span className="input-group-text">
                                <RolInput className="input-group-svg" />
                              </span>
                              <select
                                className="input"
                                name="categorias"
                                id="categorias"
                                value={rol}
                                onChange={(e) => {
                                  setRol(e.target.value);
                                  if (e.target.value === "6") {
                                    // Verifica si el valor seleccionado es 6
                                    setActivo(false); // Establece activo como false
                                  }

                                  if (e.target.value !== "5") {
                                    setDisponibilidadCatalogo(0);
                                  }
                                }}
                              >
                                <option hidden key={0} value="0">
                                  Seleccione un rol
                                </option>
                                <option value="2">Admin</option>
                                <option value="3">Gerente</option>
                                <option value="4">Supervisor</option>
                                <option value="5">Vendedor</option>
                                <option value="6">Predeterminado</option>
                              </select>
                            </div>
                          </div>
                        ) : null}

                        {pathname.includes("usuarios") && rol == 5 ? (
                          <div>
                            <label
                              className="label selects"
                              htmlFor="disponibilidadCatalogo"
                            >
                              Disponibilidad Catálogo:
                            </label>

                            <div className="checkbox-group">
                              <div className="checkbox-cont">
                                <input
                                  className="checkbox-input"
                                  type="checkbox"
                                  id="catalogoMinorista"
                                  name="disponibilidadCatalogo"
                                  value="1"
                                  checked={disponibilidadCatalogo.includes("1")}
                                  onChange={handleCheckboxChangeCatalogo}
                                />
                                <label htmlFor="catalogoMinorista">LGF</label>
                              </div>

                              <div className="checkbox-cont">
                                <input
                                  className="checkbox-input"
                                  type="checkbox"
                                  id="catalogoMayorista"
                                  name="disponibilidadCatalogo"
                                  value="2"
                                  checked={disponibilidadCatalogo.includes("2")}
                                  onChange={handleCheckboxChangeCatalogo}
                                />
                                <label htmlFor="catalogoMayorista">Zeide</label>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {(rol != 6 ||
                        (rol == 6 &&
                          (pathname.includes("vendedores") ||
                            pathname.includes("supervisores") ||
                            pathname.includes("gerentes")))) && (
                        <div className="form-group activo2 nombre-input">
                          <label className="label">Activo</label>
                          <input
                            type="checkbox"
                            className="form-check-input tick"
                            id="activo"
                            checked={activo}
                            onChange={(e) => {
                              setActivo(e.target.checked);
                            }}
                          />
                          <label
                            htmlFor="activo"
                            className="lbl-switch"
                          ></label>
                        </div>
                      )}

                      <div>
                        {modalTitle.includes("Registrar") ? (
                          <div id="div-btn-save">
                            <button
                              className="btn btn-success btnadd"
                              id="btn-save"
                              onClick={SaveUser}
                            >
                              <div className="btn-save-update-close">
                                <Save className="save-btn" />
                                <p className="p-save-update-close">Guardar</p>
                              </div>
                            </button>
                          </div>
                        ) : (
                          <div id="div-btn-update">
                            <button
                              className="btn btn-warning btn-edit-color"
                              id="btn-update"
                              onClick={UpdateUser}
                            >
                              <div className="btn-save-update-close">
                                <Update className="update-btn" />
                                <p className="p-save-update-close">
                                  Actualizar
                                </p>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (modalTitle.includes("Registrar")) {
                        if (IsEmpty() === true) {
                          ClearUserInputs();
                          CloseModal();
                        } else {
                          Swal.fire({
                            icon: "warning",
                            title:
                              "¿Está seguro de que desea cerrar el formulario?",
                            text: "Se perderán todos los datos cargados",
                            confirmButtonText: "Aceptar",
                            showCancelButton: true,
                            cancelButtonText: "Cancelar",
                            confirmButtonColor: "#f8bb86",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              ClearUserInputs();
                              CloseModal();
                            }
                          });
                        }
                      } else if (modalTitle.includes("Actualizar")) {
                        if (IsUpdated() === false) {
                          ClearUserInputs();
                          CloseModal();
                        } else {
                          Swal.fire({
                            icon: "warning",
                            title:
                              "¿Está seguro de que desea cerrar el formulario?",
                            text: "Se perderán todos los datos modificados",
                            confirmButtonText: "Aceptar",
                            showCancelButton: true,
                            cancelButtonText: "Cancelar",
                            confirmButtonColor: "#f8bb86",
                            cancelButtonColor: "#6c757d",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              ClearUserInputs();
                              CloseModal();
                            }
                          });
                        }
                      }
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

          <br />

          {/* modal con filtro */}
          <div
            className="modal fade"
            id="modal-filters"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-dialog2">
              <div className="modal-content">
                <div className="modal-header2">
                  <h1 className="modal-title2" id="exampleModalLabel">
                    Filtros
                  </h1>
                  <button
                    id="clear-filter2"
                    className="clear-filter2"
                    onClick={ClearFilter}
                  >
                    <Close className="close-svg2" />
                    <p className="clear-filter-p">{filterName}</p>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <p className="filter-separator separator-margin"></p>

                    {pathname.includes("usuarios") && (
                      <>
                        <div
                          className="filter-btn-container"
                          data-bs-toggle="collapse"
                          href="#collapseCategory"
                          role="button"
                          aria-expanded="false"
                          aria-controls="collapseCategory"
                        >
                          <p className="filter-btn-name">ROLES</p>

                          <div className="form-group-input">
                            <select
                              className="input2"
                              style={{ cursor: "pointer" }}
                              name="tipo"
                              id="tipo"
                              value={rolFiltrado}
                              onChange={(e) => {
                                setRolFiltrado(e.target.value);
                                filterResultRole(e.target.value);
                              }}
                            >
                              <option hidden key={0} value="0">
                                Seleccione un rol
                              </option>
                              <option className="btn-option" value="Admin">
                                Admin
                              </option>
                              <option className="btn-option" value="Gerente">
                                Gerente
                              </option>
                              <option className="btn-option" value="Supervisor">
                                Supervisor
                              </option>
                              <option className="btn-option" value="Vendedor">
                                Vendedor
                              </option>
                            </select>
                          </div>
                        </div>

                        <p className="filter-separator"></p>
                      </>
                    )}

                    <div className="filter-btn-container">
                      <p className="filter-btn-name">INACTIVO</p>
                      <p className="filter-btn">
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="inactive"
                          checked={inactive}
                          onChange={() => {
                            setInactive(!inactive);
                            filterResultInactive(inactive);
                          }}
                        />
                        <label
                          htmlFor="inactive"
                          className="lbl-switch"
                        ></label>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={CloseFilterModal}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal-filters"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {(users.length > 0 || (users.length === 0 && inactive === true)) && (
            <div className="filters-left3">
              <div className="pagination-count-filter">
                <button
                  className="btn btn-secondary btn-filters"
                  data-bs-toggle="modal"
                  data-bs-target="#modal-filters"
                >
                  <div
                    className="filter-btn-title-container-2"
                    id="filter-btn-title-container"
                  >
                    <p className="filter-btn">
                      <Filter className="filter-svg2" />
                    </p>
                    <p className="filter-title2">Filtros</p>
                  </div>
                </button>

                <button
                  id="clear-filter"
                  className="clear-filter2"
                  onClick={ClearFilter}
                >
                  <Close className="close-svg2" />
                  <p className="clear-filter-p">{filterName}</p>
                </button>
              </div>
            </div>
          )}

          {/* tabla de usuarios */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando usuarios...</p>
            </div>
          ) : (
            <table
              className="table table-dark table-bordered table-hover table-list"
              align="center"
            >
              <thead>
                <tr className="table-header">
                  <th className="table-title" scope="col">
                    #
                  </th>
                  <th className="table-title" scope="col">
                    Nombre completo
                  </th>
                  <th className="table-title" scope="col">
                    Usuario
                  </th>
                  <th className="table-title" scope="col">
                    Email
                  </th>
                  <th className="table-title" scope="col">
                    Rol
                  </th>
                  <th className="table-title" scope="col">
                    Disponibilidad Catálogo
                  </th>
                  <th className="table-title" scope="col">
                    Activo
                  </th>
                  <th className="table-title" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>

              {users.length > 0 ? (
                usersTable
                  .filter((user) => user.rol !== "SuperAdmin")
                  .map(function fn(user, index) {
                    return (
                      <tbody key={1 + user.idUsuario}>
                        <tr>
                          <th scope="row" className="table-name">
                            {index + 1}
                          </th>
                          <td className="table-name">{user.nombre}</td>
                          <td className="table-name">{user.username}</td>
                          <td className="table-name">{user.email}</td>
                          <td
                            className={`table-name ${
                              user.rol === "Predeterminado"
                                ? "predeterminado"
                                : ""
                            }`}
                          >
                            {user.rol}
                          </td>

                          <td className="table-name">
                            {user.disponibilidadCatalogo === 1
                              ? "LGF"
                              : user.disponibilidadCatalogo === 2
                              ? "Zeide"
                              : user.disponibilidadCatalogo === 3
                              ? "LGF y Zeide"
                              : ""}
                          </td>

                          {user.activo ? (
                            <td className="table-name">
                              <div className="status-btns">
                                <div className="circulo-verificado"></div>
                                <p className="status-name">Si</p>
                                {(user.rol !== "Predeterminado" ||
                                  (user.rol === "Predeterminado" &&
                                    (pathname.includes("vendedores") ||
                                      pathname.includes("gerentes") ||
                                      pathname.includes("supervisores")))) && (
                                  <button
                                    type="button"
                                    className="btn btn-light btn-delete4"
                                    aria-label="Desverificar"
                                    onClick={() => {
                                      Pending(user);
                                    }}
                                  >
                                    <Pendiente className="edit3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          ) : (
                            <td className="table-name">
                              <div className="status-btns">
                                <div className="circulo-pendiente"></div>
                                <p className="status-name">No</p>
                                {(user.rol !== "Predeterminado" ||
                                  (user.rol === "Predeterminado" &&
                                    (pathname.includes("vendedores") ||
                                      pathname.includes("gerentes") ||
                                      pathname.includes("supervisores")))) && (
                                  <button
                                    type="button"
                                    className="btn btn-light btn-delete4"
                                    aria-label="Verificar"
                                    onClick={() => {
                                      Verify(user);
                                    }}
                                  >
                                    <Verificar className="edit3" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}

                          <td className="table-name">
                            <button
                              type="button"
                              className="btn btn-warning btn-edit"
                              aria-label="Modificar"
                              data-bs-toggle="modal"
                              data-bs-target="#modal"
                              onClick={() => {
                                RetrieveUserInputs(user);
                                setModalTitle(() => {
                                  if (pathname.includes("vendedores")) {
                                    return "Actualizar Vendedor";
                                  } else if (
                                    pathname.includes("supervisores")
                                  ) {
                                    return "Actualizar Supervisor";
                                  } else if (pathname.includes("gerentes")) {
                                    return "Actualizar Gerente";
                                  } else {
                                    return "Actualizar Usuario";
                                  }
                                });
                              }}
                            >
                              <Edit className="edit" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-danger btn-delete"
                              aria-label="Eliminar"
                              onClick={() =>
                                Swal.fire({
                                  title: pathname.includes("vendedores")
                                    ? "Esta seguro de que desea eliminar el siguiente vendedor: " +
                                      user.nombre +
                                      "?"
                                    : pathname.includes("supervisores")
                                    ? "Esta seguro de que desea eliminar el siguiente supervisor: " +
                                      user.nombre +
                                      "?"
                                    : pathname.includes("gerentes")
                                    ? "Esta seguro de que desea eliminar el siguiente gerente: " +
                                      user.nombre +
                                      "?"
                                    : "Esta seguro de que desea eliminar el siguiente usuario: " +
                                      user.nombre +
                                      "?",
                                  text: "Una vez eliminado, no se podra recuperar",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#F8BB86",
                                  cancelButtonColor: "#6c757d",
                                  confirmButtonText: "Aceptar",
                                  cancelButtonText: "Cancelar",
                                  focusCancel: true,
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    DeleteUser(user.idUsuario);
                                  }
                                })
                              }
                            >
                              <Delete className="delete" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    );
                  })
              ) : (
                <tbody>
                  <tr className="tr-name1">
                    <td className="table-name table-name1" colSpan={13}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}

          <div className="pagination-count-container2">
            <div className="pagination-count">
              {users.length > 0 ? (
                users.length === 1 ? (
                  <p className="total">
                    {pathname.includes("vendedores")
                      ? "Vendedor"
                      : pathname.includes("supervisores")
                      ? "Supervisor"
                      : pathname.includes("gerentes")
                      ? "Gerente"
                      : "Usuario"}{" "}
                    {firstIndex + 1} de {users.length}
                  </p>
                ) : (
                  <p className="total">
                    {pathname.includes("vendedores")
                      ? "Vendedores"
                      : pathname.includes("supervisores")
                      ? "Supervisores"
                      : pathname.includes("gerentes")
                      ? "Gerentes"
                      : "Usuarios"}{" "}
                    {firstIndex + 1} a {usersTable.length + firstIndex} de{" "}
                    {users.length}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>

            {users.length > 0 ? (
              <ul className="pagination-manager">
                <li className="page-item">
                  <div className="page-link" onClick={prePage}>
                    {"<"}
                  </div>
                </li>

                <li className="numbers">
                  {numbers.map((n, i) => {
                    if (n === currentPage) {
                      return (
                        <ul className="page-item-container" key={i}>
                          <li className="page-item active" key={i}>
                            <div className="page-link">{n}</div>
                          </li>
                        </ul>
                      );
                    } else if (
                      n === 1 ||
                      n === npage ||
                      (n >= currentPage - maxPageNumbersToShow &&
                        n <= currentPage + maxPageNumbersToShow)
                    ) {
                      return (
                        <ul className="page-item-container" key={i}>
                          <li className="page-item" key={i}>
                            <div
                              className="page-link"
                              onClick={() => changeCPage(n)}
                            >
                              {n}
                            </div>
                          </li>
                        </ul>
                      );
                    } else if (
                      (n === currentPage - maxPageNumbersToShow - 1 &&
                        currentPage - maxPageNumbersToShow >
                          minPageNumbersToShow) ||
                      (n === currentPage + maxPageNumbersToShow + 1 &&
                        currentPage + maxPageNumbersToShow <
                          npage - minPageNumbersToShow)
                    ) {
                      return (
                        <ul className="page-item-container" key={i}>
                          <li className="page-item" key={i}>
                            <div className="page-link">...</div>
                          </li>
                        </ul>
                      );
                    } else {
                      return null;
                    }
                  })}
                </li>

                <li className="page-item">
                  <div className="page-link" onClick={nextPage}>
                    {">"}
                  </div>
                </li>
              </ul>
            ) : (
              <></>
            )}

            <div className="pagination-count"></div>
          </div>
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default UserManager;