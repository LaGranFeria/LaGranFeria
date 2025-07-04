import Swal from "sweetalert2";
import $ from "jquery";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import "./DollarManager.css";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Info } from "../../../../assets/svgs/info.svg";

import { ReactComponent as PriceInput } from "../../../../assets/svgs/priceinput.svg";

import { ReactComponent as BuyInput } from "../../../../assets/svgs/buy.svg";
import { ReactComponent as AvgInput } from "../../../../assets/svgs/avg.svg";
import { ReactComponent as SellInput } from "../../../../assets/svgs/sell.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetCotizacionDolar,
  UpdateCotizacionDolar,
  GetCotizacionFechaDolarBlue,
} from "../../../../services/DollarService";

import { formatDate } from "../../../../utils/DateFormat";

function DollarManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const [idDolar, setIdDolar] = useState("");
  const [precio, setPrecio] = useState("");
  const [prevPrecio, setPrevPrecio] = useState("");

  const [cotizacionDolar, setCotizacionDolar] = useState([]);

  const [cotizacionDolarBlue, setCotizacionDolarBlue] = useState([]);
  const [fechaDolarBlue, setFechaDolarBlue] = useState([]);

  const token = localStorage.getItem("token"); // Obtener el token del localStorage

  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };
  //#endregion

  //#region UseEffect
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        await Promise.all([GetCotizacionDolar(setCotizacionDolar)]);
        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();
  }, []);
  //#endregion

  //#region Función para limpiar el valor del input del formulario
  function ClearCotizacionDolarInputs() {
    setIdDolar("");

    setPrecio("");
  }
  //#endregion

  //#region Función para obtener los valores almacenados de la cotización del dolar blue y cargarlos en sus inputs correspondientes
  async function RetrieveDolarBlue() {
    const result = await GetCotizacionFechaDolarBlue();

    setCotizacionDolarBlue(result.blue);
    setFechaDolarBlue(result.last_update);
  }
  //#endregion

  //#region Función para obtener los valores almacenados de la cotización del dolar y cargarlos en sus inputs correspondientes
  function RetrieveCotizacionInputs(cotizacion) {
    setIdDolar(cotizacion.idCotizacion);
    setPrecio(cotizacion.precio);

    setPrevPrecio(cotizacion.precio);
  }
  //#endregion

  //#region Función para cerrar el modal manualmente mediante el codigo
  function CloseModal() {
    $(document).ready(function () {
      $("#btn-close-modal").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal de las cotizaciones del dolar blue manualmenente mediante el codigo
  function CloseModalDolarBlue() {
    $(document).ready(function () {
      $("#btn-close-modal2").click();
    });
  }
  //#endregion

  //#region Función para verificar si el valor ingresado a traves del input es correcto
  function IsValid() {
    if (precio === "") {
      Swal.fire({
        icon: "error",
        title: "La cotización del dolar no puede estar vacía",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#precio").focus();
        }, 500);
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si se actualizo el valor del input (cotización del dolar)
  function IsUpdated() {
    if (prevPrecio !== precio) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para actualizar la cotización del dolar ya existente
  async function UpdateCotizacionDolarFunction(event) {
    event.preventDefault();

    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title:
          "No puede actualizar la cotización del dolar sin modificar la misma",
        text: "Modifique la cotización para poder actualizarla",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (IsValid() === true && IsUpdated() === true) {
      try {
        await UpdateCotizacionDolar(
          {
            idDolar: idDolar,
            precio: precio,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Cotización de dolar actualizada exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });
        CloseModal();
        await GetCotizacionDolar(setCotizacionDolar);

        ClearCotizacionDolarInputs();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "No puede actualizar la cotización del dolar con caracteres",
          text: "Ingrese un valor númerico",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#F27474",
        });
      }
    }
  }
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Gestionar Cotización del Dolar</title>
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

              <h2 className="title title-general">
                Detalle de Cotización del Dolar
              </h2>

              <div
                className="btn btn-info btn-blue"
                data-bs-toggle="modal"
                data-bs-target="#modale"
                onClick={() => {
                  RetrieveDolarBlue();
                }}
              >
                <div className="btn-back-content">
                  <Info className="blue" />
                </div>
              </div>
            </div>
          </div>

          {/* modal con el formulario para actualizar la cotización del dolar */}
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
                    Actualizar Cotización del dolar
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <input
                          type="text"
                          className="input"
                          id="idDolar"
                          hidden
                          value={idDolar}
                          onChange={(event) => {
                            setIdDolar(event.target.value);
                          }}
                        />

                        <label className="label">Cotización del dolar:</label>
                        <div className="form-group-input">
                          <span className="input-group-text">
                            <PriceInput className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            step="1"
                            min={0}
                            className="input"
                            id="precio"
                            value={precio}
                            onChange={(event) => {
                              setPrecio(event.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div id="div-btn-update">
                          <button
                            className="btn btn-warning btn-edit-color"
                            id="btn-update"
                            onClick={UpdateCotizacionDolarFunction}
                          >
                            <div className="btn-save-update-close">
                              <Update className="update-btn" />
                              <p className="p-save-update-close">Actualizar</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      if (IsUpdated() === false) {
                        ClearCotizacionDolarInputs();
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
                            ClearCotizacionDolarInputs();
                            CloseModal();
                          }
                        });
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

          <div
            className="modal fade"
            id="modale"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="dolar-title">
                    <h1 className="modal-title" id="exampleModalLabel">
                      Cotización Dolar Blue
                    </h1>
                    <p className="fecha-valor-p">
                      <span className="fecha-p">Fecha: </span>
                      {formatDate(fechaDolarBlue)}{" "}
                    </p>
                  </div>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <label className="label">Compra:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <BuyInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            id="compra"
                            value={
                              cotizacionDolarBlue?.value_buy
                                ? `$${cotizacionDolarBlue.value_buy}`
                                : "Cargando..."
                            }
                            readOnly
                          />
                        </div>

                        <label className="label">Promedio:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <AvgInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            id="promedio"
                            value={
                              cotizacionDolarBlue?.value_avg
                                ? `$${cotizacionDolarBlue.value_avg}`
                                : "Cargando..."
                            }
                            readOnly
                          />
                        </div>

                        <label className="label">Venta:</label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <SellInput className="input-group-svg" />
                          </span>
                          <input
                            type="text"
                            className="input"
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            id="venta"
                            value={
                              cotizacionDolarBlue?.value_sell
                                ? `$${cotizacionDolarBlue.value_sell}`
                                : "Cargando..."
                            }
                            readOnly
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      // ClearCotizacionDolarInputs();
                      CloseModalDolarBlue();
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
                    id="btn-close-modal2"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <br />

          {/* tabla con la cotización del dolar */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando cotización del dolar...</p>
            </div>
          ) : (
            <table
              className="table table-dark table-bordered table-hover table-list"
              align="center"
            >
              <thead>
                <tr className="table-header">
                  <th className="table-title" scope="col">
                    Cotización del dolar
                  </th>
                  <th className="table-title" scope="col">
                    Modificado por
                  </th>
                  <th className="table-title" scope="col">
                    Fecha de modificación
                  </th>
                  <th className="table-title" scope="col">
                    Acción
                  </th>
                </tr>
              </thead>

              {cotizacionDolar ? (
                <tbody key={1 + cotizacionDolar.idCotizacion}>
                  <tr>
                    <td className="table-name table-cotizacion">
                      {cotizacionDolar && cotizacionDolar.precio !== undefined
                        ? `$${cotizacionDolar.precio.toLocaleString()}`
                        : ""}
                    </td>

                    <td className="table-name table-cotizacion">
                      {cotizacionDolar.ultimoModificador}
                    </td>

                    <td className="table-name table-cotizacion">
                      {formatDate(cotizacionDolar.fechaModificacion)}
                    </td>

                    <td className="table-name">
                      <button
                        type="button"
                        className="btn btn-warning btn-edit"
                        aria-label="Modificar"
                        data-bs-toggle="modal"
                        data-bs-target="#modal"
                        onClick={() => {
                          RetrieveCotizacionInputs(cotizacionDolar);
                        }}
                      >
                        <Edit className="edit" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr className="tr-name1">
                    <td className="table-name table-name1" colSpan={4}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default DollarManager;
