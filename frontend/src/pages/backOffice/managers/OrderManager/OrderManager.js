import Swal from "sweetalert2";
import { ReactComponent as Lupa } from "../../../../assets/svgs/lupa.svg";
import { useDownloadExcel } from "react-export-table-to-excel";
import $ from "jquery";
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import * as signalR from "@microsoft/signalr";

//#region SVG'S Imports
import { ReactComponent as Edit } from "../../../../assets/svgs/edit.svg";
import { ReactComponent as Delete } from "../../../../assets/svgs/delete.svg";
import { ReactComponent as Update } from "../../../../assets/svgs/update.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Verificar } from "../../../../assets/svgs/verificar.svg";
import { ReactComponent as Pendiente } from "../../../../assets/svgs/pendiente.svg";
import { ReactComponent as Filter } from "../../../../assets/svgs/filter.svg";

import { ReactComponent as Excel } from "../../../../assets/svgs/excel.svg";

import { ReactComponent as CostoEnvioInput } from "../../../../assets/svgs/shipment.svg";
import { ReactComponent as SellerInput } from "../../../../assets/svgs/seller.svg";
import { ReactComponent as EntregaInput } from "../../../../assets/svgs/entregainput.svg";
import { ReactComponent as PaymentInput } from "../../../../assets/svgs/paymentInput.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetOrders,
  GetOrderById,
  UpdateOrders,
  DeleteOrders,
  UpdateOrdersVerified,
} from "../../../../services/OrderService";
import { GetUsersByRole } from "../../../../services/UserService";
import { GetFormasEntregaManage } from "../../../../services/ShipmentService";
import { GetPaymentTypes } from "../../../../services/PaymentTypeService";
import { formatDate } from "../../../../utils/DateFormat";

function OrderManager() {
  //#region Constantes
  const [isLoading, setIsLoading] = useState(false);

  const [idPedido, setIdPedido] = useState("");

  const [tipo, setTipo] = useState("");
  const [filtroEntrega, setFiltroEntrega] = useState("");
  const [filtroAbono, setFiltroAbono] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");

  const [entrega, setEntrega] = useState("");
  const [prevEntrega, setPrevEntrega] = useState("");

  const [vendedor, setVendedor] = useState("");
  const [prevVendedor, setPrevVendedor] = useState("");

  const [costoEnvio, setCostoEnvio] = useState("");
  const [prevCostoEnvio, setPrevCostoEnvio] = useState("");

  const [abono, setAbono] = useState("");
  const [prevAbono, setPrevAbono] = useState("");

  const [listaVendedores, setListaVendedores] = useState([]);
  const [listaAbonos, setListaAbonos] = useState([]);
  const [listaEntregas, setListaEntregas] = useState([]);

  const [nombreSelectedVendedor, setNombreSelectedVendedor] = useState("");
  const [nombreSelectedEntrega, setNombreSelectedEntrega] = useState("");
  const [nombreSelectedAbono, setNombreSelectedAbono] = useState("");

  const [nombreEntrega, setNombreEntrega] = useState("");

  const [orders, setOrders] = useState([]);

  const [originalOrdersList, setOriginalOrdersList] = useState(orders);

  const [title, setTitle] = useState(["Detalles de Pedidos"]);

  const [filterName, setFilterName] = useState("");

  const [filterType, setFilterType] = useState("");

  const [query, setQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");

  const [pending, setPending] = useState(false);

  const tableRef = useRef(null);

  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `${title}`,
    sheet: `${title}`,
  });

  const token = localStorage.getItem("token"); // Obtener el token del localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };
  const rolUsuario = JSON.parse(atob(token.split(".")[1])).role;

  const [cantidadPedidosPendientes, setCantidadPedidosPendientes] =
    useState("");

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

  //#region UseEffect
  useEffect(() => {
    (async () => {
      setIsLoading(true);

      try {
        const resultOrders = await GetOrders();
        setOrders(resultOrders);
        setOriginalOrdersList(resultOrders);

        const responseSellers = await GetUsersByRole("Vendedor");
        setListaVendedores(responseSellers);

        const responsePaymentTypes = await GetPaymentTypes();
        setListaAbonos(responsePaymentTypes);

        const response = await GetFormasEntregaManage();
        setListaEntregas(response);

        setIsLoading(false);
      } catch (error) {
        // Manejar errores aquí si es necesario
        setIsLoading(false);
      }
    })();

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
      setOrdersPerPage(3);
      setMaxPageNumbersToShow(1);
    } else {
      setOrdersPerPage(3);
      setMaxPageNumbersToShow(9);
    }
  }, []);

  useEffect(() => {
    setCantidadPedidosPendientes(
      orders.filter((order) => !order.verificado).length
    );
  }, [orders]);

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

    connection.on("MensajeCrudEntrega", async () => {
      try {
        const response = await GetFormasEntregaManage();
        setListaEntregas(response);
      } catch (error) {
        console.error("Error al obtener el costo de envío: " + error);
      }
    });

    connection.on("MensajeCrudVendedor", async () => {
      try {
        const responseSellers = await GetUsersByRole("Vendedor");
        setListaVendedores(responseSellers);
      } catch (error) {
        console.error("Error al obtener los vendedores: " + error);
      }
    });

    connection.on("MensajeCreatePedido", async () => {
      try {
        const resultOrders = await GetOrders();
        setOrders(resultOrders);
        setOriginalOrdersList(resultOrders);
      } catch (error) {
        console.error("Error al obtener los pedidos: " + error);
      }
    });

    connection.on("MensajeCrudMetodoPago", async () => {
      try {
        const responsePaymentTypes = await GetPaymentTypes();
        setListaAbonos(responsePaymentTypes);
      } catch (error) {
        console.error("Error al obtener los medios de pago: " + error);
      }
    });

    return () => {
      connection.stop();
    };
  }, []);
  //#endregion

  //#region Función para cuando selecciono una entrega
  const handleEntregaClick = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = e.target.options[selectedIndex];

    setEntrega(e.target.value);
    setNombreEntrega(selectedOption.getAttribute("data-nombre"));
    setCostoEnvio(Number(selectedOption.getAttribute("data-costo")));
  };
  //#endregion

  //#region Función para cambiar el estado de un pedido a pendiente
  const Pending = async (order) => {
    const idPedido = order.idPedido; // Obtener el idPedido del objeto order

    Swal.fire({
      icon: "warning",
      title: "¿Está seguro de que desea quitar la verificacion del pedido?",
      text: "Se cambiará el estado del pedido a pendiente",
      confirmButtonText: "Aceptar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f8bb86",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UpdateOrdersVerified(
            orders.find((u) => u.idPedido === idPedido).idPedido || idPedido,
            {
              idPedido: idPedido,
              verificado: false,
            },
            headers
          );

          Swal.fire({
            icon: "success",
            title: "Estado del pedido actualizado exitosamente!",
            showConfirmButton: false,
            timer: 2000,
          });

          const resultOrders = await GetOrders();
          setOriginalOrdersList(resultOrders);

          if (filterType === "search") {
            const orderData = await GetOrderById(query);

            if (orderData) {
              setOrders([orderData]);
            } else {
              setOrders([]);
            }

            document.getElementById("clear-filter").style.display = "flex";
            document.getElementById("clear-filter2").style.display = "flex";
            setTitle(`Detalle de Pedido con ID: "${filterName}"`);
            setFilterName(filterName);
            setFilterType("search");
            ClearPending();
            setCurrentPage(1);

            if (filterName === "") {
              document.getElementById("clear-filter").style.display = "none";
              document.getElementById("clear-filter2").style.display = "none";
              setFilterType("");
              setTitle("Detalles de Pedidos");
            }
          } else {
            const resultOrders = await GetOrders();
            setOrders(resultOrders);

            setOrders((prevOrders) => {
              setOriginalOrdersList(prevOrders);

              if (filterType === "type") {
                const result = prevOrders.filter((order) => {
                  return order.tipo === filterName;
                });

                setTitle(`Detalles de Pedidos de ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("type");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "seller") {
                const result = prevOrders.filter((order) => {
                  return order.vendedor === filterName;
                });

                setTitle(`Detalles de Pedidos del vendedor: ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("seller");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "shipment") {
                const result = prevOrders.filter((order) => {
                  // Verificar si filterName tiene un guion seguido de texto adicional
                  const match = filterName.match(/^(.*)\s*-\s*(.*)$/);

                  if (match) {
                    // Si hay coincidencia con el patrón de guion, comparar entrega y aclaracionEntrega
                    const entregaPart = match[1].trim();
                    const aclaracionPart = match[2].trim();
                    return (
                      order.entrega === entregaPart &&
                      order.aclaracionEntrega === aclaracionPart
                    );
                  } else {
                    // Si no hay guion, comparar solo con entrega
                    return order.entrega === filterName;
                  }
                });

                setTitle(`Detalles de Pedidos con retiro ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("shipment");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "payment") {
                const result = prevOrders.filter((order) => {
                  return order.abono === filterName;
                });

                setTitle(`Detalles de Pedidos pagados con ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("payment");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "pending") {
                const result = prevOrders.filter((order) => {
                  return order.verificado === false;
                });
                setTitle("Detalles de Pedidos pendientes");
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName("Pendiente");
                setFilterType("pending");
                setCurrentPage(1);
              }

              if (filterType === "other") {
                setOrders(prevOrders);
              } else {
                return prevOrders;
              }
            });
          }
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

  //#region Función para cambiar el estado de un pedido a verificado
  const Verify = async (order) => {
    const idPedido = order.idPedido; // Obtener el idPedido del objeto order

    Swal.fire({
      icon: "warning",
      title: "¿Está seguro de que desea verificar el pedido?",
      text: "Se cambiará el estado del pedido a verificado",
      confirmButtonText: "Aceptar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f8bb86",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await UpdateOrdersVerified(
            orders.find((u) => u.idPedido === idPedido).idPedido || idPedido,
            {
              idPedido: idPedido,
              verificado: true,
            },
            headers
          );

          Swal.fire({
            icon: "success",
            title: "Estado del pedido actualizado exitosamente!",
            showConfirmButton: false,
            timer: 2000,
          });

          const resultOrders = await GetOrders();
          setOriginalOrdersList(resultOrders);

          if (filterType === "search") {
            const fetchOrderData = async () => {
              try {
                const orderData = await GetOrderById(query);

                if (orderData) {
                  setOrders([orderData]);
                } else {
                  setOrders([]);
                }

                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setTitle(`Detalle de Pedido con ID: "${filterName}"`);
                setFilterName(filterName);
                setFilterType("search");
                ClearPending();
                setCurrentPage(1);

                if (filterName === "") {
                  document.getElementById("clear-filter").style.display =
                    "none";
                  document.getElementById("clear-filter2").style.display =
                    "none";
                  setFilterType("");
                  setTitle("Detalles de Pedidos");
                }
              } catch (error) {
                console.error("Error fetching order data:", error);
                setOrders([]);
              }
            };

            fetchOrderData();
          } else {
            const resultOrders = await GetOrders();
            setOrders(resultOrders);

            setOrders((prevOrders) => {
              setOriginalOrdersList(prevOrders);

              if (filterType === "type") {
                const result = prevOrders.filter((order) => {
                  return order.tipo === filterName;
                });

                setTitle(`Detalles de Pedidos de ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("type");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "seller") {
                const result = prevOrders.filter((order) => {
                  return order.vendedor === filterName;
                });

                setTitle(`Detalles de Pedidos del vendedor: ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("seller");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "shipment") {
                const result = prevOrders.filter((order) => {
                  // Verificar si filterName tiene un guion seguido de texto adicional
                  const match = filterName.match(/^(.*)\s*-\s*(.*)$/);

                  if (match) {
                    // Si hay coincidencia con el patrón de guion, comparar entrega y aclaracionEntrega
                    const entregaPart = match[1].trim();
                    const aclaracionPart = match[2].trim();
                    return (
                      order.entrega === entregaPart &&
                      order.aclaracionEntrega === aclaracionPart
                    );
                  } else {
                    // Si no hay guion, comparar solo con entrega
                    return order.entrega === filterName;
                  }
                });

                setTitle(`Detalles de Pedidos con retiro ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("shipment");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "payment") {
                const result = prevOrders.filter((order) => {
                  return order.abono === filterName;
                });

                setTitle(`Detalles de Pedidos pagados con ${filterName}`);
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName(filterName);
                setFilterType("payment");
                ClearPending();
                setCurrentPage(1);
              }

              if (filterType === "pending") {
                const result = prevOrders.filter((order) => {
                  return order.verificado === false;
                });
                setTitle("Detalles de Pedidos pendientes");
                setOrders(result);
                setQuery("");
                document.getElementById("clear-filter").style.display = "flex";
                document.getElementById("clear-filter2").style.display = "flex";
                setFilterName("Pendiente");
                setFilterType("pending");
                setCurrentPage(1);
              }

              if (filterType === "other") {
                setOrders(prevOrders);
              } else {
                return prevOrders;
              }
            });
          }
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

  //#region Función para borrar el estado de pendiente
  const ClearPending = () => {
    if (pending === true) {
      setPending(false);
    }
  };
  //#endregion

  //#region Función para borrar cualquier filtro
  const ClearFilter = () => {
    setOrders(originalOrdersList); // trae la lista de pedidos original, sin ningun filtro
    setTipo("");
    setFiltroVendedor("");
    setFiltroEntrega("");
    setFiltroAbono("");
    setQuery("");
    setFilterName("");
    setFilterType("");
    setTitle("Detalles de Pedidos");
    document.getElementById("clear-filter").style.display = "none";
    document.getElementById("clear-filter2").style.display = "none"; // esconde del DOM el boton de limpiar filtros
    setCurrentPage(1);
    ClearPending();
    window.scrollTo(0, 0);

    if (query !== "") {
      setSelectedQuery("");
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por tipo de pedido
  const filterResultType = async (type) => {
    setIsLoading(true);

    try {
      const ordersData = await GetOrders(type);
      setOrders(ordersData);

      setTitle(`Detalles de Pedidos ${type}`);
      setQuery("");
      document.getElementById("clear-filter").style.display = "flex";
      document.getElementById("clear-filter2").style.display = "flex";
      setFilterName(type);
      setFilterType("type");
      setCurrentPage(1);
      ClearPending();
      window.scrollTo(0, 0);
      setFiltroVendedor("");
      setFiltroEntrega("");
      setFiltroAbono("");
      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por vendedor
  const filterResultSeller = async (seller) => {
    setIsLoading(true);

    try {
      const selectedOption = listaVendedores.find(
        (opt) => opt.idUsuario === parseInt(seller)
      ); // Encontrar la opción seleccionada en la lista de vendedores

      if (selectedOption) {
        setNombreSelectedVendedor(selectedOption.nombre);

        const ordersData = await GetOrders("", seller);
        setOrders(ordersData);

        setTitle(`Detalles de Pedidos del vendedor: ${selectedOption.nombre}`);
        setQuery("");
        document.getElementById("clear-filter").style.display = "flex";
        document.getElementById("clear-filter2").style.display = "flex";
        setFilterName(selectedOption.nombre);
        setFilterType("seller");
        setCurrentPage(1);
        ClearPending();
        window.scrollTo(0, 0);
        setTipo("");
        setFiltroEntrega("");
        setFiltroAbono("");
      } else {
        setTitle("Detalles de Pedidos del vendedor: -");
        setOrders([]);
        setFilterName("-");
        setFilterType("seller");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error al filtrar resultados:", error);
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por forma de entrega
  const filterResultShipment = async (shipment) => {
    setIsLoading(true);

    try {
      const selectedOption = listaEntregas.find(
        (opt) => opt.idEnvio === parseInt(shipment)
      );

      if (selectedOption) {
        const nombreEntrega = `${selectedOption.nombre}${
          selectedOption.aclaracion ? ` - ${selectedOption.aclaracion}` : ""
        }`;
        setNombreSelectedEntrega(nombreEntrega);

        const ordersData = await GetOrders("", "", shipment);
        setOrders(ordersData);

        setTitle(`Detalles de Pedidos con ${nombreEntrega}`);
        setQuery("");
        document.getElementById("clear-filter").style.display = "flex";
        document.getElementById("clear-filter2").style.display = "flex";
        setFilterName(nombreEntrega);
        setFilterType("shipment");
        setCurrentPage(1);
        ClearPending();
        window.scrollTo(0, 0);
        setTipo("");
        setFiltroVendedor("");
        setFiltroAbono("");
      } else {
        setTitle("Detalles de Pedidos con -");
        setOrders([]);
        setFilterName("-");
        setFilterType("shipment");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error al filtrar resultados por envío:", error);
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por metodo de pago
  const filterResultPayment = async (payment) => {
    setIsLoading(true);

    try {
      const selectedOption = listaAbonos.find(
        (opt) => opt.idMetodoPago === parseInt(payment)
      );

      if (selectedOption) {
        setNombreSelectedAbono(selectedOption.nombre);

        const ordersData = await GetOrders("", "", "", payment);
        setOrders(ordersData);

        setTitle(`Detalles de Pedidos pagados con ${selectedOption.nombre}`);
        setQuery("");
        document.getElementById("clear-filter").style.display = "flex";
        document.getElementById("clear-filter2").style.display = "flex";
        setFilterName(selectedOption.nombre);
        setFilterType("payment");
        setCurrentPage(1);
        ClearPending();
        window.scrollTo(0, 0);
        setTipo("");
        setFiltroVendedor("");
        setFiltroEntrega("");
      } else {
        setTitle("Detalles de Pedidos pagados con -");
        setOrders([]);
        setFilterName("-");
        setFilterType("payment");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error al filtrar resultados por método de pago:", error);
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Función para filtrar pedidos por estado pendiente
  const filterResultPending = async (pending) => {
    setIsLoading(true);
    try {
      if (pending === false) {
        const ordersData = await GetOrders("", "", "", "", pending);
        setOrders(ordersData);
        // Hacer una copia de la lista original

        setTitle("Detalles de Pedidos pendientes");
        setQuery("");
        document.getElementById("clear-filter").style.display = "flex";
        document.getElementById("clear-filter2").style.display = "flex";
        setFilterName("Pendiente");
        setFilterType("pending");
        setCurrentPage(1);
        window.scrollTo(0, 0);
        setTipo("");
        setFiltroVendedor("");
        setFiltroEntrega("");
        setFiltroAbono("");
      } else {
        ClearFilter();
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
    }
  };
  //#endregion

  //#region Función para filtrar pedido mediante una consulta personalizada por su ID
  const search = async () => {
    setIsLoading(true);

    // setOrders(originalOrdersList);
    try {
      if (selectedQuery === "") {
        Swal.fire({
          icon: "warning",
          title: "Consulta vacía",
          text: "Ingrese un ID para realizar la búsqueda.",
          confirmButtonText: "Aceptar",
          showCancelButton: false,
          confirmButtonColor: "#f8bb86",
        });
      } else if (selectedQuery === query) {
        Swal.fire({
          icon: "warning",
          title: "ID de pedido no cambiado",
          text: "El ID de pedido es el mismo que el de la última consulta. Intente con un ID diferente.",
          confirmButtonText: "Aceptar",
          showCancelButton: false,
          confirmButtonColor: "#f8bb86",
        });
      } else {
        setQuery(selectedQuery);

        try {
          const orderData = await GetOrderById(selectedQuery);
          setOrders([orderData]);

          document.getElementById("clear-filter").style.display = "flex";
          document.getElementById("clear-filter2").style.display = "flex";
          setTitle(`Detalle de Pedido con ID: "${selectedQuery}"`);
          setFilterName(selectedQuery);
          setFilterType("search");
          ClearPending();
          setTipo("");
          setFiltroEntrega("");
          setFiltroAbono("");
          setFiltroVendedor("");
          setCurrentPage(1);
          window.scrollTo(0, 0);
          if (selectedQuery === "") {
            document.getElementById("clear-filter").style.display = "none";
            document.getElementById("clear-filter2").style.display = "none";
            setFilterType("");
            setTitle("Detalles de Pedidos");
            window.scrollTo(0, 0);
          }
        } catch (error) {
          Swal.fire({
            icon: "warning",
            title: "Pedido no encontrado",
            text: "No se encontró ningún pedido con el ID: " + selectedQuery,
            confirmButtonText: "Aceptar",
            showCancelButton: false,
            confirmButtonColor: "#f8bb86",
          });

          setOrders(originalOrdersList); // trae la lista de pedidos original, sin ningun filtro
          setTipo("");
          setFiltroVendedor("");
          setFiltroEntrega("");
          setFiltroAbono("");
          setFilterName("");
          setFilterType("");
          setTitle("Detalles de Pedidos");
          document.getElementById("clear-filter").style.display = "none";
          document.getElementById("clear-filter2").style.display = "none"; // esconde del DOM el boton de limpiar filtros
          setCurrentPage(1);
          ClearPending();
          window.scrollTo(0, 0);

          console.error("Error al obtener el pedido:", error);
        }
      }

      setIsLoading(false);
    } catch {
      setIsLoading(false);
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
  function ClearOrderInputs() {
    setIdPedido("");

    setEntrega("");
    setVendedor("");
    setCostoEnvio("");
    setAbono("");
  }
  //#endregion

  //#region Función para obtener los valores almacenados de un pedido y cargar cada uno de ellos en su input correspondiente
  function RetrieveOrderInputs(order) {
    setIdPedido(order.idPedido);

    setEntrega(getIdEntrega(order.entrega, order.aclaracionEntrega));

    setNombreEntrega(order.entrega);

    if (order.tipo === "Minorista") {
      setTipo(1);
    } else if (order.tipo === "Mayorista") {
      setTipo(2);
    }

    setVendedor(getIdVendedor(order.vendedor));
    setCostoEnvio(order.costoEnvio);
    setAbono(getIdAbono(order.abono));

    setPrevEntrega(getIdEntrega(order.entrega, order.aclaracionEntrega));
    setPrevVendedor(getIdVendedor(order.vendedor));
    setPrevCostoEnvio(order.costoEnvio);
    setPrevAbono(getIdAbono(order.abono));
  }
  //#endregion

  //#region Función para volver el formulario a su estado inicial, borrando los valores de los inputs, cargando los selects y refrezcando la lista de pedidos
  async function InitialState() {
    ClearOrderInputs();

    const resultOrders = await GetOrders();
    setOrders(resultOrders);
    setOriginalOrdersList(resultOrders);
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

  //#region Función para verificar si los valores ingresados a traves de los inputs son correctos
  function IsValid() {
    if (entrega === "") {
      Swal.fire({
        icon: "error",
        title: "El tipo de entrega no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#entrega").focus();
        }, 500);
      });
      return false;
    } else if (vendedor === 0) {
      Swal.fire({
        icon: "error",
        title: "El nombre completo del vendedor no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#vendedor").focus();
        }, 500);
      });
      return false;
    } else if (costoEnvio === "") {
      Swal.fire({
        icon: "error",
        title:
          "El costo del envío puede estar vacío, si no tiene costo ingrese 0",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#costoEnvio").focus();
        }, 500);
      });
      return false;
    } else if (abono === "") {
      Swal.fire({
        icon: "error",
        title: "El abono no puede estar vacío",
        text: "Complete el campo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f27474",
      }).then(function () {
        setTimeout(function () {
          $("#abono").focus();
        }, 500);
      });
      return false;
    }
    return true;
  }
  //#endregion

  //#region Función para verificar si se actualizo el valor de al menos un input
  function IsUpdated() {
    if (
      prevEntrega !== entrega ||
      prevVendedor !== vendedor ||
      prevCostoEnvio !== costoEnvio ||
      prevAbono !== abono
    ) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Función para actualizar un pedido ya existente
  async function UpdateOrder(event) {
    event.preventDefault();

    if (IsUpdated() === false) {
      Swal.fire({
        icon: "error",
        title: "No puede actualizar el pedido sin modificar ningun campo",
        text: "Modifique al menos un campo para poder actualizarlo",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#F27474",
      });
    } else if (IsValid() === true && IsUpdated() === true) {
      try {
        await UpdateOrders(
          orders.find((u) => u.idPedido === idPedido).idPedido || idPedido,
          {
            idPedido: idPedido,
            costoEnvio: costoEnvio,
            idVendedor: vendedor,
            idMetodoPago: abono,
            IdMetodoEntrega: entrega,
          },
          headers
        );
        Swal.fire({
          icon: "success",
          title: "Pedido actualizado exitosamente!",
          showConfirmButton: false,
          timer: 2000,
        });

        const resultOrders = await GetOrders();
        setOriginalOrdersList(resultOrders);

        CloseModal();

        // InitialState();
        ClearOrderInputs();

        // Verificar el tipo de filtro y actualizar orders en consecuencia
        if (filterType === "search") {
          const orderData = await GetOrderById(query);
          if (orderData) {
            setOrders([orderData]);
          } else {
            setOrders([]);
          }
          document.getElementById("clear-filter").style.display = "flex";
          document.getElementById("clear-filter2").style.display = "flex";
          setTitle(`Detalle de Pedido con ID: "${filterName}"`);
          setFilterName(filterName);
          setFilterType("search");
          ClearPending();
          setCurrentPage(1);

          if (filterName === "") {
            document.getElementById("clear-filter").style.display = "none";
            document.getElementById("clear-filter2").style.display = "none";
            setFilterType("");
            setTitle("Detalles de Pedidos");
          }
        } else {
          const resultOrders = await GetOrders();
          setOrders(resultOrders);

          setOrders((prevOrders) => {
            setOriginalOrdersList(prevOrders);

            if (filterType === "type") {
              const result = prevOrders.filter((order) => {
                return order.tipo === filterName;
              });

              setTitle(`Detalles de Pedidos de ${filterName}`);
              setOrders(result);
              setQuery("");
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(filterName);
              setFilterType("type");
              ClearPending();
              setCurrentPage(1);
            }

            if (filterType === "seller") {
              const result = prevOrders.filter((order) => {
                return order.vendedor === filterName;
              });

              setTitle(`Detalles de Pedidos del vendedor: ${filterName}`);
              setOrders(result);
              setQuery("");
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(filterName);
              setFilterType("seller");
              ClearPending();
              setCurrentPage(1);
            }

            if (filterType === "shipment") {
              const result = prevOrders.filter((order) => {
                // Verificar si filterName tiene un guion seguido de texto adicional
                const match = filterName.match(/^(.*)\s*-\s*(.*)$/);

                if (match) {
                  // Si hay coincidencia con el patrón de guion, comparar entrega y aclaracionEntrega
                  const entregaPart = match[1].trim();
                  const aclaracionPart = match[2].trim();
                  return (
                    order.entrega === entregaPart &&
                    order.aclaracionEntrega === aclaracionPart
                  );
                } else {
                  // Si no hay guion, comparar solo con entrega
                  return order.entrega === filterName;
                }
              });

              setTitle(`Detalles de Pedidos con retiro ${filterName}`);
              setOrders(result);
              setQuery("");
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(filterName);
              setFilterType("shipment");
              ClearPending();
              setCurrentPage(1);
            }

            if (filterType === "payment") {
              const result = prevOrders.filter((order) => {
                return order.abono === filterName;
              });

              setTitle(`Detalles de Pedidos pagados con ${filterName}`);
              setOrders(result);
              setQuery("");
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName(filterName);
              setFilterType("payment");
              ClearPending();
              setCurrentPage(1);
            }

            if (filterType === "pending") {
              const result = prevOrders.filter((order) => {
                return order.verificado === false;
              });
              setTitle("Detalles de Pedidos pendientes");
              setOrders(result);
              setQuery("");
              document.getElementById("clear-filter").style.display = "flex";
              document.getElementById("clear-filter2").style.display = "flex";
              setFilterName("Pendiente");
              setFilterType("pending");
              setCurrentPage(1);
            }

            if (filterType === "other") {
              setOrders(prevOrders);
            } else {
              return prevOrders;
            }
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

  //#region Función para eliminar un pedido existente
  async function DeleteOrder(id) {
    await DeleteOrders(id, headers);
    Swal.fire({
      icon: "success",
      title: "Pedido eliminado exitosamente!",
      showConfirmButton: false,
      timer: 2000,
    });
    InitialState();
    ClearFilter();
  }
  //#endregion

  //#region Función para obtener el id del vendedor de un pedido
  const getIdVendedor = (nombre) => {
    const vendedor = listaVendedores.find((v) => v.nombre === nombre);
    return vendedor ? vendedor.idUsuario : "-1";
  };
  //#endregion

  //#region Función para obtener el id de una forma de entrega de un pedido
  const getIdEntrega = (nombre, aclaracion) => {
    const entrega = listaEntregas.find(
      (f) => f.nombre == nombre && f.aclaracion == aclaracion
    );
    return entrega.idEnvio;
  };
  //#endregion

  //#region Función para obtener el id del medio de pago de un pedido
  const getIdAbono = (nombre) => {
    const abono = listaAbonos.find((a) => a.nombre === nombre);
    return abono.idMetodoPago;
  };
  //#endregiony

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Gestionar Pedidos</title>
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

              {cantidadPedidosPendientes > 0 && !pending && tipo === "" && (
                <button
                  type="button"
                  className="btn btn-warning btn-orders"
                  title={`Ver ${
                    cantidadPedidosPendientes === 1
                      ? "pedido pendiente"
                      : "pedidos pendientes"
                  }`}
                  onClick={() => {
                    Swal.fire({
                      title: `Hay ${cantidadPedidosPendientes} ${
                        cantidadPedidosPendientes === 1
                          ? "pedido pendiente"
                          : "pedidos pendientes"
                      }`,
                      text: `¿Desea visualizar${
                        cantidadPedidosPendientes === 1 ? "lo" : "los"
                      }?`,
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonColor: "#87adbd",
                      cancelButtonColor: "#6c757d",
                      confirmButtonText: "Aceptar",
                      cancelButtonText: "Cancelar",
                      focusCancel: true,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        filterResultPending(false);
                        setPending(true);
                      }
                    });
                  }}
                >
                  {cantidadPedidosPendientes}
                </button>
              )}
            </div>

            {isLoading === false &&
              (orders.length > 1 || orders.length === 0 ? (
                <p className="total">Hay {orders.length} pedidos.</p>
              ) : (
                <p className="total">Hay {orders.length} pedido.</p>
              ))}
          </div>

          {/* modal con el formulario para actualizar un pedido */}
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
                    Actualizar Pedido
                  </h1>
                </div>
                <div className="modal-body">
                  <div className="container mt-4">
                    <form>
                      <div className="form-group">
                        <input
                          type="text"
                          className="input"
                          id="idPedido"
                          hidden
                          value={idPedido}
                          onChange={(event) => {
                            setIdPedido(event.target.value);
                          }}
                        />

                        <label className="label selects" htmlFor="envio">
                          Entrega:
                        </label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <EntregaInput className="input-group-svg" />
                          </span>

                          <select
                            className="input"
                            style={{ cursor: "pointer" }}
                            name="envio"
                            id="envio"
                            value={entrega}
                            onChange={handleEntregaClick}
                          >
                            <option hidden key={0} value="0">
                              Seleccione una forma de entrega
                            </option>
                            {listaEntregas &&
                              Array.from(listaEntregas).map((opts, i) => {
                                const shouldShowEnvio =
                                  (nombreEntrega
                                    .toLowerCase()
                                    .includes("local") &&
                                    opts.disponibilidad !== 2) ||
                                  (nombreEntrega
                                    .toLowerCase()
                                    .includes("domicilio") &&
                                    opts.disponibilidad !== 1) ||
                                  opts.disponibilidad === 3;

                                const shouldShowCatalogo =
                                  (tipo === 1 &&
                                    opts.disponibilidadCatalogo !== 2) ||
                                  (tipo === 2 &&
                                    opts.disponibilidadCatalogo !== 1) ||
                                  opts.disponibilidadCatalogo === 3;

                                const shouldShow =
                                  shouldShowEnvio && shouldShowCatalogo;

                                return shouldShow ? (
                                  <option
                                    className="btn-option"
                                    key={i}
                                    value={opts.idEnvio}
                                    data-nombre={opts.nombre}
                                    data-costo={opts.costo}
                                    disabled={!opts.habilitado}
                                  >
                                    {opts.nombre} (${opts.costo})
                                    {opts.aclaracion
                                      ? ` - ${opts.aclaracion}`
                                      : ""}
                                  </option>
                                ) : null;
                              })}
                          </select>
                        </div>

                        <label className="label selects" htmlFor="vendedor">
                          Vendedor:
                        </label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <SellerInput className="input-group-svg" />
                          </span>
                          <select
                            className="input"
                            style={{ cursor: "pointer" }}
                            name="vendedor"
                            id="vendedor"
                            value={vendedor}
                            onChange={(e) => setVendedor(e.target.value)}
                          >
                            <option hidden key={0} value="0">
                              Seleccione un vendedor
                            </option>
                            {listaVendedores &&
                              Array.from(listaVendedores).map((opts, i) => (
                                <option
                                  className="btn-option"
                                  key={i}
                                  value={opts.idUsuario}
                                  disabled={!opts.activo}
                                >
                                  {opts.nombre}
                                </option>
                              ))}
                            <option className="no-vendedor" value="-1">
                              No recibió atención
                            </option>
                          </select>
                        </div>

                        <label className="label">Costo de envío:</label>
                        <div className="form-group-input desc-input">
                          <span className="input-group-text">
                            <CostoEnvioInput className="input-group-svg" />
                          </span>
                          <input
                            style={{
                              backgroundColor: "#d3d3d3",
                              cursor: "default",
                            }}
                            type="number"
                            step="1"
                            min={0}
                            className="input"
                            id="costoEnvio"
                            value={costoEnvio}
                            onChange={(event) => {
                              setCostoEnvio(event.target.value);
                            }}
                            readOnly
                          />
                        </div>

                        <label className="label selects" htmlFor="abono">
                          Medio de pago:
                        </label>
                        <div className="form-group-input nombre-input">
                          <span className="input-group-text">
                            <PaymentInput className="input-group-svg" />
                          </span>
                          <select
                            className="input"
                            style={{ cursor: "pointer" }}
                            name="abono"
                            id="abono"
                            value={abono}
                            onChange={(e) => setAbono(e.target.value)}
                          >
                            <option hidden key={0} value="0">
                              Seleccione un medio de pago
                            </option>

                            {listaAbonos &&
                              Array.from(listaAbonos).map((opts, i) => {
                                const shouldShowEnvio =
                                  (nombreEntrega
                                    .toLowerCase()
                                    .includes("local") &&
                                    opts.disponibilidad !== 2) ||
                                  (nombreEntrega
                                    .toLowerCase()
                                    .includes("domicilio") &&
                                    opts.disponibilidad !== 1) ||
                                  opts.disponibilidad === 3;

                                const shouldShowCatalogo =
                                  (tipo === 1 &&
                                    opts.disponibilidadCatalogo !== 2) ||
                                  (tipo === 2 &&
                                    opts.disponibilidadCatalogo !== 1) ||
                                  opts.disponibilidadCatalogo === 3;

                                const shouldShow =
                                  shouldShowEnvio && shouldShowCatalogo;

                                return shouldShow ? (
                                  <option
                                    className="btn-option"
                                    key={i}
                                    value={opts.idMetodoPago}
                                    disabled={!opts.habilitado}
                                  >
                                    {opts.nombre}
                                  </option>
                                ) : null;
                              })}
                          </select>
                        </div>
                      </div>

                      <div>
                        <div id="div-btn-update">
                          <button
                            className="btn btn-warning btn-edit-color"
                            id="btn-update"
                            onClick={UpdateOrder}
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
                        ClearOrderInputs();
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
                            ClearOrderInputs();
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

          <br />

          {/* modal con filtros */}
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
                <div className="modal-header2 wrap-modal">
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

                    <div
                      className="filter-btn-container"
                      data-bs-toggle="collapse"
                      href="#collapseCategory"
                      role="button"
                      aria-expanded="false"
                      aria-controls="collapseCategory"
                    >
                      <p className="filter-btn-name">TIPOS</p>

                      <div className="form-group-input">
                        <select
                          className="input2"
                          style={{ cursor: "pointer" }}
                          name="tipo"
                          id="tipo"
                          value={tipo}
                          onChange={(e) => {
                            setTipo(e.target.value);
                            filterResultType(e.target.value);
                          }}
                        >
                          <option hidden key={0} value="0">
                            Seleccione un tipo de pedido
                          </option>
                          <option className="btn-option" value="Minorista">
                            Minorista
                          </option>
                          <option className="btn-option" value="Mayorista">
                            Mayorista
                          </option>
                        </select>
                      </div>
                    </div>

                    <p className="filter-separator"></p>

                    <div
                      className="filter-btn-container"
                      data-bs-toggle="collapse"
                      href="#collapseCategory"
                      role="button"
                      aria-expanded="false"
                      aria-controls="collapseCategory"
                    >
                      <p className="filter-btn-name">VENDEDORES</p>
                      <div className="form-group-input">
                        <select
                          className="input2"
                          aria-label="Vendedor"
                          style={{ cursor: "pointer" }}
                          name="vendedor"
                          id="vendedor"
                          value={filtroVendedor}
                          onChange={(e) => {
                            setFiltroVendedor(e.target.value);
                            filterResultSeller(e.target.value);
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
                      </div>
                    </div>

                    <p className="filter-separator"></p>

                    <div
                      className="filter-btn-container"
                      data-bs-toggle="collapse"
                      href="#collapseCategory"
                      role="button"
                      aria-expanded="false"
                      aria-controls="collapseCategory"
                    >
                      <p className="filter-btn-name">F. ENTREGAS</p>
                      <div className="form-group-input">
                        <select
                          className="input2"
                          aria-label="Entrega"
                          style={{ cursor: "pointer" }}
                          name="entrega"
                          id="entrega"
                          value={filtroEntrega}
                          onChange={(e) => {
                            setFiltroEntrega(e.target.value);
                            filterResultShipment(e.target.value);
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
                      </div>
                    </div>

                    <p className="filter-separator"></p>

                    <div
                      className="filter-btn-container"
                      data-bs-toggle="collapse"
                      href="#collapseCategory"
                      role="button"
                      aria-expanded="false"
                      aria-controls="collapseCategory"
                    >
                      <p className="filter-btn-name">MEDIOS DE PAGO</p>
                      <div className="form-group-input">
                        <select
                          className="input2"
                          aria-label="Abono"
                          style={{ cursor: "pointer" }}
                          name="abono"
                          id="abono"
                          value={filtroAbono}
                          onChange={(e) => {
                            setFiltroAbono(e.target.value);
                            filterResultPayment(e.target.value);
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
                      </div>
                    </div>

                    <p className="filter-separator"></p>

                    <div className="filter-btn-container">
                      <p className="filter-btn-name">PENDIENTE</p>
                      <p className="filter-btn">
                        <input
                          type="checkbox"
                          className="form-check-input tick"
                          id="pending"
                          checked={pending}
                          onChange={() => {
                            setPending(!pending);
                            filterResultPending(pending);
                          }}
                        />
                        <label htmlFor="pending" className="lbl-switch"></label>
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

          {(orders.length > 0 ||
            (orders.length === 0 &&
              (pending === true ||
                tipo !== "" ||
                filtroVendedor !== "" ||
                filtroEntrega !== "" ||
                filtroAbono !== "" ||
                query !== ""))) && (
            <div className="filters-left2">
              <div className="pagination-count3">
                <div className="search-container">
                  <div className="form-group-input-search2">
                    <span className="input-group-text4" onClick={search}>
                      <Lupa className="input-group-svg lupa-catalogo" />
                    </span>
                    <input
                      className="search-input2"
                      type="text"
                      value={selectedQuery}
                      onChange={(e) => setSelectedQuery(e.target.value)}
                      placeholder="Buscar por ID..."
                    />
                  </div>
                </div>
              </div>

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

              {orders.length > 0 && isLoading === false && (
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
          )}

          {/* tabla de pedidos */}
          {isLoading ? (
            <div className="loading-generaltable-div">
              <Loader />
              <p className="bold-loading">Cargando pedidos...</p>
            </div>
          ) : (
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
                    Costo de envío
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Total
                  </th>
                  <th className="table-title table-title-orders" scope="col">
                    Abono
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
                  {(rolUsuario === "Supervisor" ||
                    rolUsuario === "SuperAdmin") && (
                    <th className="table-title table-title-orders" scope="col">
                      Acciones
                    </th>
                  )}
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
                          {order.idPedido}
                        </td>
                        <td className="table-name table-name-orders">
                          {order.tipo === "Mayorista" ? "Zeide" : "LGF"}
                        </td>
                        <td className="table-name table-name-orders">
                          {order.cliente}
                        </td>
                        <td
                          className={`table-name table-name-orders ${
                            order.entrega.includes("domicilio")
                              ? "domicilio"
                              : order.entrega.includes("local")
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
                              : order.entrega.includes("local")
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
                              {(rolUsuario === "Supervisor" ||
                                rolUsuario === "SuperAdmin") && (
                                <button
                                  type="button"
                                  className="btn btn-light btn-delete4"
                                  aria-label="Desverificar"
                                  onClick={() => {
                                    Pending(order);
                                  }}
                                >
                                  <Pendiente className="edit3" />
                                </button>
                              )}
                            </div>
                          </td>
                        ) : (
                          <td className="table-name table-name-orders">
                            <div className="status-btns">
                              <div className="circulo-pendiente"></div>
                              <p className="status-name">Pendiente</p>
                              {(rolUsuario === "Supervisor" ||
                                rolUsuario === "SuperAdmin") && (
                                <button
                                  type="button"
                                  className="btn btn-light btn-delete4"
                                  aria-label="Verificar"
                                  onClick={() => {
                                    Verify(order);
                                  }}
                                >
                                  <Verificar className="edit3" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                        {(rolUsuario === "Supervisor" ||
                          rolUsuario === "SuperAdmin") && (
                          <td className="table-name table-name-orders">
                            <button
                              type="button"
                              className="btn btn-warning btn-edit"
                              aria-label="Modificar"
                              data-bs-toggle="modal"
                              data-bs-target="#modal"
                              onClick={() => {
                                RetrieveOrderInputs(order);
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
                                    "Esta seguro de que desea eliminar el siguiente pedido: " +
                                    order.idPedido +
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
                                    DeleteOrder(order.idPedido);
                                  }
                                })
                              }
                            >
                              <Delete className="delete" />
                            </button>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  );
                })
              ) : (
                <tbody>
                  <tr className="tr-name1-orders">
                    <td className="table-name table-name1-orders" colSpan={15}>
                      Sin registros
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          )}

          {/* tabla de pedidos para Excel */}
          <table
            ref={tableRef}
            className="table table-dark table-list-none"
            align="center"
          >
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Tipo</th>
                <th scope="col">Cliente</th>
                <th scope="col">Entrega</th>
                <th scope="col">Vendedor</th>
                <th scope="col">Cantidad de productos</th>
                <th scope="col">Subtotal</th>
                <th scope="col">Costo de envío</th>
                <th scope="col">Total</th>
                <th scope="col">Abono</th>
                <th scope="col">Detalle</th>
                <th scope="col">Fecha</th>
                <th scope="col">Status</th>
              </tr>
            </thead>

            {orders.length > 0 ? (
              orders.map(function fn(order) {
                return (
                  <tbody key={1 + order.idPedido}>
                    <tr>
                      <td>{order.idPedido}</td>
                      <td>{order.tipo === "Mayorista" ? "Zeide" : "LGF"}</td>
                      <td>{order.cliente}</td>
                      <td>
                        {order.entrega}
                        {order.aclaracionEntrega
                          ? ` - ${order.aclaracionEntrega}`
                          : ""}
                      </td>
                      <td>{order.vendedor === null ? "-" : order.vendedor}</td>
                      <td>{order.cantidadProductos}</td>
                      <td>{order.subtotal.toLocaleString()}</td>
                      <td>{order.costoEnvio.toLocaleString()}</td>
                      <td>{order.total.toLocaleString()}</td>
                      <td>{order.abono}</td>
                      <td>{order.detalle}</td>
                      <td>{formatDate(order.fecha)}</td>
                      {order.verificado ? (
                        <td>Verificado</td>
                      ) : (
                        <td>Pendiente</td>
                      )}
                    </tr>
                  </tbody>
                );
              })
            ) : (
              <tbody>
                <tr>
                  <td colSpan={11}>Sin registros</td>
                </tr>
              </tbody>
            )}
          </table>

          {isLoading === false && (
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
          )}
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default OrderManager;
