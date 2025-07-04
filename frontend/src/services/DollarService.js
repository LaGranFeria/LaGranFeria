import axios from "axios";

//#region Función para obtener unicamente la cotización del dolar
async function GetCotizacionDolarUnicamente(state) {
  const result = await axios.get("https://elzeide.somee.com/cotizacion");
  state(result.data.precio);
}
//#endregion

//#region Función para obtener la cotización del dolar y su id
async function GetCotizacionDolar(state) {
  const result = await axios.get("https://elzeide.somee.com/cotizacion");
  state(result.data);
}
//#endregion

//#region Función para actualizar la cotización del dolar en la base de datos
async function UpdateCotizacionDolar(data, headers) {
  return axios.put("https://elzeide.somee.com/cotizacion", data, { headers });
}
//#endregion

//#region Función para obtener las cotizaciones y fecha del dolar blue en tiempo real (consumo de API externa)
async function GetCotizacionFechaDolarBlue(state) {
  const result = await axios.get("https://api.bluelytics.com.ar/v2/latest");
  return result.data;
}
//#endregion

//#region Export
export {
  GetCotizacionDolar,
  UpdateCotizacionDolar,
  GetCotizacionDolarUnicamente,
  GetCotizacionFechaDolarBlue,
};
//#endregion
