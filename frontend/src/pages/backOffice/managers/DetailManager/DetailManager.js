// import Swal from "sweetalert2";

import Swal from "sweetalert2";
import $ from "jquery";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useDownloadExcel } from "react-export-table-to-excel";

import * as signalR from "@microsoft/signalr";

import "./DetailManager.css";

//#region SVG'S Imports
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Agregar } from "../../../../assets/svgs/agregar.svg";
import { ReactComponent as Quitar } from "../../../../assets/svgs/quitar.svg";

import { ReactComponent as StockInput } from "../../../../assets/svgs/stockinput.svg";
import { ReactComponent as MotivoInput } from "../../../../assets/svgs/motivo.svg";
import { ReactComponent as OtroInput } from "../../../../assets/svgs/otro.svg";

import { ReactComponent as Excel } from "../../../../assets/svgs/excel.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetDetailsById,
  SaveStockDetail,
} from "../../../../services/DetailService";

import {
  GetProductById,
  UpdateProductsStock,
} from "../../../../services/ProductService";

import { formatDate } from "../../../../utils/DateFormat";

function DetailManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();

  const [details, setDetails] = useState([]);
  const [product, setProduct] = useState({});

  const [accion, setAccion] = useState("");

  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");

  const [otro, setOtro] = useState("");

  const [stock, setStock] = useState("");
  const [prevStock, setPrevStock] = useState("");

  const [unidadesQuitar, setUnidadesQuitar] = useState("");
  const [unidadesAgregar, setUnidadesAgregar] = useState("");

  const tableRef = useRef(null);

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `Detalles de stock de ${product.nombre}`,
    sheet: `Detalles de stock de ${product.nombre}`,
  });

  // Mantener el valor original del stock
  const [originalStock, setOriginalStock] = useState("");

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const rolUsuario = JSON.parse(atob(token.split(".")[1])).role;

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setDetailsPerPage] = useState(20);
  const lastIndex = currentPage * productsPerPage;
  const firstIndex = lastIndex - productsPerPage;
  const detailsTable = details.slice(firstIndex, lastIndex);
  const npage = Math.ceil(details.length / productsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [maxPageNumbersToShow, setMaxPageNumbersToShow] = useState(9);
  const minPageNumbersToShow = 0;
  //#endregion
  //#endregion

  //#region Funcion para obtener los detalles de stock del producto seleccionado
  async function fetchDetails() {
    try {
      const detailsData = await GetDetailsById(id, headers);
      const detailsArray = detailsData.stocks || []; // Si detailsData.stocks es null, usa un arreglo vacío
      setDetails(detailsArray);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  }
  //#endregion

  //#region Funcion para obtener el producto seleccionado
  async function fetchProduct() {
    try {
      const productData = await GetProductById(id, 3);
      setProduct(productData);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }
  //#endregion

  //#region UseEffect
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        await Promise.all([fetchProduct(), fetchDetails()]);
        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setDetailsPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setDetailsPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setDetailsPerPage(3);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setDetailsPerPage(4);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setDetailsPerPage(5);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setDetailsPerPage(6);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setDetailsPerPage(7);
      setMaxPageNumbersToShow(1);
    } else {
      setDetailsPerPage(10);
      setMaxPageNumbersToShow(9);
    }
  }, [id]);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://elzeide.somee.com/GeneralHub")
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        // console.log("Conexión establecida con el servidor SignalR");
      })
      .catch((err) => console.error(err.toString()));

    connection.on("MensajeCreateDetalleStock", async () => {
      try {
        fetchDetails();
        fetchProduct();
      } catch (error) {
        console.error("Error al obtener la cotización: " + error);
      }
    });

    connection.on("MensajeCrudProducto", async () => {
      try {
        fetchProduct();
      } catch (error) {
        console.error("Error al obtener el producto: " + error);
      }
    });

    connection.on("MensajeUpdateDeletePedido", async () => {
      try {
        fetchDetails();
        fetchProduct();
      } catch (error) {
        console.error("Error al obtener la cotización: " + error);
      }
    });

    connection.on("MensajeCreatePedido", async () => {
      try {
        fetchDetails();
        fetchProduct();
      } catch (error) {
        console.error("Error al obtener la cotización: " + error);
      }
    });

    return () => {
      connection.stop();
    };
  }, []);
  //#endregion

  //#region Función para actualizar el stock según la cantidad de unidades a quitar
  const handleUnidadesQuitarChange = (event) => {
    const unidades = event.target.value;

    // Verificar si el valor ingresado es un número válido y no contiene el carácter "-"
    if (!isNaN(unidades) && !unidades.includes("-")) {
      setUnidadesQuitar(unidades);
      setCantidad(unidades); // Actualizar cantidad también
      setAccion("Quitar");

      if (unidades > originalStock) {
        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          text: "No puedes quitar más unidades de las que hay en stock.",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f27474",
        }).then(setUnidadesQuitar(0), setStock(originalStock));
      } else if (unidades === "") {
        setStock(originalStock);
      } else {
        const nuevoStock = originalStock - parseInt(unidades);
        setStock(nuevoStock >= 0 ? nuevoStock : 0); // No permitir stock negativo
      }
    } else {
      // Mostrar SweetAlert indicando que no se puede ingresar el carácter "-"
      Swal.fire({
        icon: "error",
        title: "Carácter inválido",
        text: "No puedes ingresar números negativos en este campo.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
    }
  };
  //#endregion

  //#region Función para actualizar el stock según las unidades para agregar
  const handleUnidadesAgregarChange = (event) => {
    const unidades = event.target.value;

    // Verificar si el valor ingresado es un número válido y no negativo
    if (!isNaN(unidades) && unidades >= 0) {
      setUnidadesAgregar(unidades);
      setCantidad(unidades); // Actualizar cantidad también
      setAccion("Agregar");

      if (unidades === "") {
        setStock(originalStock);
      } else {
        const nuevoStock = originalStock + parseInt(unidades); // Usar el valor actual del estado del stock
        setStock(nuevoStock >= 0 ? nuevoStock : 0); // No permitir stock negativo
      }
    } else {
      // Mostrar SweetAlert indicando que no se pueden ingresar números negativos
      Swal.fire({
        icon: "error",
        title: "Número inválido",
        text: "No puedes ingresar números negativos en este campo.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      });
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

  //#region Función para limpiar todos los valores de los inputs del modal de stock
  function ClearProductStockInputs() {
    setCantidad("");
    setMotivo("");
    setOtro("");
    setStock("");
    setUnidadesQuitar("");
    setUnidadesAgregar("");
    setAccion("");
  }
  //#endregion

  //#region Función para obtener el valor almacenado de un detalle de stock de un producto y cargarlo en su input correspondiente
  function RetrieveProductInputs(product) {
    setStock(product.stockTransitorio);

    setPrevStock(product.stockTransitorio);
  }
  //#endregion

  //#region Función para cerrar el modal para quitar stock manualmente mediante el codigo
  function CloseModalQuitar() {
    $(document).ready(function () {
      $("#btn-close-modal-quitar").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal para agregar stock manualmente mediante el codigo
  function CloseModalAgregar() {
    $(document).ready(function () {
      $("#btn-close-modal-agregar").click();
    });
  }
  //#endregion

  //#region Función para verificar si el valor ingresado a traves del input Otro es correcto
  function IsValidOtro() {
    if (motivo === "Otro" && otro === "") {
      Swal.fire({
        icon: "error",
        title: "Debe especificar el motivo",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#otro1").focus();
          $("#otro").focus();
        }, 500);
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si se actualizo el valor de stock del input
  function IsUpdated() {
    if (prevStock !== stock) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para actualizar el stock de un producto ya existente y crear el detalle de stock
  async function UpdateProductStock(event) {
    event.preventDefault();

    if (!IsUpdated()) {
      Swal.fire({
        icon: "error",
        title: "No puede actualizar el stock del producto sin modificarlo",
        text: "Modifique el stock para poder actualizarlo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      }).then(function () {
        setTimeout(function () {
          $("#unidadesAgregar").focus();
          $("#unidadesQuitar").focus();
        }, 500);
      });
    } else if (
      (unidadesQuitar !== "" || unidadesAgregar !== "") &&
      IsValidOtro()
    ) {
      try {
        await Promise.all([
          UpdateProductsStock(id, { idProducto: id, stock: stock }, headers),

          SaveStockDetail(
            {
              accion: accion,
              cantidad: cantidad,
              motivo:
                (otro && otro.trim() !== ""
                  ? otro.trim()
                  : motivo && motivo.trim() !== ""
                  ? motivo.trim()
                  : "-"
                )
                  .charAt(0)
                  .toUpperCase() +
                (otro && otro.trim() !== ""
                  ? otro.trim()
                  : motivo && motivo.trim() !== ""
                  ? motivo.trim()
                  : "-"
                ).slice(1),
              idProducto: id,
            },
            headers
          ),
        ]);

        Swal.fire({
          icon: "success",
          title: "Stock del producto actualizado exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          if (accion === "Agregar") {
            Swal.fire({
              toast: true,
              position: "top-end",
              title: `+ ${cantidad}`,
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
              customClass: {
                popup: "swal2-toast",
                title: "swal2-toast-title",
                container: "swal2-toast-container",
              },
              background: "#6ede73",
              grow: "column",
            });
          } else {
            Swal.fire({
              toast: true,
              position: "top-end",
              title: `- ${cantidad}`,
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
              customClass: {
                popup: "swal2-toast",
                title: "swal2-toast-title",
                container: "swal2-toast-container",
              },
              background: "#de6e6e",
              grow: "column",
            });
          }
        });

        ClearProductStockInputs();
        CloseModalQuitar();
        CloseModalAgregar();
        fetchDetails();
        fetchProduct();
      } catch (error) {
        Swal.fire({
          title: error,
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
        <title>La Gran Feria | Gestionar Detalles de stock</title>
      </Helmet>

      <section className="general-container">
        <div className="general-content">
          <div className="general-title">
            <div className="title-header">
              <Link to="/gestionar-productos" className="btn btn-info btn-back">
                <div className="btn-back-content">
                  <Back className="back" />
                  <p className="p-back">Regresar</p>
                </div>
              </Link>

              <h2 className="title title-general">Detalles de stock</h2>
            </div>

            {isLoading === false &&
              (details.length > 1 || details.length === 0 ? (
                <p className="total">Hay {details.length} detalles.</p>
              ) : (
                <p className="total">Hay {details.length} detalle.</p>
              ))}
          </div>

          <br />

          {/* modal con el formulario para quitar stock de un producto */}
          <div
            className="modal fade"
            id="modalQuitar"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title quitar" id="exampleModalLabel">
                    Quitar unidades de stock
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <label className="label">
                          Cantidad de unidades para quitar:
                        </label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <Quitar className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            step="1"
                            min={0}
                            className="input"
                            id="unidadesQuitar"
                            value={unidadesQuitar}
                            onChange={handleUnidadesQuitarChange} // Actualizar el stock al cambiar las unidades
                          />
                        </div>

                        <label className="label">Stock modificado:</label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <StockInput className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            step="1"
                            min={0}
                            className="input"
                            id="stock"
                            value={stock}
                            onChange={(event) => {
                              setStock(event.target.value);
                            }}
                            readOnly
                          />
                        </div>

                        <label className="label selects" htmlFor="motivo">
                          Motivo:
                        </label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <MotivoInput className="input-group-svg" />
                          </span>
                          <select
                            className="input"
                            name="motivos"
                            id="motivo"
                            value={motivo}
                            onChange={(e) => {
                              setMotivo(e.target.value);
                            }}
                          >
                            <option hidden key={0} value="0">
                              Seleccione un motivo (Opcional)
                            </option>
                            <option value="Venta/Pedido">Venta/Pedido</option>
                            <option value="Devolucion">Devolucion</option>
                            <option value="Falla">Falla</option>
                            <option value="Pérdida">Pérdida</option>
                            <option value="Robo">Robo</option>
                            <option value="Traslado">Traslado</option>
                            <option value="Obsolescencia">Obsolescencia</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        {motivo === "Otro" && (
                          <>
                            <label className="label">Otro:</label>
                            <div className="form-group-input">
                              <span className="input-group-text">
                                <OtroInput className="input-group-svg" />
                              </span>
                              <input
                                type="text"
                                className="input"
                                id="otro"
                                value={otro}
                                onChange={(e) => {
                                  setOtro(e.target.value);
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div id="div-btn-update">
                        <button
                          className="btn btn-warning btn-edit-color"
                          id="btn-update"
                          onClick={UpdateProductStock}
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
                      if (IsUpdated() === false) {
                        CloseModalQuitar();
                        CloseModalAgregar();
                        ClearProductStockInputs();
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
                            CloseModalQuitar();
                            CloseModalAgregar();
                            ClearProductStockInputs();
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
                    id="btn-close-modal-quitar"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* modal con el formulario para agregar stock de un producto */}
          <div
            className="modal fade"
            id="modalAgregar"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title agregar" id="exampleModalLabel">
                    Agregar unidades de stock
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <label className="label">
                          Cantidad de unidades para agregar:
                        </label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <Agregar className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            step="1"
                            min={0}
                            className="input"
                            id="unidadesAgregar"
                            value={unidadesAgregar}
                            onChange={handleUnidadesAgregarChange} // Actualizar el stock al cambiar las unidades
                          />
                        </div>

                        <label className="label">Stock modificado:</label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <StockInput className="input-group-svg" />
                          </span>
                          <input
                            type="number"
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            step="1"
                            min={0}
                            className="input"
                            id="stock"
                            value={stock}
                            onChange={(event) => {
                              setStock(event.target.value);
                            }}
                            readOnly
                          />
                        </div>

                        <label className="label selects" htmlFor="motivo">
                          Motivo:
                        </label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <MotivoInput className="input-group-svg" />
                          </span>
                          <select
                            className="input"
                            name="motivos"
                            id="motivo"
                            value={motivo}
                            onChange={(e) => {
                              setMotivo(e.target.value);
                            }}
                          >
                            <option hidden key={0} value="0">
                              Seleccione un motivo (Opcional)
                            </option>
                            <option value="Compra">Compra</option>
                            <option value="Reabastecimiento">
                              Reabastecimiento
                            </option>
                            <option value="Traslado">Traslado</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        {motivo === "Otro" && (
                          <>
                            <label className="label">Otro:</label>
                            <div className="form-group-input">
                              <span className="input-group-text">
                                <OtroInput className="input-group-svg" />
                              </span>
                              <input
                                type="text"
                                className="input"
                                id="otro1"
                                value={otro}
                                onChange={(e) => {
                                  setOtro(e.target.value);
                                }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <div id="div-btn-update">
                        <button
                          className="btn btn-warning btn-edit-color"
                          id="btn-update"
                          onClick={UpdateProductStock}
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
                      if (IsUpdated() === false) {
                        CloseModalQuitar();
                        CloseModalAgregar();
                        ClearProductStockInputs();
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
                            CloseModalQuitar();
                            CloseModalAgregar();
                            ClearProductStockInputs();
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
                    id="btn-close-modal-agregar"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          <div className="filters-left2">
            <div className="info-container">
              <img
                src={
                  product.urlImagen ||
                  "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                }
                onClick={() =>
                  Swal.fire({
                    title: product.nombre,
                    imageUrl: `${
                      product.urlImagen ||
                      "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"
                    }`,
                    imageWidth: 400,
                    imageHeight: 400,
                    imageAlt: "Vista Producto",
                    confirmButtonColor: "#6c757d",
                    confirmButtonText: "Cerrar",
                    focusConfirm: true,
                  })
                }
                className="list-img-stock"
                alt="Producto"
              />
              <b className="bold">{product.nombre}</b>
            </div>

            <div className="pagination-count-filter">
              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <button
                  type="button"
                  className="btn btn-danger btn-delete5"
                  aria-label="Quitar"
                  data-bs-toggle="modal"
                  data-bs-target="#modalQuitar"
                  onClick={() => {
                    RetrieveProductInputs(product);
                    setOriginalStock(product.stockTransitorio);
                  }}
                >
                  <Quitar className="edit5" />
                </button>
              )}
              <div
                className={
                  product.stockTransitorio === 0
                    ? "btn btn-secondary btn-filters nocursor zero-stock"
                    : "btn btn-secondary btn-filters nocursor"
                }
              >
                <div
                  className="filter-btn-title-container-2 nocursor"
                  id="filter-btn-title-container"
                >
                  <p className="filter-btn">
                    <StockInput className="filter-svg2" />
                  </p>
                  <p className="filter-title2 stock-total">
                    STOCK: {product.stockTransitorio}
                  </p>
                </div>
              </div>
              {(rolUsuario === "Supervisor" || rolUsuario === "SuperAdmin") && (
                <button
                  type="button"
                  className="btn btn-success btn-add5"
                  aria-label="Agregar"
                  data-bs-toggle="modal"
                  data-bs-target="#modalAgregar"
                  onClick={() => {
                    RetrieveProductInputs(product);
                    setOriginalStock(product.stockTransitorio);
                  }}
                >
                  <Agregar className="edit5" />
                </button>
              )}
            </div>

            {details.length > 0 && (
              <div className="header-excel">
                <button
                  onClick={onDownload}
                  type="button"
                  className="btn btn-success btn-excel"
                >
                  <div className="btn-add-content">
                    <Excel className="excel" />
                    <p className="p-add">Descargar</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* tabla de detalles */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando detalles...</p>
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
                    Cantidad
                  </th>
                  <th className="table-title" scope="col">
                    Motivo
                  </th>
                  <th className="table-title" scope="col">
                    Registrado por
                  </th>
                  <th className="table-title" scope="col">
                    Fecha de registro
                  </th>
                </tr>
              </thead>

              {details && details.length > 0 ? (
                detailsTable.map(function fn(product, index) {
                  return (
                    <tbody key={index}>
                      <tr>
                        <th className="table-name" scope="row">
                          {index + 1}
                        </th>
                        <td
                          className={
                            product.accion === "Agregar"
                              ? "table-name agregar"
                              : "table-name quitar"
                          }
                        >
                          {product.accion === "Agregar" ? "+" : "-"}{" "}
                          {product.cantidad}
                        </td>

                        <td className="table-name">{product.motivo}</td>

                        <td className="table-name">{product.modificador}</td>

                        <td className="table-name">
                          {formatDate(product.fecha)}
                        </td>
                      </tr>
                    </tbody>
                  );
                })
              ) : (
                <tbody>
                  <tr className="tr-name1">
                    <td className="table-name table-name1" colSpan={5}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}

          {/* tabla de detalles para excel */}
          <table
            ref={tableRef}
            className="table table-dark table-list-none"
            align="center"
          >
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Motivo</th>
                <th scope="col">Registrado por</th>
                <th scope="col">Fecha de registro</th>
              </tr>
            </thead>

            {details && details.length > 0 ? (
              detailsTable.map(function fn(product, index) {
                return (
                  <tbody key={index}>
                    <tr>
                      <th scope="row">{index + 1}</th>
                      <td>
                        {product.accion === "Agregar" ? "+" : "-"}{" "}
                        {product.cantidad}
                      </td>

                      <td>{product.motivo}</td>

                      <td>{product.modificador}</td>

                      <td>{formatDate(product.fecha)}</td>
                    </tr>
                  </tbody>
                );
              })
            ) : (
              <tbody>
                <tr>
                  <td colSpan={5}>Sin registros</td>
                </tr>
              </tbody>
            )}
          </table>

          <div className="pagination-count-container2">
            <div className="pagination-count">
              {details.length > 0 ? (
                details.length === 1 ? (
                  <p className="total">
                    Producto {firstIndex + 1} de {details.length}
                  </p>
                ) : (
                  <p className="total">
                    Detalles {firstIndex + 1} a{" "}
                    {detailsTable.length + firstIndex} de {details.length}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>

            {details.length > 0 ? (
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

export default DetailManager;
