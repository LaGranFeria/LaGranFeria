import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Chart from "react-apexcharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./OrderGraphics.css";

//#region SVG'S Imports
import { ReactComponent as Back } from "../../../../assets/svgs/back.svg";
import { ReactComponent as Lupa } from "../../../../assets/svgs/lupa.svg";
import { ReactComponent as Close } from "../../../../assets/svgs/closebtn.svg";
import { ReactComponent as Pdf } from "../../../../assets/svgs/pdf.svg";
import { ReactComponent as ShowBilling } from "../../../../assets/svgs/billing.svg";
//#endregion

import Loader from "../../../../components/Loaders/LoaderCircle";

import {
  GetOrdersDataByYear,
  GetOrdersDataByMonthYear,
} from "../../../../services/OrderService";

function OrderGraphics() {
  //#region Constantes
  const [isLoadingAnuales, setIsLoadingAnuales] = useState(false);
  const [isLoadingMensualesAnuales, setIsLoadingMensualesAnuales] =
    useState(false);

  const [año, setAño] = useState("");
  const [años, setAños] = useState([]);

  const [año2, setAño2] = useState("");
  const [mes, setMes] = useState("");

  const [añoSeleccionado, setAñoSeleccionado] = useState("");
  const [mesAñoSeleccionado, setMesAñoSeleccionado] = useState("");

  const [facturaciones, setFacturaciones] = useState([]);
  const [facturacionesSinEnvio, setFacturacionesSinEnvio] = useState([]);
  const [cantidades, setCantidades] = useState([]);
  const [busquedaPorAño, setBusquedaPorAño] = useState(false);

  const [productos, setProductos] = useState([]);
  const [cantidadesVendidas, setCantidadesVendidas] = useState([]);
  const [busquedaPorMesAño, setBusquedaPorMesAño] = useState(false);

  const [vendedores, setVendedores] = useState([]);
  const [cantidadVentas, setCantidadVentas] = useState([]);

  const [mesAño, setMesAño] = useState("");

  const [variable, setVariable] = useState("");
  const [variableSeleccionada, setVariableSeleccionada] = useState("");

  const mesAñoDate = new Date(mesAñoSeleccionado);
  const añoMostrar = mesAñoDate.getUTCFullYear();
  const mesMostrar = mesAñoDate.getUTCMonth() + 1;

  const [showBilling, setShowBilling] = useState(false);

  //#region Constantes para el grafico de barras (facturacion y ganancia por mes)
  const options = {
    chart: {
      type: "bar",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    title: {
      text: `Facturaciónes mensuales por año ${
        busquedaPorAño ? `(${año})` : ""
      }`,
      align: "left",
    },
    subtitle: {
      text: "Variación de las facturaciónes",
      align: "left",
    },
    xaxis: {
      categories: [
        "En",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Agto",
        "Sept",
        "Oct",
        "Nov",
        "Dic",
      ],
    },
    yaxis: {
      title: {
        text: "$ ( Pesos Argentinos )",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return "$ " + val;
        },
      },
    },
  };

  const series = [
    {
      name: "Facturación sin costos de envio",
      data: facturacionesSinEnvio,
    },
    {
      name: "Facturación total",
      data: facturaciones,
    },
  ];
  //#endregion

  //#region Constantes para el grafico de area (Cantidad depedidos por mes)
  const seriesPedidos = [
    {
      name: "Pedidos",
      data: cantidades,
    },
  ];

  const optionsPedidos = {
    chart: {
      type: "area",
      height: 350,
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: `Cantidad de pedidos mensuales por año ${
        busquedaPorAño ? `(${año})` : ""
      }`,
      align: "left",
    },
    subtitle: {
      text: "Variación de cantidad de pedidos",
      align: "left",
    },
    xaxis: {
      categories: [
        "En",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Agto",
        "Sept",
        "Oct",
        "Nov",
        "Dic",
      ],
    },
    yaxis: {
      opposite: true,
      title: {
        text: "Pedidos",
      },
    },
    legend: {
      horizontalAlign: "left",
    },
  };
  //#endregion

  //#region Constantes para el grafico de donut (pedidos por vendedor)
  const seriesVendedores = cantidadVentas;

  const optionsVendedores = {
    chart: {
      type: "donut",
    },
    title: {
      text:
        variable == 1
          ? `Porcentaje de facturaciones por vendedor ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : variable == 2
          ? `Porcentaje de ventas por vendedor ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : variable == ""
          ? `Porcentaje de ventas/facturaciones por vendedor ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : "",
      align: "left",
    },
    subtitle: {
      text: "Variación de los porcentajes por vendedores",
      align: "left",
    },
    labels: vendedores,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const seriesProductos = cantidadesVendidas;

  const optionsProductos = {
    chart: {
      type: "pie",
    },
    title: {
      text:
        variable == 1
          ? `Porcentaje de facturaciones por 5 productos más vendidos ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : variable == 2
          ? `Porcentaje de ventas por 5 productos más vendidos ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : variable == ""
          ? `Porcentaje de ventas/facturaciones 5 productos más vendidos ${
              busquedaPorMesAño ? `(${mesMostrar}/${añoMostrar})` : ""
            }`
          : "",
      align: "left",
    },
    subtitle: {
      text: "Variación de los porcentajes por productos",
      align: "left",
    },
    labels: productos.filter((producto) => producto !== null), // Filter out null values
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  //#endregion
  //#endregion

  //#region UseEffect
  useEffect(() => {
    const fetchData = async () => {
      const fechaActual = new Date();
      const añoActual = fechaActual.getUTCFullYear();
      const mesActual = fechaActual.getUTCMonth() + 1; // Adding 1 to get the correct month index (0-11)

      const añosArray = [];

      for (let año = 2024; año <= añoActual; año++) {
        añosArray.push(año);
      }

      setAños(añosArray);

      const mesAñoActual = `${añoActual}-${mesActual
        .toString()
        .padStart(2, "0")}`;
      setMesAño(mesAñoActual);
      setMesAñoSeleccionado(mesAñoActual);

      setVariableSeleccionada(1);

      setAño(añoActual);
      setAñoSeleccionado(añoActual);

      setAño2(añoActual);
      setMes(mesActual);
    };

    fetchData(); // Llamar a la función asíncrona interna
  }, []);
  //#endregion

  //#region Función para obtener los datos de facturación y pedidos por año
  const GetYearData = async () => {
    if (añoSeleccionado === "") {
      Swal.fire({
        icon: "warning",
        title: "Consulta vacía",
        text: "Ingrese un año para realizar la búsqueda.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else if (año === añoSeleccionado && busquedaPorAño === true) {
      Swal.fire({
        icon: "warning",
        title: "Año de búsqueda no cambiado",
        text: "El año de búsqueda es el mismo que el de la última consulta. Intente con un año diferente.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else {
      setAño(añoSeleccionado);

      setIsLoadingAnuales(true);
      try {
        const response = await GetOrdersDataByYear(añoSeleccionado);

        // Procesar la respuesta aquí si es necesario
        if (response.isSuccess && response.statusCode === 200) {
          setBusquedaPorAño(true);
          const facturacionesData = [];
          const facturacionesSinEnvioData = [];
          const cantidadesData = [];

          // Iterar sobre los datos de la respuesta para cada mes
          for (let i = 1; i <= 12; i++) {
            const facturacionMes = response[`facturacion${i}`];
            const facturacionSinEnvioMes = response[`facturacionSinEnvio${i}`];
            const cantidadMes = response[`cantidadPedidos${i}`];

            // Verificar si los datos son válidos antes de agregarlos al arreglo
            if (
              facturacionMes !== undefined &&
              facturacionSinEnvioMes !== undefined &&
              cantidadMes !== undefined
            ) {
              facturacionesData.push(facturacionMes);
              facturacionesSinEnvioData.push(facturacionSinEnvioMes);
              cantidadesData.push(cantidadMes);
            } else {
              console.error(`Los datos para el mes ${i} son inválidos.`);
            }
          }

          // Actualizar los estados con los datos procesados
          setFacturaciones(facturacionesData);
          setFacturacionesSinEnvio(facturacionesSinEnvioData);
          setCantidades(cantidadesData);
        } else if (
          response.errorMessage ===
          "No hay datos de pedidos verificados en el año seleccionado"
        ) {
          setIsLoadingAnuales(false);

          setFacturaciones([]);
          setFacturacionesSinEnvio([]);
          setCantidades([]);

          // Mostrar SweetAlert
          Swal.fire({
            icon: "warning",
            title: "No hay gráficos de pedidos",
            text: `No se encontraron gráficos de pedidos del año: ${añoSeleccionado}.`,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f8bb86",
          });

          setBusquedaPorAño(true);
        } else {
          setBusquedaPorAño(false);
          console.error("Error en la respuesta de GetOrdersDataByYear");
        }
        setIsLoadingAnuales(false);
      } catch (error) {
        setIsLoadingAnuales(false);
        console.error(
          "Error al obtener los datos de facturación y pedidos:",
          error
        );

        Swal.fire({
          icon: "warning",
          title: "Error al obtener los datos de facturación y pedidos",
          text: `No se pudieron cargar los gráficos.`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f8bb86",
        });
      }
    }
  };
  //#endregion

  //#region Función para obtener los datos de vendedores y productos por mes y año
  const GetMonthYearData = async () => {
    if (mesAñoSeleccionado === "" && variableSeleccionada === "") {
      Swal.fire({
        icon: "warning",
        title: "Fecha y variable vacías",
        text: "Ingrese un mes y año, y seleccione una variable para realizar la búsqueda.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else if (mesAñoSeleccionado === "") {
      Swal.fire({
        icon: "warning",
        title: "Fecha vacía",
        text: "Ingrese un mes y año para realizar la búsqueda.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else if (variableSeleccionada === "") {
      Swal.fire({
        icon: "warning",
        title: "Variable vacía",
        text: "Selecciones una variable para realizar la búsqueda.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else if (
      mesAño === mesAñoSeleccionado &&
      busquedaPorMesAño === true &&
      variable === variableSeleccionada
    ) {
      Swal.fire({
        icon: "warning",
        title: "Mes, año y variable de búsqueda no cambiados",
        text: "El mes, año y la variable de búsqueda son los mismos que los de la última consulta. Intente con un mes, año o variable diferente.",
        confirmButtonText: "Aceptar",
        showCancelButton: false,
        confirmButtonColor: "#f8bb86",
      });
    } else {
      setMesAño(mesAñoSeleccionado);
      setVariable(variableSeleccionada);

      setIsLoadingMensualesAnuales(true);

      const mesAñoDate = new Date(mesAñoSeleccionado);
      const añoApi = mesAñoDate.getUTCFullYear();
      const mesApi = mesAñoDate.getUTCMonth() + 1; // Adding 1 to get the correct month index (0-11)

      try {
        const response = await GetOrdersDataByMonthYear(
          mesApi,
          añoApi,
          variableSeleccionada
        );

        // Procesar la respuesta aquí si es necesario
        if (response.isSuccess && response.statusCode === 200) {
          setBusquedaPorMesAño(true);
          const productosData = [];
          const cantidadesVendidasData = [];

          // Obtener los vendedores y sus cantidades de ventas
          const vendedoresAPI = response.vendedores;

          // Iterar sobre los datos de la respuesta para cada mes
          for (let i = 1; i <= 6; i++) {
            const productosMes = response[`producto${i}`];
            const cantidadesVendidasMes =
              response[`cantidadVentasFacturacion${i}`];

            // Verificar si los datos son válidos antes de agregarlos al arreglo
            if (
              productosMes !== undefined &&
              cantidadesVendidasMes !== undefined
            ) {
              productosData.push(productosMes);
              cantidadesVendidasData.push(cantidadesVendidasMes);
            } else {
              console.error(`Los datos para el mes ${i} son inválidos.`);
            }
          }

          // Mapear los vendedores y sus cantidades de ventas a arreglos separados
          const vendedoresData = Object.keys(vendedoresAPI);
          const cantidadVentasData = Object.values(vendedoresAPI);

          // Actualizar los estados con los datos procesados
          setProductos(productosData);
          setCantidadesVendidas(cantidadesVendidasData);
          setVendedores(vendedoresData); // Guardar los nombres de los vendedores
          setCantidadVentas(cantidadVentasData); // Guardar las cantidades de ventas de los vendedores
        } else if (
          response.errorMessage ===
          "No hay datos de pedidos verificados en el mes y año seleccionado"
        ) {
          setIsLoadingMensualesAnuales(false);

          setProductos([]);
          setCantidadesVendidas([]);
          setVendedores([]);
          setCantidadVentas([]);

          // Mostrar SweetAlert
          Swal.fire({
            icon: "warning",
            title: "No hay gráficos de pedidos",
            text: `No se encontraron gráficos de pedidos relacionados a vendedores y productos del mes y año: ${mesApi}/${añoApi}.`,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f8bb86",
          });

          setBusquedaPorMesAño(true);
        } else {
          setBusquedaPorMesAño(false);
          console.error("Error en la respuesta de GetOrdersDataByMonthYear");
        }
        setIsLoadingMensualesAnuales(false);
      } catch (error) {
        setIsLoadingMensualesAnuales(false);
        console.error(
          "Error al obtener los datos de vendedores y productos:",
          error
        );

        Swal.fire({
          icon: "warning",
          title: "Error al obtener los datos de vendedores y productos",
          text: `No se pudieron cargar los gráficos.`,
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#f8bb86",
        });
      }
    }
  };
  //#endregion

  //#region Función para borrar los datos de facturación y pedidos por año
  const ClearYearData = () => {
    setFacturaciones([]);
    setFacturacionesSinEnvio([]);
    setCantidades([]);

    setAño("");
    setAñoSeleccionado("");

    setBusquedaPorAño(false);
  };
  //#endregion

  //#region Función para borrar los datos de vendedores y productos por mes y año
  const ClearMonthYearData = () => {
    setProductos([]);
    setCantidadesVendidas([]);
    setVendedores([]);
    setCantidadVentas([]);

    setMesAño("");
    setMesAñoSeleccionado("");

    setVariable("");
    setVariableSeleccionada("");

    setBusquedaPorMesAño(false);
  };
  //#endregion

  //#region Función para descargar gráficos en PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const generalGraphics = document.getElementById("pdf");

    const maxWidth = 1170;
    const isMaxWidth = window.innerWidth <= maxWidth;

    html2canvas(generalGraphics).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const width = isMaxWidth ? 80 : 190; // Ajusta la anchura según el ancho de la ventana
      const height = isMaxWidth ? 240 : 170; // Ajusta la altura según el ancho de la ventana

      doc.addImage(imgData, "PNG", 10, 10, width, height);
      doc.save("Gráficos.pdf");
    });
  };
  //#endregion

  //#region Return
  return (
    <div>
      <Helmet>
        <title>La Gran Feria | Gráficos de Pedidos</title>
      </Helmet>

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

              <h2 className="title title-general">Gráficos de Pedidos</h2>

              {(facturaciones.length > 0 ||
                cantidades.length > 0 ||
                cantidadesVendidas.length > 0 ||
                cantidadVentas.length > 0) && (
                <button
                  onClick={exportToPDF}
                  type="button"
                  className="btn btn-danger btn-excel"
                >
                  <div className="btn-add-content">
                    <Pdf className="excel" />
                    <p className="p-add">Descargar</p>
                  </div>
                </button>
              )}

              <button
                type="button"
                className={`btn btn-dark btn-show-billing ${!showBilling ? 'btn-highlight' : ''}`}
                title={showBilling ? "Ocultar montos" : "Ver montos"}
                onClick={() => {
                  setShowBilling(!showBilling);
                }}
              >
                <ShowBilling className={`show-orders ${!showBilling ? 'show-orders-seleccionado' : ''}`} />
              </button>
            </div>
          </div>

          <br />

          <div className="general-graphics" id="pdf">
            <div className="graphics-container">
              {isLoadingAnuales === true && (
                <div className="loading-graphics-div">
                  <Loader />
                  <p className="bold-loading">Cargando gráficos...</p>
                </div>
              )}
              <div className="filter-container-graphics">
                <p className="p-filter-date">Año:</p>
                <select
                  aria-label="Año"
                  className="year"
                  value={añoSeleccionado}
                  onChange={(e) => setAñoSeleccionado(e.target.value)}
                >
                  <option hidden value="">
                    YYYY
                  </option>

                  {años.map((año) => (
                    <option key={año} value={año}>
                      {año}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Buscar"
                  className={`tag ${
                    busquedaPorAño === true
                      ? "btn btn-light btn-search-dates filtro-activo"
                      : "btn btn-light btn-search-dates"
                  }`}
                  onClick={() => GetYearData()}
                >
                  <Lupa className="lupa-svg" />
                </button>

                {busquedaPorAño === true && (
                  <button
                    type="button"
                    aria-label="Cancelar busqueda"
                    className="btn btn-light btn-search-dates"
                    onClick={() => ClearYearData()}
                  >
                    <Close className="lupa-svg" />
                  </button>
                )}
              </div>

              <div className="anuales-container-graphics">
                {showBilling === true && (
                  <Chart
                    className="chart-anual-container"
                    options={options}
                    series={series}
                    type="bar"
                  />
                )}

                <Chart
                  className="chart-anual-container"
                  options={optionsPedidos}
                  series={seriesPedidos}
                  type="area"
                />
              </div>
            </div>

            <div className="graphics-container">
              {isLoadingMensualesAnuales === true && (
                <div className="loading-graphics-div">
                  <Loader />
                  <p className="bold-loading">Cargando gráficos...</p>
                </div>
              )}
              <div className="filter-container-graphics2">
                <div className="filter-container-div">
                  <p className="p-filter-date">Mes y Año:</p>
                  <input
                    className="year"
                    aria-label="Mes y año"
                    type="month"
                    min="2024-01" // Establece la fecha mínima a enero de 2024
                    max={new Date().toISOString().slice(0, 7)} // Establece la fecha máxima al mes y año actuales
                    value={mesAñoSeleccionado}
                    onChange={(e) => setMesAñoSeleccionado(e.target.value)}
                  />
                </div>

                <div className="filter-container-div2">
                  <div className="variable-select">
                    <p className="p-filter-date">Variable:</p>
                    <select
                      aria-label="Variable"
                      className="year"
                      value={variableSeleccionada}
                      onChange={(e) => setVariableSeleccionada(e.target.value)}
                    >
                      <option hidden value="">
                        Seleccione una variable
                      </option>

                      {showBilling === true && (
                        <option value="1">Importe de facturación</option>
                      )}

                      <option value="2">Cantidad de ventas</option>
                    </select>
                  </div>

                  <div className="div-btns">
                    <button
                      type="button"
                      aria-label="Buscar"
                      className={`tag ${
                        busquedaPorMesAño === true
                          ? "btn btn-light btn-search-dates filtro-activo"
                          : "btn btn-light btn-search-dates"
                      }`}
                      onClick={() => GetMonthYearData()}
                    >
                      <Lupa className="lupa-svg" />
                    </button>

                    {busquedaPorMesAño === true && (
                      <button
                        type="button"
                        aria-label="Cancelar busqueda"
                        className="btn btn-light btn-search-dates"
                        onClick={() => ClearMonthYearData()}
                      >
                        <Close className="lupa-svg" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="anuales-container-graphics">
                <Chart
                  className="chart-anual-container"
                  options={optionsVendedores}
                  series={seriesVendedores}
                  type="donut"
                />

                <Chart
                  className="chart-anual-container"
                  options={optionsProductos}
                  series={seriesProductos}
                  type="pie"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
  //#endregion
}

export default OrderGraphics;
