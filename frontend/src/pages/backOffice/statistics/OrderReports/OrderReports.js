import Swal from "sweetalert2";
import { useDownloadExcel } from "react-export-table-to-excel";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import $ from "jquery";
import * as signalR from "@microsoft/signalr";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { CountUp } from "countup.js";

import "./OrderReports.css";

//#region SVG'S Imports
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Excel } from "../../../../assets/svgs/excel.svg";
import { ReactComponent as ShowOrders } from "../../../../assets/svgs/showOrders.svg";
import { ReactComponent as ShowFilters } from "../../../../assets/svgs/filter.svg";
import { ReactComponent as Cancel } from "../../../../assets/svgs/pendiente.svg";
import { ReactComponent as Podio } from "../../../../assets/svgs/podio.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as VendedorInput } from "../../../../assets/svgs/seller.svg";
import { ReactComponent as EntregaInput } from "../../../../assets/svgs/entregainput.svg";
import { ReactComponent as AbonoInput } from "../../../../assets/svgs/paymentInput.svg";
import { ReactComponent as TipoInput } from "../../../../assets/svgs/typepriceinput.svg";
import { ReactComponent as Pdf } from "../../../../assets/svgs/pdf.svg";
import { ReactComponent as Lupa } from "../../../../assets/svgs/lupa.svg";
import { ReactComponent as ShowBilling } from "../../../../assets/svgs/billing.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import { GetVerifiedOrdersByDate } from "../../../../services/OrderService";
import { GetUsersByRole } from "../../../../services/UserService";
import { GetPaymentTypes } from "../../../../services/PaymentTypeService";
import { GetFormasEntregaManage } from "../../../../services/ShipmentService";
import { formatDate } from "../../../../utils/DateFormat";

function OrderReports() {
  //#region Constantes
  const [showBilling, setShowBilling] = useState(false);

  //#region Constantes de vendedores
  const [vendedorMasPedidos, setVendedorMasPedidos] = useState("-");
  const [cantidadVendedorMasPedidos, setCantidadVendedorMasPedidos] =
    useState("-");

  const [segundoVendedorMasPedidos, setSegundoVendedorMasPedidos] =
    useState("-");
  const [
    cantidadSegundoVendedorMasPedidos,
    setCantidadSegundoVendedorMasPedidos,
  ] = useState("-");

  const [tercerVendedorMasPedidos, setTercerVendedorMasPedidos] = useState("-");
  const [
    cantidadTercerVendedorMasPedidos,
    setCantidadTercerVendedorMasPedidos,
  ] = useState("-");
  //#endregion

  //#region Constantes de productos
  const [urlProductoMasVendido, setUrlProductoMasVendido] = useState("");
  const [productoMasVendido, setProductoMasVendido] = useState("-");
  const [cantidadProductoMasVendido, setCantidadProductoMasVendido] =
    useState("-");

  const [urlSegundoProductoMasVendido, setUrlSegundoProductoMasVendido] =
    useState("");
  const [segundoProductoMasVendido, setSegundoProductoMasVendido] =
    useState("-");
  const [
    cantidadSegundoProductoMasVendido,
    setCantidadSegundoProductoMasVendido,
  ] = useState("-");

  const [urlTercerProductoMasVendido, setUrlTercerProductoMasVendido] =
    useState("");
  const [tercerProductoMasVendido, setTercerProductoMasVendido] = useState("-");
  const [
    cantidadTercerProductoMasVendido,
    setCantidadTercerProductoMasVendido,
  ] = useState("-");
  //#endregion

  //#region Constantes de categorías
  const [categoriaMasDemandada, setCategoriaMasDemandada] = useState("-");
  const [cantidadCategoriaMasDemandada, setCantidadCategoriaMasDemandada] =
    useState("-");

  const [segundaCategoriaMasDemandada, setSegundaCategoriaMasDemandada] =
    useState("-");
  const [
    cantidadSegundaCategoriaMasDemandada,
    setCantidadSegundaCategoriaMasDemandada,
  ] = useState("-");

  const [terceraCategoriaMasDemandada, setTerceraCategoriaMasDemandada] =
    useState("-");
  const [
    cantidadTerceraCategoriaMasDemandada,
    setCantidadTerceraCategoriaMasDemandada,
  ] = useState("-");
  //#endregion

  const [isLoading, setIsLoading] = useState(false);

  const [cantidadPedidos, setCantidadPedidos] = useState(0);
  const [cantidadProductos, setCantidadProductos] = useState(0);
  const [montoTotal, setMontoTotal] = useState(0);
  const [promedioMontoTotal, setPromedioMontoTotal] = useState(0);
  const [cantidadClientes, setCantidadClientes] = useState(0);

  //#region Constantes de filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [desdeSeleccionado, setDesdeSeleccionado] = useState("");
  const [hastaSeleccionado, setHastaSeleccionado] = useState("");

  const [selectedVendedor, setSelectedVendedor] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedEntrega, setSelectedEntrega] = useState("");
  const [selectedAbono, setSelectedAbono] = useState("");

  const [nombreSelectedVendedor, setNombreSelectedVendedor] = useState("");
  const [nombreSelectedTipo, setNombreSelectedTipo] = useState("");
  const [nombreSelectedEntrega, setNombreSelectedEntrega] = useState("");
  const [nombreSelectedAbono, setNombreSelectedAbono] = useState("");

  const [filtroVendedorSeleccionado, setFiltroVendedorSeleccionado] =
    useState("");
  const [filtroTipoSeleccionado, setFiltroTipoSeleccionado] = useState("");
  const [filtroEntregaSeleccionado, setFiltroEntregaSeleccionado] =
    useState("");
  const [filtroAbonoSeleccionado, setFiltroAbonoSeleccionado] = useState("");

  const [isLoadingVendedores, setIsLoadingVendedores] = useState(true);
  const [isLoadingAbonosEntregas, setIsLoadingAbonosEntregas] = useState(true);
  //#endregion

  const [listaVendedores, setListaVendedores] = useState({});
  const [listaAbonos, setListaAbonos] = useState({});
  const [listaEntregas, setListaEntregas] = useState({});

  const [orders, setOrders] = useState([]);

  const [showOrders, setShowOrders] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [title, setTitle] = useState("Reportes de Pedidos");

  const tableRef1 = useRef(null);
  const tableRef2 = useRef(null);

  const { onDownload: onDownload1 } = useDownloadExcel({
    currentTableRef: tableRef1.current,
    filename: `${title}`,
    sheet: `${title}`,
  });

  const { onDownload: onDownload2 } = useDownloadExcel({
    currentTableRef: tableRef2.current,
    filename: `${"Detalles de " + title}`,
    sheet: `${"Detalles de " + title}`,
  });

  //#region Constantes de la paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(20);
  const lastIndex = currentPage * ordersPerPage;
  const firstIndex = lastIndex - ordersPerPage;
  const ordersTable = orders.slice(firstIndex, lastIndex);
  const npage = Math.ceil(orders.length / ordersPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [maxPageNumbersToShow, setMaxPageNumbersToShow] = useState(9);
  const minPageNumbersToShow = 0;
  //#endregion
  //#endregion

  //#region Función para formatear la fecha
  const formatDate3 = (dateString) => {
    // Parsea la cadena en una fecha teniendo en cuenta la zona horaria UTC
    const fecha = new Date(Date.parse(dateString));

    // Obtiene los componentes de la fecha y hora
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1; // Suma 1 porque los meses en JavaScript van de 0 a 11
    const anio = fecha.getUTCFullYear();

    // Formatea los componentes de la fecha y hora con ceros a la izquierda
    const formattedDia = dia.toString().padStart(2, "0");
    const formattedMes = mes.toString().padStart(2, "0");

    // Formatea la fecha en el formato deseado
    return `${formattedDia}/${formattedMes}/${anio}`;
  };
  //#endregion

  //#region UseEffect
  useEffect(() => {
    const fetchVendedoresData = async () => {
      try {
        const responseVendedores = await GetUsersByRole("Vendedor");
        setListaVendedores(responseVendedores);
        setIsLoadingVendedores(false);

        const responseAbonos = await GetPaymentTypes();
        setListaAbonos(responseAbonos);

        const response = await GetFormasEntregaManage();
        setListaEntregas(response);

        setIsLoadingAbonosEntregas(false);
      } catch (error) {
        console.error("Hubo un error al obtener los vendedores:", error);
        setIsLoadingVendedores(false);
        setIsLoadingAbonosEntregas(false);
      }
    };

    fetchVendedoresData();

    if (window.matchMedia("(max-width: 500px)").matches) {
      setOrdersPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 600px)").matches) {
      setOrdersPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 700px)").matches) {
      setOrdersPerPage(1);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 800px)").matches) {
      setOrdersPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 900px)").matches) {
      setOrdersPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1000px)").matches) {
      setOrdersPerPage(2);
      setMaxPageNumbersToShow(1);
    } else if (window.matchMedia("(max-width: 1140px)").matches) {
      setOrdersPerPage(4);
      setMaxPageNumbersToShow(1);
    } else {
      setOrdersPerPage(4);
      setMaxPageNumbersToShow(9);
    }
  }, []);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://elzeide.somee.com/generalHub")
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => {
        // console.log("Conexión establecida con el servidor SignalR");
      })
      .catch((err) => console.error(err.toString()));

    connection.on("MensajeCrudVendedor", async () => {
      setIsLoadingVendedores(true);
      try {
        const responseVendedores = await GetUsersByRole("Vendedor");
        setListaVendedores(responseVendedores);
        setIsLoadingVendedores(false);
      } catch (error) {
        console.error("Error al obtener los vendedores: " + error);
      }
    });

    connection.on("MensajeCrudMetodoPago", async () => {
      setIsLoadingAbonosEntregas(true);
      try {
        const responseAbonos = await GetPaymentTypes();
        setListaAbonos(responseAbonos);

        const response = await GetFormasEntregaManage();
        setListaEntregas(response);

        setIsLoadingAbonosEntregas(false);
      } catch (error) {
        console.error("Error al obtener los medios de pago: " + error);
      }
    });

    return () => {
      connection.stop();
    };
  }, []);
  //#endregion

  //#region Función para cerrar el modal de vendedores manualmente mediante el codigo
  function CloseModalVendedores() {
    $(document).ready(function () {
      $("#btn-close-modal-vendedores").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal de productos manualmente mediante el codigo
  function CloseModalProductos() {
    $(document).ready(function () {
      $("#btn-close-modal-productos").click();
    });
  }
  //#endregion

  //#region Función para cerrar el modal de categrías manualmente mediante el codigo
  function CloseModalCategorias() {
    $(document).ready(function () {
      $("#btn-close-modal-categorias").click();
    });
  }
  //#endregion

  //#region Función para descargar gráficos en PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const generalReports = document.getElementById("pdf");

    const maxWidth = 1040;
    const isMaxWidth = window.innerWidth <= maxWidth;

    html2canvas(generalReports).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const width = isMaxWidth ? 140 : 190; // Ajusta la anchura según el ancho de la ventana
      const height = isMaxWidth ? 190 : 135; // Ajusta la altura según el ancho de la ventana

      doc.addImage(imgData, "PNG", 10, 10, width, height);
      doc.save("Reportes.pdf");
    });
  };
  //#endregion

  //#region Función para buscar pedidos con los filtros
  const search = async () => {
    setDesdeSeleccionado(desde);
    setHastaSeleccionado(hasta);

    if (desde === "" && hasta === "") {
      Swal.fire({
        icon: "warning",
        title: "Fechas no seleccionadas",
        text: "Seleccione una fecha de inicio y una fecha de fin para realizar la consulta.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f8bb86",
      });
    } else if (
      desde === desdeSeleccionado &&
      hasta === hastaSeleccionado &&
      filtroVendedorSeleccionado === nombreSelectedVendedor &&
      filtroTipoSeleccionado === nombreSelectedTipo &&
      filtroEntregaSeleccionado === nombreSelectedEntrega &&
      filtroAbonoSeleccionado === nombreSelectedAbono
    ) {
      Swal.fire({
        icon: "warning",
        title: "Parámetros de búsqueda sin cambios",
        text: "Las fechas 'desde' y 'hasta', así como los parámetros opcionales (vendedor, tipo de pedido, tipo de entrega y forma de abono) no han cambiado con respecto a la consulta anterior. Intente con diferentes parámetros.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else {
      setIsLoading(true);

      // Formatear las fechas al formato deseado
      const formattedFromDate = desde + " 00:00:00 +00:00";
      const formattedToDate = hasta + " 23:59:59 +00:00";

      try {
        const response = await GetVerifiedOrdersByDate(
          formattedFromDate,
          formattedToDate,
          selectedVendedor,
          selectedTipo,
          selectedEntrega,
          selectedAbono
        );

        if (selectedVendedor !== "") {
          setFiltroVendedorSeleccionado(nombreSelectedVendedor);
        } else {
          setFiltroVendedorSeleccionado("");
        }

        if (selectedTipo !== "") {
          setFiltroTipoSeleccionado(nombreSelectedTipo);
        } else {
          setFiltroTipoSeleccionado("");
        }

        if (selectedEntrega !== "") {
          setFiltroEntregaSeleccionado(nombreSelectedEntrega);
        } else {
          setFiltroEntregaSeleccionado("");
        }

        if (selectedAbono !== "") {
          setFiltroAbonoSeleccionado(nombreSelectedAbono);
        } else {
          setFiltroAbonoSeleccionado("");
        }

        const respondeOrders = response.pedidos || [];
        setOrders(respondeOrders);
        setIsLoading(false);

        // console.log(response);

        if (
          response.errorMessage ===
          "No hay pedidos verificados entre esas fechas"
        ) {
          setIsLoading(false);

          // Mostrar SweetAlert si no hay órdenes
          Swal.fire({
            icon: "warning",
            title: "No hay reportes de pedidos",
            text: `No se encontraron reportes de pedidos ${
              desde === hasta
                ? `de la fecha ${formatDate3(desde)}.`
                : `comprendidos entre las fechas ${formatDate3(
                    desde
                  )} y ${formatDate3(hasta)}.`
            }`,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f8bb86",
          });

          setCantidadPedidos(0);
          setCantidadProductos(0);
          setMontoTotal(0);
          setPromedioMontoTotal(0);
          setCantidadClientes(0);

          setTitle("Reportes de Pedidos");
          setShowOrders(false);
          setShowFilters(true);
        }

        const cantidadPedidos = response.cantidadPedidos;
        const cantidadProductos = response.cantidadProductos;
        const montoTotal = response.montoTotalFacturado;
        const promedioMontoTotal = response.promedioMontoTotalFacturado;
        const cantidadClientes = response.cantidadClientes;

        //#region Obtener los primeros 3 vendedores con más ventas
        setVendedorMasPedidos(response.primerVendedorMasVentas);
        setCantidadVendedorMasPedidos(response.cantidadVentasPrimerVendedor);

        setSegundoVendedorMasPedidos(response.segundoVendedorMasVentas);
        setCantidadSegundoVendedorMasPedidos(
          response.cantidadVentasSegundoVendedor
        );

        setTercerVendedorMasPedidos(response.tercerVendedorMasVentas);
        setCantidadTercerVendedorMasPedidos(
          response.cantidadVentasTercerVendedor
        );
        //#endregion

        //#region Obtener los primeros 3 productos más vendidos
        setUrlProductoMasVendido(response.urlPrimerProductoMasVendido);
        setProductoMasVendido(response.primerProductoMasVendido);
        setCantidadProductoMasVendido(response.cantidadPrimerProductoVendidos);

        setUrlSegundoProductoMasVendido(response.urlSegundoProductoMasVendido);
        setSegundoProductoMasVendido(response.segundoProductoMasVendido);
        setCantidadSegundoProductoMasVendido(
          response.cantidadSegundoProductoVendidos
        );

        setUrlTercerProductoMasVendido(response.urlTercerProductoMasVendido);
        setTercerProductoMasVendido(response.tercerProductoMasVendido);
        setCantidadTercerProductoMasVendido(
          response.cantidadTercerProductoVendidos
        );
        //#endregion

        //#region Obtener las primeras 3 categorías más demandadas
        setCategoriaMasDemandada(response.primerCategoriaMasAparecida);
        setCantidadCategoriaMasDemandada(
          response.cantidadPrimerCategoriaMasAparecida
        );

        setSegundaCategoriaMasDemandada(response.segundaCategoriaMasAparecida);
        setCantidadSegundaCategoriaMasDemandada(
          response.cantidadSegundaCategoriaMasAparecida
        );

        setTerceraCategoriaMasDemandada(response.terceraCategoriaMasAparecida);
        setCantidadTerceraCategoriaMasDemandada(
          response.cantidadTerceraCategoriaMasAparecida
        );
        //#endregion

        setCantidadPedidos(cantidadPedidos);
        setCantidadProductos(cantidadProductos);
        setMontoTotal(montoTotal);
        setPromedioMontoTotal(promedioMontoTotal);
        setCantidadClientes(cantidadClientes);

        if (response.isSuccess === true) {
          setTitle(
            `Reportes de Pedidos ${
              desde === "" && hasta === ""
                ? ""
                : desde === hasta
                ? `de: ${formatDate3(desde)}`
                : `desde: ${formatDate3(desde)} hasta: ${formatDate3(hasta)}`
            }`
          );
        }

        setCurrentPage(1);
        window.scrollTo(0, 0);

        const countUpOptions = {
          separator: ".",
          prefix: "$", // Prefijo (por ejemplo, '$')
        };

        const cantidadPedidosNumero = new CountUp(
          "cantidadPedidosNumero",
          cantidadPedidos
        );
        const cantidadProductosNumero = new CountUp(
          "cantidadProductosNumero",
          cantidadProductos
        );
        const montoTotalNumero = new CountUp(
          "montoTotalNumero",
          montoTotal,
          countUpOptions
        );
        const promedioMontoTotalNumero = new CountUp(
          "promedioMontoTotalNumero",
          promedioMontoTotal,
          countUpOptions
        );
        const cantidadClientesNumero = new CountUp(
          "cantidadClientesNumero",
          cantidadClientes
        );

        if (
          !cantidadPedidosNumero.error ||
          !cantidadProductosNumero.error ||
          !montoTotalNumero.error ||
          !promedioMontoTotalNumero.error ||
          !cantidadClientesNumero.error
        ) {
          cantidadPedidosNumero.start();
          cantidadProductosNumero.start();
          montoTotalNumero.start();
          promedioMontoTotalNumero.start();
          cantidadClientesNumero.start();
        } else {
          console.error(cantidadPedidosNumero.error);
          console.error(cantidadProductosNumero.error);
          console.error(montoTotalNumero.error);
          console.error(promedioMontoTotalNumero.error);
          console.error(cantidadClientesNumero.error);
        }

        if (desde === "") {
          setTitle(
            `Reportes de Pedidos ${
              desde === "" && hasta === ""
                ? ""
                : desde === hasta
                ? `de: ${formatDate3(desde)}`
                : `desde: ${formatDate3(desde)} hasta: ${formatDate3(hasta)}`
            }`
          );
        }
      } catch {
        setIsLoading(false); // Establecer isLoading como false después de la petición
        Swal.fire({
          icon: "warning",
          title: "Error al obtener los datos de los reportes",
          text: `No se pudieron cargar los reportes.`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f8bb86",
        });
      }
    }
  };
  //#endregion

  //#region Función para limpiar los filtros
  const clearFilters = () => {
    setSelectedVendedor("");
    setSelectedTipo("");
    setSelectedEntrega("");
    setSelectedAbono("");
    setDesde("");
    setHasta("");

    setDesdeSeleccionado("");
    setHastaSeleccionado("");

    setOrders([]);

    setCantidadPedidos(0);
    setCantidadProductos(0);
    setMontoTotal(0);
    setPromedioMontoTotal(0);
    setCantidadClientes(0);

    const countUpOptions = {
      separator: ".",
      prefix: "$", // Prefijo (por ejemplo, '$')
    };

    const cantidadPedidosNumero = new CountUp("cantidadPedidosNumero", 0);
    const cantidadProductosNumero = new CountUp("cantidadProductosNumero", 0);
    const montoTotalNumero = new CountUp("montoTotalNumero", 0, countUpOptions);
    const promedioMontoTotalNumero = new CountUp(
      "promedioMontoTotalNumero",
      0,
      countUpOptions
    );
    const cantidadClientesNumero = new CountUp("cantidadClientesNumero", 0);

    if (
      !cantidadPedidosNumero.error ||
      !cantidadProductosNumero.error ||
      !montoTotalNumero.error ||
      !promedioMontoTotalNumero.error ||
      !cantidadClientesNumero.error
    ) {
      cantidadPedidosNumero.start();
      cantidadProductosNumero.start();
      montoTotalNumero.start();
      promedioMontoTotalNumero.start();
      cantidadClientesNumero.start();
    } else {
      console.error(cantidadPedidosNumero.error);
      console.error(cantidadProductosNumero.error);
      console.error(montoTotalNumero.error);
      console.error(promedioMontoTotalNumero.error);
      console.error(cantidadClientesNumero.error);
    }

    setCategoriaMasDemandada("-");
    setProductoMasVendido("-");
    setUrlProductoMasVendido("");
    setVendedorMasPedidos("-");

    setTitle("Reportes de Pedidos");
    setShowOrders(false);
    setShowFilters(true);
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

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Reportes de Pedidos</title>
      </Helmet>

      {isLoading === true && (
        <div className="loading-reports-div">
          <Loader />
          <p className="bold-loading">Cargando reportes...</p>
        </div>
      )}

      <section className="general-container">
        <div className="general-content">
          <div className="general-title">
            <div className="title-header">
              <Link
                to="/estadisticas-pedidos"
                className="btn btn-info btn-back"
              >
                <div className="btn-back-content">
                  <Back className="back" />
                  <p className="p-back">Regresar</p>
                </div>
              </Link>

              <h2 className="title title-general">{title}</h2>

              <button
                type="button"
                className={`btn btn-dark btn-show-billing ${
                  !showBilling ? "btn-highlight" : ""
                }`}
                title={showBilling ? "Ocultar montos" : "Ver montos"}
                onClick={() => {
                  setShowBilling(!showBilling);
                }}
              >
                <ShowBilling
                  className={`show-orders ${
                    !showBilling ? "show-orders-seleccionado" : ""
                  }`}
                />
              </button>
            </div>

            {desde !== "" &&
              hasta !== "" &&
              (orders.length !== 1 ? (
                <p className="total">Hay {orders.length} pedidos.</p>
              ) : (
                <p className="total">Hay {orders.length} pedido.</p>
              ))}
          </div>

          {orders.length > 0 && (
            <div className="header-excel-report">
              <button
                type="button"
                className="btn btn-dark btn-show-orders"
                title={showFilters ? "Ocultar filtros" : "Ver filtros"}
                onClick={() => {
                  setShowFilters(!showFilters);
                }}
              >
                <ShowFilters className="show-orders" />
              </button>

              <button
                onClick={exportToPDF}
                type="button"
                className="btn btn-danger btn-show-orders"
                title="Descargar reportes"
              >
                <div className="show-orders">
                  <Pdf />
                </div>
              </button>

              <button
                onClick={onDownload1}
                type="button"
                className="btn btn-success btn-excel"
                title="Descargar reportes"
              >
                <div className="btn-add-content">
                  <Excel className="excel" />
                  <p className="p-add">Descargar</p>
                </div>
              </button>

              <button
                type="button"
                className="btn btn-info btn-show-orders"
                title={showOrders ? "Ocultar pedidos" : "Ver pedidos"}
                onClick={() => {
                  setShowOrders(!showOrders);
                }}
              >
                <ShowOrders className="show-orders" />
              </button>

              <button
                onClick={onDownload2}
                type="button"
                className="btn btn-success btn-show-orders"
                title="Descargar detalles"
              >
                <div className="show-orders">
                  <Excel />
                </div>
              </button>
            </div>
          )}

          <div className="tags-container">
            {(selectedVendedor || filtroVendedorSeleccionado) && (
              <div
                className={`tag ${
                  (filtroVendedorSeleccionado !== "" &&
                    filtroVendedorSeleccionado === nombreSelectedVendedor) ||
                  selectedVendedor === ""
                    ? "filtro-activo"
                    : ""
                }`}
                title={`Filtro ${
                  (filtroVendedorSeleccionado !== "" &&
                    filtroVendedorSeleccionado === nombreSelectedVendedor) ||
                  selectedVendedor === ""
                    ? "aplicado"
                    : "sin aplicar"
                }`}
              >
                <VendedorInput className="close-svg2" />
                {filtroVendedorSeleccionado && !nombreSelectedVendedor
                  ? filtroVendedorSeleccionado
                  : nombreSelectedVendedor}
              </div>
            )}

            {(selectedTipo || filtroTipoSeleccionado) && (
              <div
                className={`tag ${
                  (filtroTipoSeleccionado !== "" &&
                    filtroTipoSeleccionado === nombreSelectedTipo) ||
                  selectedTipo === ""
                    ? "filtro-activo"
                    : ""
                }`}
                title={`Filtro ${
                  (filtroVendedorSeleccionado !== "" &&
                    filtroVendedorSeleccionado === nombreSelectedVendedor) ||
                  selectedVendedor === ""
                    ? "aplicado"
                    : "sin aplicar"
                }`}
              >
                <TipoInput className="close-svg2" />
                {filtroTipoSeleccionado && !nombreSelectedTipo
                  ? filtroTipoSeleccionado
                  : nombreSelectedTipo}
              </div>
            )}

            {(selectedEntrega || filtroEntregaSeleccionado) && (
              <div
                className={`tag ${
                  (filtroEntregaSeleccionado !== "" &&
                    filtroEntregaSeleccionado === nombreSelectedEntrega) ||
                  selectedEntrega === ""
                    ? "filtro-activo"
                    : ""
                }`}
                title={`Filtro ${
                  (filtroVendedorSeleccionado !== "" &&
                    filtroVendedorSeleccionado === nombreSelectedVendedor) ||
                  selectedVendedor === ""
                    ? "aplicado"
                    : "sin aplicar"
                }`}
              >
                <EntregaInput className="close-svg2" />
                {filtroEntregaSeleccionado && !nombreSelectedEntrega
                  ? filtroEntregaSeleccionado
                  : nombreSelectedEntrega}
              </div>
            )}

            {(selectedAbono || filtroAbonoSeleccionado) && (
              <div
                className={`tag ${
                  (filtroAbonoSeleccionado !== "" &&
                    filtroAbonoSeleccionado === nombreSelectedAbono) ||
                  selectedAbono === ""
                    ? "filtro-activo"
                    : ""
                }`}
                title={`Filtro ${
                  (filtroVendedorSeleccionado !== "" &&
                    filtroVendedorSeleccionado === nombreSelectedVendedor) ||
                  selectedVendedor === ""
                    ? "aplicado"
                    : "sin aplicar"
                }`}
              >
                <AbonoInput className="close-svg2" />
                {filtroAbonoSeleccionado && !nombreSelectedAbono
                  ? filtroAbonoSeleccionado
                  : nombreSelectedAbono}
              </div>
            )}
          </div>

          <br />

          <div className="filters-left4" id="pdf">
            {showFilters === true && (
              <div className="pagination-count-filter-date">
                <p className="p-filter-date">Desde:</p>
                <div className="form-group-input-filter-date">
                  <input
                    className="search-input-filter-date"
                    aria-label="Desde"
                    type="date"
                    max={new Date().toISOString().split("T")[0]} // Establecer el atributo max a la fecha actual en formato ISO (AAAA-MM-DD)
                    min="2024-01-01"
                    value={desde}
                    onChange={(e) => {
                      const newDesde = e.target.value;
                      if (
                        new Date(newDesde).getTime() <=
                        new Date(hasta).getTime()
                      ) {
                        setDesde(newDesde);
                      } else {
                        setDesde(newDesde);
                        setHasta(newDesde); // Actualiza 'hasta' para que sea igual a 'desde'
                      }
                    }}
                  />
                </div>

                <p className="p-filter-date">Hasta:</p>

                <div className="form-group-input-filter-date">
                  <input
                    className="search-input-filter-date"
                    aria-label="Hasta"
                    type="date"
                    max={new Date().toISOString().split("T")[0]} // Establecer el atributo max a la fecha actual en formato ISO (AAAA-MM-DD)
                    min="2024-01-01"
                    value={hasta}
                    onChange={(e) => {
                      const newHasta = e.target.value;

                      if (
                        desde === "" ||
                        new Date(newHasta).getTime() >=
                          new Date(desde).getTime()
                      ) {
                        setHasta(newHasta);

                        // Si 'desde' está vacío, establecer 'desde' igual a 'hasta'
                        if (desde === "") {
                          setDesde(newHasta);
                        }
                      }
                    }}
                  />
                </div>

                <button className="btn-filter-date" onClick={search}>
                  <Lupa className="lupa-reportes-svg" />
                  CONSULTAR
                </button>

                {orders.length > 0 && (
                  <button
                    className="btn-clear-filter-date"
                    onClick={clearFilters}
                  >
                    BORRAR CONSULTA
                  </button>
                )}
              </div>
            )}

            {showFilters === true && (
              <div className="pagination-count-filter-date">
                {isLoadingVendedores === true && (
                  <div className="loading-sellers-div">
                    <Loader />
                    <p className="bold-loading">Cargando vendedores...</p>
                  </div>
                )}

                <p className="p-filter-date">Vendedor:</p>
                <div className="form-group-input nombre-input filter-report-div">
                  <select
                    className="input2"
                    aria-label="Vendedor"
                    style={{ cursor: "pointer" }}
                    name="vendedor"
                    id="nombreVendedor"
                    value={selectedVendedor}
                    onChange={(e) => {
                      setSelectedVendedor(e.target.value); // Asignar el ID del vendedor seleccionado a selectedVendedor
                      const selectedOption = listaVendedores.find(
                        (opt) => opt.idUsuario === parseInt(e.target.value)
                      ); // Encontrar la opción seleccionada en la lista de vendedores
                      setNombreSelectedVendedor(
                        selectedOption ? selectedOption.nombre : "-"
                      ); // Asignar el nombre del vendedor seleccionado a nombreSelectedVendedor
                    }}
                  >
                    <option hidden key={0} value="">
                      Seleccione un vendedor
                    </option>
                    {listaVendedores &&
                      Array.from(listaVendedores).map((opts, i) => (
                        <option
                          className="btn-option"
                          key={i}
                          value={opts.idUsuario}
                        >
                          {opts.nombre}
                        </option>
                      ))}
                    <option className="no-vendedor" value={"-1"}>
                      No recibió atención
                    </option>
                  </select>
                  {selectedVendedor !== "" && (
                    <button
                      type="button"
                      className="btn btn-light btn-delete4"
                      onClick={() => {
                        setSelectedVendedor("");
                        setNombreSelectedVendedor("");
                      }}
                    >
                      <Cancel className="edit3" />
                    </button>
                  )}
                </div>

                <p className="p-filter-date">Tipo de pedido:</p>
                <div className="form-group-input nombre-input filter-report-div">
                  <select
                    className="input2"
                    aria-label="Tipo de pedido"
                    style={{ cursor: "pointer" }}
                    name="tipo"
                    id="tipoPedido"
                    value={selectedTipo}
                    onChange={(e) => {
                      setSelectedTipo(e.target.value); // Asignar el tipo seleccionado a selectedTipo
                      const tipoNombre =
                      e.target.value === "1"
                        ? "LGF (Mayorista)"
                        : e.target.value === "2"
                        ? "Zeide (Mayorista)"
                        : e.target.value === "3"
                        ? "LGF (Minorista)"
                        : e.target.value === "4"
                        ? "Zeide (Minorista)"
                        : "";
                      setNombreSelectedTipo(tipoNombre); // Asignar el nombre del tipo seleccionado a nombreSelectedTipo
                    }}
                  >
                    <option hidden key={0} value="">
                      Seleccione un tipo de pedido
                    </option>
                    <option className="btn-option" value="1">
                      Minorista
                    </option>
                    <option className="btn-option" value="2">
                      Mayorista
                    </option>
                  </select>
                  {selectedTipo !== "" && (
                    <button
                      type="button"
                      className="btn btn-light btn-delete4"
                      onClick={() => {
                        setSelectedTipo("");
                        setNombreSelectedTipo("");
                      }}
                    >
                      <Cancel className="edit3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {showFilters === true && (
              <div className="pagination-count-filter-date">
                {isLoadingAbonosEntregas === true && (
                  <div className="loading-abonos-entregas-div">
                    <Loader />
                    <p className="bold-loading">
                      Cargando medios de pago y formas de entrega...
                    </p>
                  </div>
                )}

                <p className="p-filter-date">Forma de entrega:</p>
                <div className="form-group-input nombre-input filter-report-div">
                  <select
                    className="input2"
                    aria-label="Entrega"
                    style={{ cursor: "pointer" }}
                    name="tipo"
                    id="tipoEntrega"
                    value={selectedEntrega}
                    onChange={(e) => {
                      setSelectedEntrega(e.target.value);
                      const selectedOption = listaEntregas.find(
                        (opt) => opt.idEnvio === parseInt(e.target.value)
                      );
                      setNombreSelectedEntrega(
                        selectedOption
                          ? `${selectedOption.nombre}${
                              selectedOption.aclaracion
                                ? ` - ${selectedOption.aclaracion}`
                                : ""
                            }`
                          : "-"
                      );
                    }}
                  >
                    <option hidden key={0} value="">
                      Seleccione una forma de entrega
                    </option>
                    {listaEntregas &&
                      Array.from(listaEntregas).map((opts, i) => (
                        <option
                          className="btn-option"
                          key={i}
                          value={opts.idEnvio}
                        >
                          {opts.nombre}{" "}
                          {opts.aclaracion ? ` - ${opts.aclaracion}` : ""}
                        </option>
                      ))}
                  </select>
                  {selectedEntrega !== "" && (
                    <button
                      type="button"
                      className="btn btn-light btn-delete4"
                      onClick={() => {
                        setSelectedEntrega("");
                        setNombreSelectedEntrega("");
                      }}
                    >
                      <Cancel className="edit3" />
                    </button>
                  )}
                </div>

                <p className="p-filter-date">Medio de pago:</p>
                <div className="form-group-input nombre-input filter-report-div">
                  <select
                    className="input2"
                    aria-label="Abono"
                    style={{ cursor: "pointer" }}
                    name="abono"
                    id="abono"
                    value={selectedAbono}
                    onChange={(e) => {
                      setSelectedAbono(e.target.value); // Asignar el tipo de abono seleccionado a selectedAbono
                      const selectedOption = listaAbonos.find(
                        (opt) => opt.idMetodoPago === parseInt(e.target.value)
                      ); // Encontrar la opción seleccionada en la lista de abonos
                      setNombreSelectedAbono(
                        selectedOption ? selectedOption.nombre : "-"
                      ); // Asignar el nombre del vendedor seleccionado a nombreSelectedVendedor
                    }}
                  >
                    <option hidden key={0} value="">
                      Seleccione un medio de pago
                    </option>
                    {listaAbonos &&
                      Array.from(listaAbonos).map((opts, i) => (
                        <option
                          className="btn-option"
                          key={i}
                          value={opts.idMetodoPago}
                        >
                          {opts.nombre}
                        </option>
                      ))}
                  </select>
                  {selectedAbono !== "" && (
                    <button
                      type="button"
                      className="btn btn-light btn-delete4"
                      onClick={() => {
                        setSelectedAbono("");
                        setNombreSelectedAbono("");
                      }}
                    >
                      <Cancel className="edit3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="pagination-count-filter-date2">
              <p className="p-filter-date">Cantidad de pedidos:</p>
              <p className="p-filter-date-strong" id="cantidadPedidosNumero">
                0
              </p>
            </div>

            <div className="pagination-count-filter-date2">
              <p className="p-filter-date">Cantidad de productos vendidos:</p>
              <p className="p-filter-date-strong" id="cantidadProductosNumero">
                0
              </p>
            </div>

            
              <div className={`pagination-count-filter-date2 ${!showBilling ? 'hidden-billing' : ''}`}>
                <p className="p-filter-date">
                  Facturacion total (sin costo de envío):
                </p>
                <p className="p-filter-date-strong" id="montoTotalNumero">
                  $0
                </p>
              </div>
            

              <div className={`pagination-count-filter-date2 ${!showBilling ? 'hidden-billing' : ''}`}>
                <p className="p-filter-date">
                  Promedio Monto facturado por pedido:
                </p>
                <p
                  className="p-filter-date-strong"
                  id="promedioMontoTotalNumero"
                >
                  $0
                </p>
              </div>
           

            <div className="pagination-count-filter-date2">
              <p className="p-filter-date">Cantidad de clientes distintos:</p>
              <p className="p-filter-date-strong" id="cantidadClientesNumero">
                0
              </p>
            </div>

            {selectedVendedor === "" && filtroVendedorSeleccionado === "" && (
              <div className="pagination-count-filter-date2">
                <p className="p-filter-date">Vendedor con mas pedidos:</p>
                <p className="p-filter-date-strong">
                  {vendedorMasPedidos ? vendedorMasPedidos : "-"}
                </p>
                {vendedorMasPedidos !== "-" && orders.length > 0 && (
                  <p className="p-filter-date">
                    ({cantidadVendedorMasPedidos}{" "}
                    {cantidadVendedorMasPedidos !== 1 ? "pedidos" : "pedido"})
                  </p>
                )}
                {orders.length > 0 && segundoVendedorMasPedidos && (
                  <button
                    type="button"
                    className="btn btn-dark btn-show-top"
                    title={
                      tercerVendedorMasPedidos
                        ? "Ver top 3 vendedores"
                        : "Ver top 2 vendedores"
                    }
                    data-bs-toggle="modal"
                    data-bs-target="#modal-vendedores"
                  >
                    <Podio className="show-orders" />
                  </button>
                )}
              </div>
            )}

            <div
              className="pagination-count-filter-date2"
              style={{
                backgroundImage: urlProductoMasVendido
                  ? `linear-gradient(to bottom, #212529b7, #212529b7), url(${urlProductoMasVendido})`
                  : "none",
                backgroundSize: "cover",
              }}
            >
              <p className="p-filter-date">Producto mas vendido:</p>
              <p className="p-filter-date-strong">
                {productoMasVendido ? productoMasVendido : "-"}
              </p>
              {productoMasVendido !== "-" && orders.length > 0 && (
                <p className="p-filter-date">
                  ({cantidadProductoMasVendido}{" "}
                  {cantidadProductoMasVendido !== 1 ? "unidades" : "unidad"})
                </p>
              )}

              {orders.length > 0 && segundoProductoMasVendido && (
                <button
                  type="button"
                  className="btn btn-dark btn-show-top"
                  title={
                    tercerProductoMasVendido
                      ? "Ver top 3 productos"
                      : "Ver top 2 productos"
                  }
                  data-bs-toggle="modal"
                  data-bs-target="#modal-productos"
                >
                  <Podio className="show-orders" />
                </button>
              )}
            </div>

            <div className="pagination-count-filter-date2">
              <p className="p-filter-date">Categoría mas demandada:</p>
              <p className="p-filter-date-strong">
                {categoriaMasDemandada ? categoriaMasDemandada : "-"}
              </p>

              {categoriaMasDemandada !== "-" && orders.length > 0 && (
                <p className="p-filter-date">
                  ({cantidadCategoriaMasDemandada}{" "}
                  {cantidadCategoriaMasDemandada !== 1 ? "pedidos" : "pedido"})
                </p>
              )}

              {orders.length > 0 && segundaCategoriaMasDemandada && (
                <button
                  type="button"
                  className="btn btn-dark btn-show-top"
                  title={
                    tercerProductoMasVendido
                      ? "Ver top 3 categorías"
                      : "Ver top 2 categorías"
                  }
                  data-bs-toggle="modal"
                  data-bs-target="#modal-categorias"
                >
                  <Podio className="show-orders" />
                </button>
              )}
            </div>
          </div>

          {/* modal con top vendedores */}
          <div
            className="modal fade"
            id="modal-vendedores"
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
                    {tercerVendedorMasPedidos
                      ? "Top 3 Vendedores"
                      : "Top 2 Vendedores"}
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <p className="filter-separator separator-margin"></p>

                    <div className="puesto-div">
                      <p className="p-filter-date-strong-1-puesto">1.</p>
                      <p className="p-filter-date-strong-1">
                        {vendedorMasPedidos ? vendedorMasPedidos : "-"}
                      </p>

                      <p className="p-filter-date-1">
                        ({cantidadVendedorMasPedidos}{" "}
                        {cantidadVendedorMasPedidos !== 1
                          ? "pedidos"
                          : "pedido"}
                        )
                      </p>
                    </div>

                    {segundoVendedorMasPedidos && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-2-puesto">2.</p>
                          <p className="p-filter-date-strong-1">
                            {segundoVendedorMasPedidos
                              ? segundoVendedorMasPedidos
                              : "-"}
                          </p>

                          <p className="p-filter-date-1">
                            ({cantidadSegundoVendedorMasPedidos}{" "}
                            {cantidadSegundoVendedorMasPedidos !== 1
                              ? "pedidos"
                              : "pedido"}
                            )
                          </p>
                        </div>
                      </>
                    )}

                    {tercerVendedorMasPedidos && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-3-puesto">3.</p>
                          <p className="p-filter-date-strong-1">
                            {tercerVendedorMasPedidos
                              ? tercerVendedorMasPedidos
                              : "-"}
                          </p>

                          <p className="p-filter-date-1">
                            ({cantidadTercerVendedorMasPedidos}{" "}
                            {cantidadTercerVendedorMasPedidos !== 1
                              ? "pedidos"
                              : "pedido"}
                            )
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={CloseModalVendedores}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal-vendedores"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* modal con top productos */}
          <div
            className="modal fade"
            id="modal-productos"
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
                    {tercerProductoMasVendido
                      ? "Top 3 Productos"
                      : "Top 2 Productos"}
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <p className="filter-separator separator-margin"></p>

                    <div className="puesto-div">
                      <p className="p-filter-date-strong-1-puesto">1.</p>
                      <p className="p-filter-date-strong-1">
                        {productoMasVendido ? productoMasVendido : "-"}
                      </p>

                      <p className="p-filter-date-1 margin-right">
                        ({cantidadProductoMasVendido}{" "}
                        {cantidadProductoMasVendido !== 1
                          ? "unidades"
                          : "unidad"}
                        )
                      </p>

                      <img
                        src={urlProductoMasVendido}
                        className="img-producto"
                        alt="producto1"
                        onClick={() =>
                          Swal.fire({
                            title: productoMasVendido,
                            imageUrl: `${urlProductoMasVendido}`,
                            imageWidth: 400,
                            imageHeight: 400,
                            imageAlt: "Vista Categoría",
                            confirmButtonColor: "#6c757d",
                            confirmButtonText: "Cerrar",
                            focusConfirm: true,
                          })
                        }
                      />
                    </div>

                    {segundoProductoMasVendido && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-2-puesto">2.</p>
                          <p className="p-filter-date-strong-1">
                            {segundoProductoMasVendido
                              ? segundoProductoMasVendido
                              : "-"}
                          </p>

                          <p className="p-filter-date-1 margin-right">
                            ({cantidadSegundoProductoMasVendido}{" "}
                            {cantidadSegundoProductoMasVendido !== 1
                              ? "unidades"
                              : "unidad"}
                            )
                          </p>

                          <img
                            src={urlSegundoProductoMasVendido}
                            className="img-producto"
                            alt="producto2"
                            onClick={() =>
                              Swal.fire({
                                title: segundoProductoMasVendido,
                                imageUrl: `${urlSegundoProductoMasVendido}`,
                                imageWidth: 400,
                                imageHeight: 400,
                                imageAlt: "Vista Categoría",
                                confirmButtonColor: "#6c757d",
                                confirmButtonText: "Cerrar",
                                focusConfirm: true,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                    {tercerProductoMasVendido && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-3-puesto">3.</p>
                          <p className="p-filter-date-strong-1">
                            {tercerProductoMasVendido
                              ? tercerProductoMasVendido
                              : "-"}
                          </p>

                          <p className="p-filter-date-1 margin-right">
                            ({cantidadTercerProductoMasVendido}{" "}
                            {cantidadTercerProductoMasVendido !== 1
                              ? "unidades"
                              : "unidad"}
                            )
                          </p>

                          <img
                            src={urlTercerProductoMasVendido}
                            className="img-producto"
                            alt="producto3"
                            onClick={() =>
                              Swal.fire({
                                title: tercerProductoMasVendido,
                                imageUrl: `${urlTercerProductoMasVendido}`,
                                imageWidth: 400,
                                imageHeight: 400,
                                imageAlt: "Vista Categoría",
                                confirmButtonColor: "#6c757d",
                                confirmButtonText: "Cerrar",
                                focusConfirm: true,
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={CloseModalProductos}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal-productos"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* modal con top categorías */}
          <div
            className="modal fade"
            id="modal-categorias"
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
                    {terceraCategoriaMasDemandada
                      ? "Top 3 Categorías"
                      : "Top 2 Categorías"}
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container">
                    <p className="filter-separator separator-margin"></p>

                    <div className="puesto-div">
                      <p className="p-filter-date-strong-1-puesto">1.</p>
                      <p className="p-filter-date-strong-1">
                        {categoriaMasDemandada ? categoriaMasDemandada : "-"}
                      </p>

                      <p className="p-filter-date-1">
                        ({cantidadCategoriaMasDemandada}{" "}
                        {cantidadCategoriaMasDemandada !== 1
                          ? "pedidos"
                          : "pedido"}
                        )
                      </p>
                    </div>

                    {segundaCategoriaMasDemandada && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-2-puesto">2.</p>
                          <p className="p-filter-date-strong-1">
                            {segundaCategoriaMasDemandada
                              ? segundaCategoriaMasDemandada
                              : "-"}
                          </p>

                          <p className="p-filter-date-1">
                            ({cantidadSegundaCategoriaMasDemandada}{" "}
                            {cantidadSegundaCategoriaMasDemandada !== 1
                              ? "pedidos"
                              : "pedido"}
                            )
                          </p>
                        </div>
                      </>
                    )}

                    {terceraCategoriaMasDemandada && (
                      <>
                        <p className="filter-separator separator-margin"></p>

                        <div className="puesto-div">
                          <p className="p-filter-date-strong-3-puesto">3.</p>
                          <p className="p-filter-date-strong-1">
                            {terceraCategoriaMasDemandada
                              ? terceraCategoriaMasDemandada
                              : "-"}
                          </p>

                          <p className="p-filter-date-1">
                            ({cantidadTerceraCategoriaMasDemandada}{" "}
                            {cantidadTerceraCategoriaMasDemandada !== 1
                              ? "pedidos"
                              : "pedido"}
                            )
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={CloseModalCategorias}
                  >
                    <div className="btn-save-update-close">
                      <Close className="close-btn" />
                      <p className="p-save-update-close">Cerrar</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="btn-close-modal"
                    id="btn-close-modal-categorias"
                    data-bs-dismiss="modal"
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* tabla de pedidos */}
          {showOrders === true && (
            <table
              className="table table-dark table-bordered table-hover table-list table-list-orders table-orders"
              align="center"
            >
              <thead>
                <tr className="table-header table-header-orders">
                  <th className="table-title table-title-orders" scope="col">
                    #
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    ID
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Tipo
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Cliente
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Entrega
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Vendedor
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Cantidad de productos
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Subtotal
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Costo de envio
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Total
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Medio de pago
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Detalle
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Fecha
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Status
                  </th>
                </tr>
              </thead>

              {orders.length > 0 ? (
                ordersTable.map(function fn(order, index) {
                  return (
                    <tbody key={1 + order.idPedido}>
                      <tr>
                        <th
                          scope="row"
                          className="table-name table-name-orders"
                        >
                          {index + 1}
                        </th>
                        <td className="table-name table-name-orders">
                          {order.idPedido}{" "}
                        </td>
                        <td className="table-name table-name-orders">
                          {order.tipo.includes("Zeide") ? "Zeide" : "LGF"}
                          <br />
                          ({order.tipo.includes("Mayorista") ? "(Mayorista)" : "(Minorista)"})
                        </td>
                        <td className="table-name table-name-orders">
                          {order.cliente}
                        </td>
                        <td
                          className={`table-name table-name-orders ${
                            order.entrega.includes("domicilio")
                              ? "domicilio"
                              : order.entrega.includes("local") || order.entrega.includes("depósito")
                              ? "retiro-local"
                              : "domicilio"
                          }`}
                        >
                          {order.entrega}
                          {order.aclaracionEntrega
                            ? ` - ${order.aclaracionEntrega}`
                            : ""}
                        </td>
                        <td
                          className={`table-name table-name-orders ${
                            order.vendedor === null ? "predeterminado" : ""
                          }`}
                        >
                          {order.vendedor === null ? "-" : order.vendedor}
                        </td>
                        <td className="table-name table-name-orders">
                          {order.cantidadProductos}
                        </td>
                        <td className="table-name table-name-orders">
                          ${order.subtotal.toLocaleString()}
                        </td>
                        <td
                          className={`table-name table-name-orders ${
                            order.costoEnvio > 0
                              ? "domicilio"
                              : order.entrega.includes("local") || order.entrega.includes("depósito")
                              ? "retiro-local"
                              : "domicilio"
                          }`}
                        >
                          ${order.costoEnvio.toLocaleString()}
                        </td>
                        <td className="table-name table-name-orders">
                          ${order.total.toLocaleString()}
                        </td>
                        <td
                          className={`table-name table-name-orders ${
                            order.abono === "Mercado Pago"
                              ? "mercado-pago"
                              : "table-name table-name-orders"
                          }`}
                        >
                          {order.abono}
                        </td>
                        <td className="table-name table-name-orders table-overflow">
                          <pre>{order.detalle.split("|").join("\n")}</pre>
                        </td>
                        <td className="table-name table-name-orders">
                          {formatDate(order.fecha)}
                        </td>

                        {order.verificado ? (
                          <td className="table-name table-name-orders">
                            <div className="status-btns">
                              <div className="circulo-verificado"></div>
                              <p className="status-name">Verificado</p>
                            </div>
                          </td>
                        ) : (
                          <td className="table-name table-name-orders">
                            <div className="status-btns">
                              <div className="circulo-pendiente"></div>
                              <p className="status-name">Pendiente</p>
                            </div>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  );
                })
              ) : (
                <tbody>
                  <tr className="tr-name1">
                    <td className="table-name table-name1" colSpan={14}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}

          {/* tabla de detalles de reportes de pedidos para Excel */}
          <table ref={tableRef2} hidden align="center">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">ID</th>
                <th scope="col">Tipo</th>
                <th scope="col">Cliente</th>
                <th scope="col">Entrega</th>
                <th scope="col">Vendedor</th>
                <th scope="col">Cantidad de productos</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Costo de envio</th>
                <th scope="col">Total</th>
                <th scope="col">Medio de pago</th>
                <th scope="col">Detalle</th>
                <th scope="col">Fecha</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            {orders.length > 0 ? (
              orders.map(function fn(order, index) {
                return (
                  <tbody key={1 + order.idPedido}>
                    <tr>
                      <th scope="row">{index + 1}</th>
                      <td>{order.idPedido} </td>
                      <td>{order.tipo.includes("Zeide") ? "Zeide" : "LGF"} {order.tipo.includes("Mayorista") ? "(Mayorista)" : "(Minorista)"}</td>
                      <td>{order.cliente}</td>
                      <td
                        className={`table-name table-name-orders ${
                          order.entrega.includes("domicilio")
                            ? "domicilio"
                            : order.entrega.includes("local") || order.entrega.includes("depósito")
                            ? "retiro-local"
                            : "domicilio"
                        }`}
                      >
                        {order.entrega}
                        {order.aclaracionEntrega
                          ? ` - ${order.aclaracionEntrega}`
                          : ""}
                      </td>
                      <td
                        className={`table-name table-name-orders ${
                          order.vendedor === null ? "predeterminado" : ""
                        }`}
                      >
                        {order.vendedor === null ? "-" : order.vendedor}
                      </td>
                      <td>{order.cantidadProductos}</td>
                      <td>${order.subtotal.toLocaleString()}</td>
                      <td
                        className={`table-name table-name-orders ${
                          order.costoEnvio > 0
                            ? "domicilio"
                            : order.entrega.includes("local") || order.entrega.includes("depósito")
                            ? "retiro-local"
                            : "domicilio"
                        }`}
                      >
                        ${order.costoEnvio.toLocaleString()}
                      </td>
                      <td>${order.total.toLocaleString()}</td>
                      <td
                        className={`table-name table-name-orders ${
                          order.abono === "Mercado Pago"
                            ? "mercado-pago"
                            : "table-name table-name-orders"
                        }`}
                      >
                        {order.abono}
                      </td>
                      <td className="table-name table-name-orders table-overflow">
                        <pre>{order.detalle.split("|").join("\n")}</pre>
                      </td>
                      <td>{formatDate(order.fecha)}</td>

                      {order.verificado ? (
                        <td>
                          <div className="status-btns">
                            <div className="circulo-verificado"></div>
                            <p className="status-name">Verificado</p>
                          </div>
                        </td>
                      ) : (
                        <td>
                          <div className="status-btns">
                            <div className="circulo-pendiente"></div>
                            <p className="status-name">Pendiente</p>
                          </div>
                        </td>
                      )}
                    </tr>
                  </tbody>
                );
              })
            ) : (
              <tbody>
                <tr>
                  <td colSpan={14}>Sin registros</td>
                </tr>
              </tbody>
            )}
          </table>

          {/* tabla de reportes de pedidos para Excel */}
          <table hidden ref={tableRef1} align="center">
            <thead>
              <tr>
                <th scope="col">Fecha de inicio</th>
                <th scope="col">Fecha de fin</th>
                <th scope="col">Cantidad de pedidos</th>
                <th scope="col">Cantidad de productos vendidos</th>
                <th scope="col">Monto total (sin costo de envío)</th>
                <th scope="col">Cantidad de clientes distintos</th>
                <th scope="col">Vendedor con mas pedidos</th>
                <th scope="col">Producto mas vendido</th>
                <th scope="col">Categoría mas demandada</th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                <tr>
                  <td>{desde}</td>
                  <td>{hasta}</td>
                  <td>{cantidadPedidos}</td>
                  <td>{cantidadProductos}</td>
                  <td>{montoTotal}</td>
                  <td>{promedioMontoTotal}</td>
                  <td>{cantidadClientes}</td>

                  <td>
                    {vendedorMasPedidos} ({cantidadVendedorMasPedidos}{" "}
                    {cantidadVendedorMasPedidos !== 1 ? "pedidos" : "pedido"})
                  </td>
                  <td>
                    {productoMasVendido} ({cantidadProductoMasVendido}{" "}
                    {cantidadProductoMasVendido !== 1 ? "unidades" : "unidad"})
                  </td>
                  <td>
                    {categoriaMasDemandada} ({cantidadCategoriaMasDemandada}{" "}
                    {cantidadCategoriaMasDemandada !== 1
                      ? "unidades"
                      : "unidad"}
                    )
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={7}>Sin registros</td>
                </tr>
              )}
            </tbody>
          </table>

          {showOrders === true && (
            <div className="pagination-count-container2">
              <div className="pagination-count">
                {orders.length > 0 ? (
                  orders.length === 1 ? (
                    <p className="total">
                      Pedido {firstIndex + 1} de {orders.length}
                    </p>
                  ) : (
                    <p className="total">
                      Pedidos {firstIndex + 1} a{" "}
                      {ordersTable.length + firstIndex} de {orders.length}
                    </p>
                  )
                ) : (
                  <></>
                )}
              </div>

              {orders.length > 0 ? (
                <ul className="pagination-manager">
                  <li className="page-item">
                    <div className="page-link" onClick={prePage}>
                      {"<"}
                    </div>
                  </li>

                  <li className="numbers">
                    {numbers.map((n, i) => {
                      if (n === currentPage) {
                        // Render the current page number without a link
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
                        // Render the first and last page numbers, or the page numbers within the range around the current page
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
                        // Render the dots to show a break in the page numbers
                        return (
                          <ul className="page-item-container" key={i}>
                            <li className="page-item" key={i}>
                              <div className="page-link">...</div>
                            </li>
                          </ul>
                        );
                      } else {
                        // Hide the page number if it's not within the range to show
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
          )}
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default OrderReports;
