import axios from "axios";

//#region Función para obtener los pedidos para la lista administrativa con filtros opcionales de Type y Pending
async function GetOrders(
  Type = null,
  Seller = null,
  Shipment = null,
  Payment = null,
  Status = null
) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  let url = "https://elzeide.somee.com/pedido";

  // Agregar los parámetros de los filtros opcionales a la URL si están presentes
  if (Type !== null) {
    url += `?Type=${Type}`;
  }
  if (Seller !== null) {
    url += `&Seller=${Seller}`;
  }
  if (Shipment !== null) {
    url += `&Shipment=${Shipment}`;
  }
  if (Payment !== null) {
    url += `&Payment=${Payment}`;
  }
  if (Status !== null) {
    url += `&Status=${Status}`;
  }

  const result = await axios.get(url, { headers });
  const pedidos = result.data.pedidos || [];
  return pedidos;
}
//#endregion

//#region Función para obtener un pedido por su ID para la lista administrativa
async function GetOrderById(id) {
  const token = localStorage.getItem("token"); // Obtener el token almacenado en el localStorage
  const headers = {
    Authorization: `Bearer ${token}`, // Agregar el encabezado Authorization con el valor del token
  };

  const response = await axios.get(`https://elzeide.somee.com/pedido/id/${id}`, {
    headers,
  });
  return response.data;
}
//#endregion

//#region Función para obtener el ID de un pedido por su Payment ID
async function GetOrderIdByPaymentId(paymentId) {
  const response = await axios.get(
    `https://elzeide.somee.com/pedido/paymentId/${paymentId}`
  );
  return response.data;
}
//#endregion

//#region Función para obtener los pedidos verificados por fecha con filtros opcionales
async function GetVerifiedOrdersByDate(
  fechaDesde,
  fechaHasta,
  IdVendedor = null,
  IdTipoPedido = null,
  IdMetodoEntrega = null,
  IdMetodoPago = null
) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  let url = `https://elzeide.somee.com/pedido/${fechaDesde}/${fechaHasta}`;

  // Agregar los parámetros de los filtros opcionales a la URL si están presentes
  if (IdVendedor !== null) {
    url += `?IdVendedor=${IdVendedor}`;
  }
  if (IdTipoPedido !== null) {
    url += `&IdTipoPedido=${IdTipoPedido}`;
  }
  if (IdMetodoEntrega !== null) {
    url += `&IdMetodoEntrega=${IdMetodoEntrega}`;
  }
  if (IdMetodoPago !== null) {
    url += `&IdMetodoPago=${IdMetodoPago}`;
  }

  const result = await axios.get(url, { headers });

  return result.data;
}
//#endregion

//#region Función para obtener los datos para los graficos de pedidos por año
async function GetOrdersDataByYear(anio) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const result = await axios.get(`https://elzeide.somee.com/pedido/${anio}`, {
    headers,
  });

  return result.data;
}
//#endregion

//#region Función para obtener los datos para los graficos de pedidos por año y mes
async function GetOrdersDataByMonthYear(mes, anio, variable) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const result = await axios.get(
    `https://elzeide.somee.com/pedido/fecha/${mes}/${anio}/${variable}`,
    {
      headers,
    }
  );

  return result.data;
}
//#endregion

//#region Función para guardar un pedido en la base de datos
async function SaveOrders(data) {
  return axios.post("https://elzeide.somee.com/pedido", data);
}
//#endregion

//#region Función para actualizar un pedido en la base de datos
async function UpdateOrders(id, data, headers) {
  return axios.put(`https://elzeide.somee.com/pedido/${id}`, data, { headers });
}
//#endregion

//#region Función para actualizar el estado de verificado de un pedido en la base de datos
async function UpdateOrdersVerified(id, data, headers) {
  return axios.patch(`https://elzeide.somee.com/pedido/${id}`, data, { headers });
}
//#endregion

//#region Función para eliminar un pedido de la base de datos
async function DeleteOrders(id, headers) {
  return axios.delete(`https://elzeide.somee.com/pedido/${id}`, { headers });
}
//#endregion

//#region Export
export {
  GetOrders,
  GetOrderById,
  GetOrderIdByPaymentId,
  GetVerifiedOrdersByDate,
  GetOrdersDataByYear,
  GetOrdersDataByMonthYear,
  SaveOrders,
  UpdateOrders,
  UpdateOrdersVerified,
  DeleteOrders,
};
//#endregion
