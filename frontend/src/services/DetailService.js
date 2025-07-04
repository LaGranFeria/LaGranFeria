import axios from "axios";

//#region Función para obtener detalles de stock por ID de producto
async function GetDetailsById(id) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const response = await axios.get(`https://elzeide.somee.com/stock/${id}`, {
    headers,
  });
  return response.data;
}
//#endregion

//#region Función para guardar un detalle de stock en la base de datos
async function SaveStockDetail(data, headers) {
  return axios.post("https://elzeide.somee.com/stock", data, { headers });
}
//#endregion

export { GetDetailsById, SaveStockDetail };
