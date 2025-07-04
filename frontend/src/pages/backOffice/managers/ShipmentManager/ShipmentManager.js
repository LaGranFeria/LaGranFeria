import Swal from "sweetalert2";
import { ReactComponent as Filter } from "../../../../assets/svgs/filter.svg";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./ShipmentManager.css";

import { formatDate } from "../../../../utils/DateFormat";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Delete } from "../../../../assets/svgs/delete.svg";
import { ReactComponent as Add } from "../../../../assets/svgs/add.svg";
import { ReactComponent as Save } from "../../../../assets/svgs/save.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Upload } from "../../../../assets/svgs/upload.svg";

import { ReactComponent as ShipmentTypeInput } from "../../../../assets/svgs/shipment.svg";
import { ReactComponent as PriceInput } from "../../../../assets/svgs/priceinput.svg";
import { ReactComponent as AclaracionInput } from "../../../../assets/svgs/aclaracion.svg";
import { ReactComponent as ImageInput } from "../../../../assets/svgs/imageinput.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetFormasEntregaManage,
  SaveFormaEntrega,
  UpdateFormaEntrega,
  DeleteFormaEntrega,
} from "../../../../services/ShipmentService";

function ShipmentManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const [idEnvio, setIdEnvio] = useState("");

  const [nombre, setNombre] = useState("");
  const [prevNombre, setPrevNombre] = useState("");

  const [aclaracion, setAclaracion] = useState("");
  const [prevAclaracion, setPrevAclaracion] = useState("");

  const [costo, setCosto] = useState("");
  const [prevCosto, setPrevCosto] = useState("");

  const [habilitado, setHabilitado] = useState("");
  const [prevHabilitado, setPrevHabilitado] = useState("");

  const [disponibilidadCatalogo, setDisponibilidadCatalogo] = useState("");
  const [prevDisponibilidadCatalogo, setPrevDisponibilidadCatalogo] =
    useState("");

  const [urlImagen, setUrlImagen] = useState("");
  const [prevUrlImagen, setPrevUrlImagen] = useState("");

  const [modalTitle, setModalTitle] = useState("");

  const [shipmentTypes, setShipmentTypes] = useState([]);

  const [originalShipmentTypesList, setOriginalShipmentTypesList] =
    useState(shipmentTypes);

  const [title, setTitle] = useState(["Detalles de formas de entrega"]);

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");

  const [disabled, setDisabled] = useState(false);

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [shipmentTypesPerPage, setShipmentTypesPerPage] = useState(20);
  const lastIndex = currentPage * shipmentTypesPerPage;
  const firstIndex = lastIndex - shipmentTypesPerPage;
  const shipmentTypesTable = shipmentTypes.slice(firstIndex, lastIndex);
  const npage = Math.ceil(shipmentTypes.length / shipmentTypesPerPage);
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
        const result = await GetFormasEntregaManage();
        setShipmentTypes(result);
        setOriginalShipmentTypesList(result);
        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setShipmentTypesPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setShipmentTypesPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setShipmentTypesPerPage(3);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setShipmentTypesPerPage(4);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setShipmentTypesPerPage(5);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setShipmentTypesPerPage(6);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setShipmentTypesPerPage(7);
      setMaxPageNumbersToShow(1);
    } else {
      setShipmentTypesPerPage(10);
      setMaxPageNumbersToShow(9);
    }
  }, []);
  //#endregion

  // const handleCheckboxChangeCatalogo = (e) => {
  //   const value = e.target.value;
  //   const isChecked = e.target.checked;

  //   setDisponibilidadCatalogo((prevState) => {
  //     // Si el checkbox se selecciona y es "Entrega por local"
  //     if (value === "1" && isChecked) {
  //       return prevState.includes("2") ? ["1", "2"] : ["1"];
  //     }
  //     // Si el checkbox se selecciona y es "Entrega a domicilio"
  //     if (value === "2" && isChecked) {
  //       return prevState.includes("1") ? ["1", "2"] : ["2"];
  //     }
  //     // Si ambos checkboxes están seleccionados
  //     if (isChecked && prevState.includes("1") && prevState.includes("2")) {
  //       return ["1", "2"];
  //     }
  //     // Si el checkbox se deselecciona
  //     return prevState.filter((item) => item !== value);
  //   });
  // };

  //#region Función para borrar cualquier filtro
  const ClearFilter = () => {
    setShipmentTypes(originalShipmentTypesList); // trae la lista de formas de entrega original, sin ningun filtro
    setFilterName("");
    setFilterType("");
    setTitle("Detalles de formas de entrega");
    document.getElementById("clear-filter").style.display = "none";
    document.getElementById("clear-filter2").style.display = "none"; // esconde del DOM el boton de limpiar filtros
    setCurrentPage(1);
    if (disabled === true) {
      setDisabled(false);
    }
    window.scrollTo(0, 0);
  };
  //#endregion

  //#region Función para filtrar por deshabilitadas
  const filterResultDisabled = (disabled) => {
    if (disabled === false) {
      setShipmentTypes(originalShipmentTypesList);
      const result = originalShipmentTypesList.filter(
        (originalShipmentTypesList) => {
          return originalShipmentTypesList.habilitado === false;
        }
      );
      setTitle("Detalles de formas de entrega deshabilitadas");
      setShipmentTypes(result);
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName("Deshabilitada");
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
  function ClearShipmentTypeInputs() {
    setIdEnvio("");

    setNombre("");
    setAclaracion("");
    setCosto("");
    setHabilitado("");
    setDisponibilidadCatalogo("");
    setUrlImagen("");
  }
  //#endregion

  //#region Función para obtener los valores almacenados de una forma de entrega y cargar cada uno de ellos en su input correspondiente
  function RetrieveShipmentTypeInputs(shipmentType) {
    setIdEnvio(shipmentType.idEnvio);
    setNombre(shipmentType.nombre);
    setAclaracion(shipmentType.aclaracion);
    setCosto(shipmentType.costo);
    setHabilitado(shipmentType.habilitado);
    setUrlImagen(shipmentType.urlImagen);

    const disponibilidadCatalogoValue = shipmentType.disponibilidadCatalogo;
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

    setPrevNombre(shipmentType.nombre);
    setPrevAclaracion(shipmentType.aclaracion);
    setPrevCosto(shipmentType.costo);
    setPrevHabilitado(shipmentType.habilitado);
    setPrevUrlImagen(shipmentType.urlImagen);
  }
  //#endregion

  //#region Función para volver el formulario a su estado inicial, borrando los valores de los inputs, cargando los selects y refrezcando la lista de formas de entrega
  async function InitialState() {
    ClearShipmentTypeInputs();
    const result = await GetFormasEntregaManage();
    setShipmentTypes(result);
    setOriginalShipmentTypesList(result);
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
      if (modalTitle === "Registrar Forma de entrega") {
        ShowSaveButton();
      }
      return false;
    } else if (costo === "") {
      Swal.fire({
        icon: "error",
        title:
          "El costo de la forma de entrega no puede estar vacío. Si no tiene costo ingrese 0",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#costo").focus();
        }, 500);
      });
      if (modalTitle === "Registrar Forma de entrega") {
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
      if (modalTitle === "Registrar Forma de entrega") {
        ShowSaveButton();
      }
      return false;
    } 
    // else if (
    //   disponibilidadCatalogo === "" ||
    //   (Array.isArray(disponibilidadCatalogo) &&
    //     disponibilidadCatalogo.length === 0)
    // ) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Debe indicar en que catálogo se encuentra disponible",
    //     text: "Clickeé en el/los botón/es de los catálogos donde se encuentre disponible",
    //     confirmButtonText: "Aceptar",
    //     confirmButtonColor: "#f27474",
    //   });
    //   if (modalTitle === "Registrar Forma de entrega") {
    //     ShowSaveButton();
    //   }
    //   return false;
    // }
    return true;
  }
  //#endregion

  //#region Función para verificar si el valor "nombre" ingresado a traves del input no esta repetido
  function IsRepeated() {
    for (let i = 0; i < shipmentTypes.length; i++) {
      if (
        nombre.toLowerCase() === shipmentTypes[i].nombre.toLowerCase() &&
        aclaracion.toLowerCase() ===
          shipmentTypes[i].aclaracion.toLowerCase() &&
        (nombre !== prevNombre || aclaracion !== prevAclaracion)
      ) {
        Swal.fire({
          icon: "error",
          title:
            "El nombre y aclaración ingresados ya se encuentran registrados",
          text: "Modifique los campos",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        }).then(function () {
          setTimeout(function () {
            $("#nombre").focus();
          }, 500);
        });

        if (modalTitle === "Registrar Forma de entrega") {
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
    } else if (urlImagen !== "") {
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
      prevAclaracion !== aclaracion ||
      prevCosto !== costo ||
      prevHabilitado !== habilitado ||
      !arraysEqual(prevDisponibilidadCatalogo, disponibilidadCatalogo) ||
      prevUrlImagen !== urlImagen
    ) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para insertar una forma de entrega
  async function SaveShipmentType(event) {
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
        await SaveFormaEntrega(
          {
            habilitado: habilitado,
            costo: costo,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            disponibilidadCatalogo: 2,
            aclaracion: `${
              (aclaracion ?? "").charAt(0).toUpperCase() +
              (aclaracion ?? "").slice(1)
            }`,
            urlImagen: urlImagen,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Forma de entrega registrada exitosamente!",
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

  //#region Función para actualizar una forma de entrega ya existente
  async function UpdateShipmentType(event) {
    event.preventDefault();

    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title:
          "No puede actualizar la forma de entrega sin modificar ningun campo",
        text: "Modifique al menos un campo para poder actualizarla",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (
      IsValid() === true &&
      IsUpdated() === true &&
      IsRepeated() === false
    ) {
      try {
        await UpdateFormaEntrega(
          shipmentTypes.find((u) => u.idEnvio === idEnvio).idEnvio || idEnvio,
          {
            idEnvio: idEnvio,
            habilitado: habilitado,
            costo: costo,
            nombre: `${nombre.charAt(0).toUpperCase() + nombre.slice(1)}`,
            disponibilidadCatalogo:
              disponibilidadCatalogo.length === 0
                ? ""
                : disponibilidadCatalogo.length === 1
                ? disponibilidadCatalogo.includes("1")
                  ? 1
                  : 2
                : 3,
            aclaracion: `${
              (aclaracion ?? "").charAt(0).toUpperCase() +
              (aclaracion ?? "").slice(1)
            }`,
            urlImagen: urlImagen,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Forma de entrega actualizada exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        CloseModal();

        // InitialState();
        ClearShipmentTypeInputs();
        const result = await GetFormasEntregaManage();
        setShipmentTypes(result);

        setShipmentTypes((prevShipmentTypes) => {
          setOriginalShipmentTypesList(prevShipmentTypes);

          if (filterType === "disabled") {
            const result = prevShipmentTypes.filter((shipmentType) => {
              return shipmentType.habilitado === false;
            });
            setTitle("Detalles de formas de entrega deshabilitadas");
            setShipmentTypes(result);
            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setFilterName("Deshabilitada");
            setFilterType("disabled");
            setCurrentPage(1);
          }
          if (filterType === "other") {
            setShipmentTypes(prevShipmentTypes);
          } else {
            return prevShipmentTypes;
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

  //#region Función para eliminar una forma de entrega existente
  async function DeleteShipmentType(id) {
    try {
      let resultado = await DeleteFormaEntrega(id, headers);

      if (resultado.data.statusCode === 400) {
        Swal.fire({
          icon: "error",
          title:
            "No puede eliminar esta forma de entrega ya que la misma se encuentra seleccionada dentro de uno o mas pedidos",
          text: "Primero debera eliminar el/los pedidos que contienen la forma de entrega que desea eliminar o cambiarle/s su forma de entrega",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Forma de entrega eliminada exitosamente!",
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
        <title>La Gran Feria | Gestionar Formas de entrega</title>
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
                    ClearShipmentTypeInputs();
                    setModalTitle("Registrar Forma de entrega");
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
              (shipmentTypes.length > 1 || shipmentTypes.length === 0 ? (
                <p className="total">
                  Hay {shipmentTypes.length} formas de entrega.
                </p>
              ) : (
                <p className="total">
                  Hay {shipmentTypes.length} forma de entrega.
                </p>
              ))}
          </div>

          {/* modal con el formulario para registrar/actualizar una forma de entrega */}
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
                          id="idEnvio"
                          hidden
                          value={idEnvio}
                          onChange={(event) => {
                            setIdEnvio(event.target.value);
                          }}
                        />

                        <label className="label">Nombre:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <ShipmentTypeInput className="input-group-svg" />
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

                        <label className="label">Aclaración:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <AclaracionInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            id="aclaracion"
                            value={aclaracion}
                            onChange={(event) => {
                              setAclaracion(event.target.value);
                            }}
                          />
                        </div>

                        <label className="label">Costo:</label>
                        <div className="form-group-input">
                          <span className="input-group-text">
                            <PriceInput className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            className="input"
                            id="costo"
                            value={costo}
                            onChange={(event) => {
                              setCosto(event.target.value);
                            }}
                          />
                        </div>
                      </div>

                      <div className="form-group ocultar2">
                        <label className="label">Habilitada</label>
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

                      {/* <div className="form-group">
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
                              Catálogo Minorista
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
                              Catálogo Mayorista
                            </label>
                          </div>
                        </div>
                      </div> */}

                      <div className="form-group">
                        <label id="urlImagenLabel" className="label">
                          URL Imagen:
                        </label>
                        <div
                          id="urlImagen"
                          className="form-group-input-upload-image"
                        >
                          <span className="input-group-text">
                            <ImageInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input-uploadimage"
                            id="urlImagenInput"
                            value={urlImagen}
                            onChange={(event) => {
                              setUrlImagen(event.target.value);
                            }}
                          />
                          <a
                            href="https://yourfiles.cloud/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Upload className="upload-btn" />
                          </a>
                        </div>
                      </div>

                      <div>
                        {modalTitle === "Registrar Forma de entrega" ? (
                          <div id="div-btn-save">
                            <button
                              className="btn btn-success btnadd"
                              id="btn-save"
                              onClick={SaveShipmentType}
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
                              onClick={UpdateShipmentType}
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
                      if (modalTitle === "Registrar Forma de entrega") {
                        if (IsEmpty() === true) {
                          ClearShipmentTypeInputs();
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
                              ClearShipmentTypeInputs();
                              CloseModal();
                            }
                          });
                        }
                      } else if (modalTitle === "Actualizar Forma de entrega") {
                        if (IsUpdated() === false) {
                          ClearShipmentTypeInputs();
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
                              ClearShipmentTypeInputs();
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
                      <p className="filter-btn-name">DESHABILITADA</p>
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

          {(shipmentTypes.length > 0 ||
            (shipmentTypes.length === 0 && disabled === true)) && (
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

          {/* tabla de formas de entrega */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando formas de entrega...</p>
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
                    Aclaración
                  </th>
                  <th className="table-title" scope="col">
                    Costo
                  </th>
                  <th className="table-title" scope="col">
                    Habilitada
                  </th>
                  {/* <th className="table-title" scope="col">
                    Disponibilidad Catálogo
                  </th> */}
                  <th className="table-title" scope="col">
                    Imagen
                  </th>
                  <th className="table-title" scope="col">
                    Modificado por
                  </th>
                  <th className="table-title" scope="col">
                    Fecha de modificación
                  </th>
                  <th className="table-title" scope="col">
                    Acciones
                  </th>
                </tr>
              </thead>

              {shipmentTypes.length > 0 ? (
                shipmentTypesTable.map(function fn(shipmentType, index) {
                  return (
                    <tbody key={1 + shipmentType.idEnvio}>
                      <tr>
                        <th scope="row" className="table-name">
                          {index + 1}
                        </th>
                        <td
                          className={`table-name ${
                            shipmentType.nombre.includes("domicilio")
                              ? "domicilio"
                              : shipmentType.nombre.includes("local")
                              ? "retiro-local"
                              : "domicilio"
                          }`}
                        >
                          {shipmentType.nombre}
                        </td>
                        <td
                          className={`table-name ${
                            shipmentType.nombre.includes("domicilio")
                              ? "domicilio"
                              : shipmentType.nombre.includes("local")
                              ? "retiro-local"
                              : "domicilio"
                          }`}
                        >
                          {shipmentType.aclaracion || "-"}
                        </td>
                        <td
                          className={`table-name ${
                            shipmentType.nombre.includes("domicilio")
                              ? "domicilio"
                              : shipmentType.nombre.includes("local")
                              ? "retiro-local"
                              : "domicilio"
                          }`}
                        >
                          ${shipmentType.costo}
                        </td>

                        {shipmentType.habilitado ? (
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

                        {/* <td className="table-name">
                          {shipmentType.disponibilidadCatalogo === 1
                            ? "Catálogo minorista"
                            : shipmentType.disponibilidadCatalogo === 2
                            ? "Catálogo mayorista"
                            : "Catálogo minorista y mayorista"}
                        </td> */}
                        <td className="table-name">
                          {shipmentType.urlImagen ? (
                            <img
                              src={shipmentType.urlImagen}
                              onClick={() =>
                                Swal.fire({
                                  title: shipmentType.nombre,
                                  text: shipmentType.aclaracion
                                    ? `(${shipmentType.aclaracion})`
                                    : "",
                                  imageUrl: shipmentType.urlImagen,
                                  imageWidth: 400,
                                  imageHeight: 400,
                                  imageAlt: "Vista forma de entrega",
                                  confirmButtonColor: "#6c757d",
                                  confirmButtonText: "Cerrar",
                                  focusConfirm: true,
                                })
                              }
                              className="list-img"
                              alt="Categoría"
                            />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td className="table-name">
                          {shipmentType.ultimoModificador}
                        </td>
                        <td className="table-name">
                          {formatDate(shipmentType.fechaModificacion)}
                        </td>
                        <td className="table-name">
                          <button
                            type="button"
                            className="btn btn-warning btn-edit"
                            aria-label="Modificar"
                            data-bs-toggle="modal"
                            data-bs-target="#modal"
                            onClick={() => {
                              RetrieveShipmentTypeInputs(shipmentType);
                              setModalTitle("Actualizar Forma de entrega");
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
                                  "Esta seguro de que desea eliminar la siguiente forma de entrega: " +
                                  shipmentType.nombre +
                                  "?",
                                text: "Una vez eliminada, no se podra recuperar",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#F8BB86",
                                cancelButtonColor: "#6c757d",
                                confirmButtonText: "Aceptar",
                                cancelButtonText: "Cancelar",
                                focusCancel: true,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  DeleteShipmentType(shipmentType.idEnvio);
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
              {shipmentTypes.length > 0 ? (
                shipmentTypes.length === 1 ? (
                  <p className="total">
                    Forma de entrega {firstIndex + 1} de {shipmentTypes.length}
                  </p>
                ) : (
                  <p className="total">
                    Formas de entrega {firstIndex + 1} a{" "}
                    {shipmentTypesTable.length + firstIndex} de{" "}
                    {shipmentTypes.length}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>

            {shipmentTypes.length > 0 ? (
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

export default ShipmentManager;
