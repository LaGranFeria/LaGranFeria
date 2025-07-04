import axios from "axios";

//#region Función para obtener los productos para la lista administrativa con filtros opcionales de Query, Category y Hidden
async function GetProductsManage(Query = null, Category = null, Hidden = null, Stock = null, Subcategory = null) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  let url = "https://elzeide.somee.com/producto/manage";

  // Agregar los parámetros de los filtros opcionales a la URL si están presentes
  if (Query !== null) {
    url += `?Query=${Query}`;
  }
  if (Category !== null) {
    url += `&Category=${Category}`;
  }
  if (Hidden !== null) {
    url += `&Hidden=${Hidden}`;
  }
  if (Stock !== null) {
    url += `&Stock=${Stock}`;
  } 
  if (Subcategory !== null) {
    url += `&Subcategory=${Subcategory}`;
  }

  const result = await axios.get(url, { headers });
  const productos = result.data.productos || [];
  return productos;
}
//#endregion

//#region Función para obtener los productos para el ecommerce con filtros opcionales de Query, Category y subcategory
async function GetProductsEcommerce(Query = null, Category = null, Subcategory = null) {
  let url = "https://elzeide.somee.com/producto/ecommerce";

  // Agregar los parámetros de los filtros opcionales a la URL si están presentes
  if (Query !== null) {
    url += `?Query=${Query}`;
  }
  if (Category !== null) {
    url += `&Category=${Category}`;
  }
  if (Subcategory !== null) {
    url += `&Subcategory=${Subcategory}`;
  }

  const result = await axios.get(url);
  const productos = result.data.productos || [];
  return productos;
}
//#endregion

//#region Funcion para obtener todos los productos por categoria
async function GetProductsByCategory(category, client) {
  const result = await axios.get(
    "https://elzeide.somee.com/producto/categoria/" + category + "/" + client
  );
  return result.data.productos || [];
}
//#endregion

//#region Funcion para obtener todos los productos por categoria
async function GetProductsBySubcategory(idCategory, idSubcategory, client) {
  const result = await axios.get(
    "https://elzeide.somee.com/producto/subcategoria/" +
      idCategory +
      "/" +
      idSubcategory +
      "/" +
      client
  );
  return result.data.productos || [];
}
//#endregion

//#region Funcion para obtener todos los productos por query
async function GetProductsByQuery(query, client) {
  const result = await axios.get(
    "https://elzeide.somee.com/producto/query/" + query + "/" + client
  );
  return result.data.productos || [];
}
//#endregion

//#region Función para obtener un producto por su ID
async function GetProductById(id, client) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const response = await axios.get(
    `https://elzeide.somee.com/producto/${id}/${client}`,
    {
      headers,
    }
  );
  return response.data;
}
//#endregion

//#region Función para guardar un producto en la base de datos
async function SaveProducts(data, headers) {
  return axios.post("https://elzeide.somee.com/producto", data, { headers });
}
//#endregion

//#region Función para actualizar un producto en la base de datos
async function UpdateProducts(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/producto/${id}`, data, { headers });
}
//#endregion

//#region Función para actualizar el stock de los productos
async function UpdateProductsStock(id, data, headers) {
  return axios.patch(`https://elzeide.somee.com/producto/${id}`, data, {
    headers,
  });
}
//#endregion

//#region Función para eliminar un producto de la base de datos
async function DeleteProducts(id, headers) {
  return axios.delete(`https://elzeide.somee.com/producto/${id}`, { headers });
}
//#endregion

//#region Export
export {
  GetProductsManage,
  GetProductsEcommerce,
  GetProductsByCategory,
  GetProductsBySubcategory,
  GetProductsByQuery,
  GetProductById,
  SaveProducts,
  UpdateProducts,
  UpdateProductsStock,
  DeleteProducts
};
//#endregion
