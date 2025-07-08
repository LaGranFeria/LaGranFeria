import Swal from "sweetalert2";
import { ReactComponent as Filter } from "../../../../assets/svgs/filter.svg";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./PaymentTypeManager.css";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Delete } from "../../../../assets/svgs/delete.svg";
import { ReactComponent as Add } from "../../../../assets/svgs/add.svg";
import { ReactComponent as Save } from "../../../../assets/svgs/save.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";

import { ReactComponent as PaymentTypeInput } from "../../../../assets/svgs/paymentInput.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetPaymentTypes,
  SavePaymentTypes,
  UpdatePaymentTypes,
  DeletePaymentTypes,
} from "../../../../services/PaymentTypeService";

function PaymentTypeManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const [idMetodoPago, setIdMetodoPago] = useState("");

  const [nombre, setNombre] = useState("");
  const [prevNombre, setPrevNombre] = useState("");

  const [habilitado, setHabilitado] = useState("");
  const [prevHabilitado, setPrevHabilitado] = useState("");

  const [disponibilidadCatalogo, setDisponibilidadCatalogo] = useState("");
  const [prevDisponibilidadCatalogo, setPrevDisponibilidadCatalogo] =
    useState("");

  const [disponibilidad, setDisponibilidad] = useState("");
  const [prevDisponibilidad, setPrevDisponibilidad] = useState("");

  const [modalTitle, setModalTitle] = useState("");

  const [paymentTypes, setPaymentTypes] = useState([]);

  const [originalPaymentTypesList, setOriginalPaymentTypesList] =
    useState(paymentTypes);

  const [title, setTitle] = useState(["Detalles de Medios de pago"]);

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");

  const [disabled, setDisabled] = useState(false);

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentTypesPerPage, setPaymentTypesPerPage] = useState(20);
  const lastIndex = currentPage * paymentTypesPerPage;
  const firstIndex = lastIndex - paymentTypesPerPage;
  const paymentTypesTable = paymentTypes.slice(firstIndex, lastIndex);
  const npage = Math.ceil(paymentTypes.length / paymentTypesPerPage);
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
        const result = await GetPaymentTypes();
        setPaymentTypes(result);
        setOriginalPaymentTypesList(result);
        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setPaymentTypesPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setPaymentTypesPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setPaymentTypesPerPage(3);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setPaymentTypesPerPage(4);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setPaymentTypesPerPage(5);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setPaymentTypesPerPage(6);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setPaymentTypesPerPage(7);
      setMaxPageNumbersToShow(1);
    } else {
      setPaymentTypesPerPage(10);
      setMaxPageNumbersToShow(9);
    }
  }, []);
  //#endregion

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setDisponibilidad((prevState) => {
      // Si el checkbox se selecciona y es "Entrega por local"
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

  const handleCheckboxChangeCatalogo = (e) => {
    const value = e.target.value;
    const isChecked = e.target.checked;

    setDisponibilidadCatalogo((prevState) => {
      // Si el checkbox se selecciona y es "Entrega por local"
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

  //#region Función para borrar cualquier filtro
  const ClearFilter = () => {
    setPaymentTypes(originalPaymentTypesList); // trae la lista de medios de pago original, sin ningun filtro
    setFilterName("");
    setFilterType("");
    setTitle("Detalles de Medios de pago");
    document.getElementById("clear-filter").style.display = "none";
    document.getElementById("clear-filter2").style.display = "none"; // esconde del DOM el boton de limpiar filtros
    setCurrentPage(1);
    if (disabled === true) {
      setDisabled(false);
    }
    window.scrollTo(0, 0);
  };
  //#endregion

  //#region Función para filtrar por deshabilitados
  const filterResultDisabled = (disabled) => {
    if (disabled === false) {
      setPaymentTypes(originalPaymentTypesList);
      const result = originalPaymentTypesList.filter(
        (originalPaymentTypesList) => {
          return originalPaymentTypesList.habilitado === false;
        }
      );
      setTitle("Detalles de Medios de pago deshabilitados");
      setPaymentTypes(result);
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName("Deshabilitado");
      setFilterType("disabled");
      setCurrentPage(1);
      window.scrollTo(0, 0);
    } else {
      ClearFilter();
    }
  };
  //#endregion

  //#region Funciónes para la paginacion
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
  function ClearPaymentTypeInputs() {
    setIdMetodoPago("");

    setNombre("");
    setHabilitado("");
    setDisponibilidadCatalogo("");
    setDisponibilidad("");
  }
  //#endregion

  //#region Función para obtener los valores almacenados de un medio de pago y cargar cada uno de ellos en su input correspondiente
  function RetrievePaymentTypeInputs(paymentType) {
    setIdMetodoPago(paymentType.idMetodoPago);
    setNombre(paymentType.nombre);
    setHabilitado(paymentType.habilitado);

    const disponibilidadCatalogoValue = paymentType.disponibilidadCatalogo;
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

    const disponibilidadValue = paymentType.disponibilidad;
    if (disponibilidadValue === 1) {
      setDisponibilidad(["1"]);
      setPrevDisponibilidad(["1"]);
    } else if (disponibilidadValue === 2) {
      setDisponibilidad(["2"]);
      setPrevDisponibilidad(["2"]);
    } else if (disponibilidadValue === 3) {
      setDisponibilidad(["1", "2"]);
      setPrevDisponibilidad(["1", "2"]);
    }
    setPrevNombre(paymentType.nombre);
    setPrevHabilitado(paymentType.habilitado);
  }
  //#endregion

  //#region Función para volver el formulario a su estado inicial, borrando los valores de los inputs, cargando los selects y refrezcando la lista de medios de pago
  async function InitialState() {
    ClearPaymentTypeInputs();
    const result = await GetPaymentTypes();
    setPaymentTypes(result);
    setOriginalPaymentTypesList(result);
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

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos
  function IsValid() {
    if (nombre === "") {
      Swal.fire({
        icon: "error",
        title: "El nombre no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#nombre").focus();
        }, 500);
      });
      if (modalTitle === "Registrar Medio de pago") {
        ShowSaveButton();
      }
      return false;
    } else if (habilitado === "") {
      Swal.fire({
        icon: "error",
        title: "Debe indicar si se encuentra oculto",
        text: "Clickeé el botón en caso de que la misma se encuentre oculto",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      if (modalTitle === "Registrar Medio de pago") {
        ShowSaveButton();
      }
      return false;
    } 
    else if (
      disponibilidadCatalogo === "" ||
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
      if (modalTitle === "Registrar Medio de pago") {
        ShowSaveButton();
      }
      return false;
    } 
    else if (
      disponibilidad === "" ||
      (Array.isArray(disponibilidad) && disponibilidad.length === 0)
    ) {
      Swal.fire({
        icon: "error",
        title: "Debe indicar con que tipo de envio se encuentra disponible",
        text: "Clickeé en el/los botón/es de los tipos de envio donde se encuentre disponible",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
      if (modalTitle === "Registrar Medio de pago") {
        ShowSaveButton();
      }
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si el valor "nombre" ingresado a traves del input no esta repetido
  function IsRepeated() {
    for (let i = 0; i < paymentTypes.length; i++) {
      if (
        nombre.toLowerCase() === paymentTypes[i].nombre.toLowerCase() &&
        nombre !== prevNombre
      ) {
        Swal.fire({
          icon: "error",
          title: "El nombre ingresado ya se encuentra registrado",
          text: "Modifique el campo",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        }).then(function () {
          setTimeout(function () {
            $("#nombre").focus();
          }, 500);
        });

        if (modalTitle === "Registrar Medio de pago") {
          ShowSaveButton();
        }

        return true;
      }
    }
    return false;
  }
  //#endregion

  //#region Función para verificar si los valores de los inputs estan vacios
  function IsEmpty() {
    if (nombre !== "") {
      return false;
    } else if (habilitado !== false) {
      return false;
    } else if (disponibilidadCatalogo !== "") {
      return false;
    } else if (disponibilidad !== "") {
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si se actualizo al menos un valor de los inputs
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

  function IsUpdated() {
    if (
      prevNombre.toLowerCase() !== nombre.toLocaleLowerCase() ||
      prevHabilitado !== habilitado ||
      !arraysEqual(prevDisponibilidadCatalogo, disponibilidadCatalogo) ||
      !arraysEqual(prevDisponibilidad, disponibilidad)
    ) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para insertar un medio de pago
  async function SavePaymentType(event) {
    event.preventDefault();

    const btnSave = document.getElementById("btn-save");
    const divBtnSave = document.getElementById("div-btn-save");
    btnSave.style.pointerEvents = "none";
    btnSave.style.opacity = "0.5";
    divBtnSave.style.cursor = "wait";

    const isValid = IsValid();
    const isRepeated = IsRepeated();

    if (isValid && !isRepeated) {
      try {
        await SavePaymentTypes(
          {
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            habilitado: habilitado,
            disponibilidad:
              disponibilidad.length === 0
                ? ""
                : disponibilidad.length === 1
                ? disponibilidad.includes("1")
                  ? 1
                  : 2
                : 3,
            disponibilidadCatalogo:
              disponibilidadCatalogo.length === 0
                ? ""
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
          title: "Medio de pago registrado exitosamente!",
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

  //#region Función para actualizar un medio de pago ya existente
  async function UpdatePaymentType(event) {
    event.preventDefault();

    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title:
          "No puede actualizar el medio de pago sin modificar ningun campo",
        text: "Modifique al menos un campo para poder actualizarlo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (
      IsValid() === true &&
      IsUpdated() === true &&
      IsRepeated() === false
    ) {
      try {
        await UpdatePaymentTypes(
          paymentTypes.find((u) => u.idMetodoPago === idMetodoPago)
            .idMetodoPago || idMetodoPago,
          {
            idMetodoPago: idMetodoPago,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            habilitado: habilitado,
            disponibilidad:
              disponibilidad.length === 0
                ? ""
                : disponibilidad.length === 1
                ? disponibilidad.includes("1")
                  ? 1
                  : 2
                : 3,
            disponibilidadCatalogo:
              disponibilidadCatalogo.length === 0
                ? ""
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
          title: "Medio de pago actualizado exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        CloseModal();

        // InitialState();
        ClearPaymentTypeInputs();
        const result = await GetPaymentTypes();
        setPaymentTypes(result);

        setPaymentTypes((prevPaymentTypes) => {
          setOriginalPaymentTypesList(prevPaymentTypes);

          if (filterType === "disabled") {
            const result = prevPaymentTypes.filter((paymentType) => {
              return paymentType.habilitado === false;
            });
            setTitle("Detalles de Medios de pago deshabilitados");
            setPaymentTypes(result);
            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setFilterName("Deshabilitado");
            setFilterType("disabled");
            setCurrentPage(1);
          }
          if (filterType === "other") {
            setPaymentTypes(prevPaymentTypes);
          } else {
            return prevPaymentTypes;
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

  //#region Función para eliminar un medio de pago existente
  async function DeletePaymentType(id) {
    try {
      let resultado = await DeletePaymentTypes(id, headers);

      if (resultado.data.statusCode === 400) {
        Swal.fire({
          icon: "error",
          title:
            "No puede eliminar este medio de pago ya que el mismo se encuentra seleccionado dentro de uno o mas pedidos",
          text: "Primero debera eliminar el/los pedidos que contienen el medio de pago que desea eliminar o cambiarle/s su medio de pago",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Medio de pago eliminado exitosamente!",
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
        <title>La Gran Feria | Gestionar Medios de pago</title>
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
                    ClearPaymentTypeInputs();
                    setModalTitle("Registrar Medio de pago");
                    setTimeout(function () {
                      $("#nombre").focus();
                    }, 500);
                    setHabilitado(true);
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
              (paymentTypes.length > 1 || paymentTypes.length === 0 ? (
                <p className="total">
                  Hay {paymentTypes.length} medios de pago.
                </p>
              ) : (
                <p className="total">
                  Hay {paymentTypes.length} medio de pago.
                </p>
              ))}
          </div>

          {/* modal con el formulario para registrar/actualizar un medio de pago */}
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
                  <div className="container">
                    <form>
                      <div className="form-group">
                        <input
                          type="text"
                          className="input"
                          id="idMetodoPago"
                          hidden
                          value={idMetodoPago}
                          onChange={(event) => {
                            setIdMetodoPago(event.target.value);
                          }}
                        />

                        <label className="label">Nombre:</label>
                        <div className="form-group-input">
                          <span className="input-group-text">
                            <PaymentTypeInput className="input-group-svg" />
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
                      </div>

                      <div className="form-group ocultar2">
                        <label className="label">Habilitado</label>
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="habilitado"
                          checked={habilitado}
                          onChange={(e) => {
                            setHabilitado(e.target.checked);
                          }}
                        />
                        <label
                          htmlFor="habilitado"
                          className="lbl-switch"
                        ></label>
                      </div>

                      <div className="form-group">
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
                            <label htmlFor="catalogoMinorista">
                              LGF
                            </label>
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
                            <label htmlFor="catalogoMayorista">
                              Zeide
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label
                          className="label selects"
                          htmlFor="disponibilidad"
                        >
                          Disponibilidad Entrega:
                        </label>

                        <div className="checkbox-group">
                          <div className="checkbox-cont">
                            <input
                              className="checkbox-input"
                              type="checkbox"
                              id="entregaLocal"
                              name="disponibilidad"
                              value="1"
                              checked={disponibilidad.includes("1")}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="entregaLocal">
                              Entrega por local
                            </label>
                          </div>

                          <div className="checkbox-cont">
                            <input
                              className="checkbox-input"
                              type="checkbox"
                              id="entregaDomicilio"
                              name="disponibilidad"
                              value="2"
                              checked={disponibilidad.includes("2")}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="entregaDomicilio">
                              Entrega a domicilio
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        {modalTitle === "Registrar Medio de pago" ? (
                          <div id="div-btn-save">
                            <button
                              className="btn btn-success btnadd"
                              id="btn-save"
                              onClick={SavePaymentType}
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
                              onClick={UpdatePaymentType}
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
                      if (modalTitle === "Registrar Medio de pago") {
                        if (IsEmpty() === true) {
                          ClearPaymentTypeInputs();
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
                              ClearPaymentTypeInputs();
                              CloseModal();
                            }
                          });
                        }
                      } else if (modalTitle === "Actualizar Medio de pago") {
                        if (IsUpdated() === false) {
                          ClearPaymentTypeInputs();
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
                              ClearPaymentTypeInputs();
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
                    Filtro
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

                    <div className="filter-btn-container">
                      <p className="filter-btn-name">DESHABILITADO</p>
                      <p className="filter-btn">
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="disabled"
                          checked={disabled}
                          onChange={() => {
                            setDisabled(!disabled);
                            filterResultDisabled(disabled);
                          }}
                        />
                        <label
                          htmlFor="disabled"
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

          {(paymentTypes.length > 0 ||
            (paymentTypes.length === 0 && disabled === true)) && (
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
                    <p className="filter-title2">Filtro</p>
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

          {/* tabla de medios de pago */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando medios de pago...</p>
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
                    Nombre
                  </th>
                  <th className="table-title" scope="col">
                    Habilitado
                  </th>
                  <th className="table-title" scope="col">
                    Disponibilidad Catálogo
                  </th>
                  <th className="table-title" scope="col">
                    Disponibilidad Entrega
                  </th>
                  <th className="table-title" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>

              {paymentTypes.length > 0 ? (
                paymentTypesTable.map(function fn(paymentType, index) {
                  return (
                    <tbody key={1 + paymentType.idMetodoPago}>
                      <tr>
                        <th scope="row" className="table-name">
                          {index + 1}
                        </th>
                        <td
                          className={`table-name ${
                            paymentType.nombre === "Mercado Pago"
                              ? "mercado-pago"
                              : "table-name"
                          }`}
                        >
                          {paymentType.nombre}
                        </td>

                        {paymentType.habilitado ? (
                          <td className="table-name">
                            <div className="status-btns">
                              <div className="circulo-verificado"></div>
                              <p className="status-name">Si</p>
                            </div>
                          </td>
                        ) : (
                          <td className="table-name">
                            <div className="status-btns">
                              <div className="circulo-pendiente"></div>
                              <p className="status-name">No</p>
                            </div>
                          </td>
                        )}

                        <td className="table-name">
                          {paymentType.disponibilidadCatalogo === 1
                            ? "LGF"
                            : paymentType.disponibilidadCatalogo === 2
                            ? "Zeide"
                            : "LGF y Zeide"}
                        </td>

                        <td className="table-name">
                          {paymentType.disponibilidad === 1
                            ? "Entrega por local"
                            : paymentType.disponibilidad === 2
                            ? "Entrega a domicilio"
                            : "Entrega por local y a domicilio"}
                        </td>

                        <td className="table-name">
                          <button
                            type="button"
                            className="btn btn-warning btn-edit"
                            aria-label="Modificar"
                            data-bs-toggle="modal"
                            data-bs-target="#modal"
                            onClick={() => {
                              RetrievePaymentTypeInputs(paymentType);
                              setModalTitle("Actualizar Medio de pago");
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
                                title:
                                  "Esta seguro de que desea eliminar el siguiente medio de pago: " +
                                  paymentType.nombre +
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
                                  DeletePaymentType(paymentType.idMetodoPago);
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
              {paymentTypes.length > 0 ? (
                paymentTypes.length === 1 ? (
                  <p className="total">
                    Medio de pago {firstIndex + 1} de {paymentTypes.length}
                  </p>
                ) : (
                  <p className="total">
                    Medios de pago {firstIndex + 1} a{" "}
                    {paymentTypesTable.length + firstIndex} de{" "}
                    {paymentTypes.length}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>

            {paymentTypes.length > 0 ? (
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

export default PaymentTypeManager;
