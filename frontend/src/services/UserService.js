import axios from "axios";

//#region Función para realizar el inicio de sesión del usuario
async function LoginUser(username, password) {
  try {
    const response = await axios.post("https://elzeide.somee.com/usuario/login", {
      username: username.includes("@") ? "" : username,
      email: username.includes("@") ? username : "",
      password: password,
    });

    if (response.data.statusCode === 200) {
      localStorage.setItem("token", response.data.token);
      return true; // Indica que el inicio de sesión fue exitoso
    } else {
      return response.data;
    }
  } catch (err) {
    throw err;
  }
}
//#endregion

//#region Función para obtener todos los usuarios
async function GetUsers() {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const result = await axios.get("https://elzeide.somee.com/usuario", { headers });
  const usuarios = result.data.usuarios || [];
  return usuarios;
}
//#endregion

//#region Función para obtener los usuarios con rol "Vendedor"
async function GetUsersSellers(state) {
  const result = await axios.get("https://elzeide.somee.com/usuario/vendedores");
  const vendedores = result.data.usuarios || [];
  state(vendedores);
}
//#endregion

//#region Función para obtener usuarios por un rol especifico para lista administrativa
async function GetUsersByRole(role) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const result = await axios.get(
    "https://elzeide.somee.com/usuario/manage/" + role,
    { headers }
  );
  const usuarios = result.data.usuarios || [];
  return usuarios;
}
//#endregion

//#region Función para guardar un usuario en la base de datos
async function SaveUsers(data, headers) {
  return axios.post("https://elzeide.somee.com/usuario", data, { headers });
}
//#endregion

//#region Función para guardar un usuario en la base de datos sin estar logueado
async function SaveUsersNotLogged(data) {
  return axios.post("https://elzeide.somee.com/usuario/nologueado", data);
}
//#endregion

//#region Función para actualizar un usuario en la base de datos
async function UpdateUsers(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/usuario/${id}`, data, { headers });
}
//#endregion

//#region Función para eliminar un usuario de la base de datos
async function DeleteUsers(id, headers) {
  return axios.delete(`https://elzeide.somee.com/usuario/${id}`, { headers });
}
//#endregion

//#region Función para verificar si existe el usuario/email
async function SearchUsers(data) {
  return axios.post("https://elzeide.somee.com/usuario/search", data);
}
//#endregion

//#region Función para verificar si el codigo de verificacion existe y coincide con el usuario
async function VerifyUsers(data) {
  return axios.post("https://elzeide.somee.com/usuario/verify", data);
}
//#endregion

//#region Función para actualizar la contraseña de un usuario no logueado
async function UpdatePasswordNotLoggedUsers(data) {
  return axios.put("https://elzeide.somee.com/usuario", data);
}
//#endregion

//#region Función para actualizar la contraseña de un usuario logueado
async function UpdatePasswordUsers(data, headers) {
  return axios.put("https://elzeide.somee.com/usuario/reset", data, { headers });
}
//#endregion

//#region Función para activar o descativar la cuenta de un usuario
async function UpdateUsersActive(id, data, headers) {
  return axios.patch(`https://elzeide.somee.com/usuario/${id}`, data, { headers });
}
//#endregion

//#region Export
export {
  LoginUser,
  GetUsers,
  GetUsersSellers,
  GetUsersByRole,
  SaveUsers,
  SaveUsersNotLogged,
  UpdateUsers,
  DeleteUsers,
  SearchUsers,
  VerifyUsers,
  UpdatePasswordNotLoggedUsers,
  UpdatePasswordUsers,
  UpdateUsersActive,
};
//#endregion
