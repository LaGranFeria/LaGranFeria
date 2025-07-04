import axios from "axios";

//#region Función para obtener todas las formas de entrega para el catalogo
async function GetFormasEntrega() {
  const result = await axios.get("https://elzeide.somee.com/envio");
  return result.data;
}
//#endregion

//#region Función para obtener todas las formas de entrega para el catalogo para la lista administrativa
async function GetFormasEntregaManage() {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const result = await axios.get("https://elzeide.somee.com/envio/manage", {
    headers,
  });
  const formasEntrega = result.data.envios || [];
  return formasEntrega;
}
//#endregion

//#region Función para guardar una forma de entrega en la base de datos
async function SaveFormaEntrega(data, headers) {
  return axios.post("https://elzeide.somee.com/envio", data, { headers });
}
//#endregion

//#region Función para actualizar una forma de entrega en la base de datos
async function UpdateFormaEntrega(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/envio/${id}`, data, {
    headers,
  });
}
//#endregion

//#region Función para eliminar una forma de entrega de la base de datos
async function DeleteFormaEntrega(id, headers) {
  return axios.delete(`https://elzeide.somee.com/envio/${id}`, { headers });
}
//#endregion

//#region Export
export {
  GetFormasEntrega,
  GetFormasEntregaManage,
  SaveFormaEntrega,
  UpdateFormaEntrega,
  DeleteFormaEntrega,
};
//#endregion
