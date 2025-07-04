import axios from "axios";

//#region Función para obtener las categorías para la lista administrativa
async function GetCategoriesManage() {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const result = await axios.get("https://elzeide.somee.com/categoria/manage", {
    headers,
  });
  const categorias = result.data.categorias || [];
  return categorias;
}
//#endregion

//#region Función para obtener todas los categorías para el catalogo
async function GetCategories(state) {
  const result = await axios.get("https://elzeide.somee.com/categoria");
  state(result.data.categorias);
}
//#endregion

//#region Función para obtener todas los categorías para el catalogo minorista
async function GetCategoriesMinorista(state) {
  const result = await axios.get("https://elzeide.somee.com/categoria/minorista");
  state(result.data.categorias);
}
//#endregion

//#region Función para obtener todas los categorías para el catalogo mayorista
async function GetCategoriesMayorista(state) {
  const result = await axios.get("https://elzeide.somee.com/categoria/mayorista");
  state(result.data.categorias);
}
//#endregion

//#region Función para obtener una categoría por su ID
async function GetCategoryById(id) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const response = await axios.get(`https://elzeide.somee.com/categoria/id/${id}`, {
    headers,
  });
  return response.data;
}
//#endregion

//#region Función para guardar una categoría en la base de datos
async function SaveCategories(data, headers) {
  return axios.post("https://elzeide.somee.com/categoria", data, { headers });
}
//#endregion

//#region Función para actualizar una categoría en la base de datos
async function UpdateCategories(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/categoria/${id}`, data, { headers });
}
//#endregion

//#region Función para eliminar una categoría de la base de datos
async function DeleteCategories(id, headers) {
  return axios.delete(`https://elzeide.somee.com/categoria/${id}`, { headers });
}
//#endregion

//#region Export
export {
  GetCategoriesManage,
  GetCategories,
  GetCategoriesMinorista,
  GetCategoriesMayorista,
  GetCategoryById,
  SaveCategories,
  UpdateCategories,
  DeleteCategories
};
//#endregion
