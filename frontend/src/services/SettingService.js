import axios from "axios";

//#region Función para obtener las configuraciones del zeide
async function GetInfoConfiguracionZeide() {
  const result = await axios.get("https://elzeide.somee.com/configuracion");
  return  result.data
}
//#endregion

//#region Función para obtener las configuraciones del zeide
async function GetInfoConfiguracionLaGranFeria() {
  const result = await axios.get("https://elzeide.somee.com/configuraciondos");
  return  result.data
}
//#endregion

//#region Función para actualizar la configuracion en la base de datos
async function UpdateConfiguracionLaGranFeria(data, headers) {
  return axios.put("https://elzeide.somee.com/configuraciondos", data, { headers });
}
//#endregion

//#region Export
export { GetInfoConfiguracionZeide, GetInfoConfiguracionLaGranFeria, UpdateConfiguracionLaGranFeria };
//#endregion
