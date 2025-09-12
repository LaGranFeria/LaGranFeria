import axios from "axios";

//#region Función para obtener las subcategorías para la lista administrativa
async function GetSubcategoriesByCategoryManage(idCategory) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const result = await axios.get(
    "https://elzeide.somee.com/subcategoria/manage/categoria/" + idCategory,
    {
      headers,
    }
  );
  const subcategorias = result.data.subcategorias || [];
  return subcategorias;
}
//#endregion

//#region Función para obtener subcategorías por categoría y tipo de cliente
async function GetSubcategoriesByCategory(idCategory, clientType) {
  try {
    const { data } = await axios.get(
      `https://elzeide.somee.com/subcategoria/categoria/${idCategory}/${clientType}`
    );
    return data?.subcategorias ?? [];
  } catch (e) {
    console.error("GetSubcategoriesByCategory error:", e);
    return [];
  }
}
//#endregion

//#region Función para guardar una subcategoría en la base de datos
async function SaveSubcategories(data, headers) {
  return axios.post("https://elzeide.somee.com/subcategoria", data, { headers });
}
//#endregion

//#region Función para actualizar una subcategoría en la base de datos
async function UpdateSubcategories(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/subcategoria/${id}`, data, {
    headers,
  });
}
//#endregion

//#region Función para eliminar una subcategoría de la base de datos
async function DeleteSubcategories(id, headers) {
  return axios.delete(`https://elzeide.somee.com/subcategoria/${id}`, { headers });
}
//#endregion

//#region Export
export {
  GetSubcategoriesByCategoryManage,
  GetSubcategoriesByCategory,
  SaveSubcategories,
  UpdateSubcategories,
  DeleteSubcategories,
};
//#endregion
