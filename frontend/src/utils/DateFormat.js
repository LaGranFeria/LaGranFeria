const formatNumber = (number) => {
  return number.toString().padStart(2, "0");
};

//#region Función para formatear la fecha
const formatDate = (dateString) => {
  // Crea un objeto de fecha a partir de la cadena ISO 8601
  const fecha = new Date(dateString);

  // Obtiene los componentes de la fecha y hora
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1; // Suma 1 porque los meses en JavaScript van de 0 a 11
  const anio = fecha.getFullYear();
  const hora = fecha.getHours();
  const minutos = fecha.getMinutes();

  // Formatea los componentes de la fecha y hora con ceros a la izquierda
  const formattedDia = dia.toString().padStart(2, "0");
  const formattedMes = mes.toString().padStart(2, "0");

  // Formatea la fecha en el formato deseado, utilizando formatNumber para los minutos
  return `${formattedDia}/${formattedMes}/${anio} - ${formatNumber(
    hora
  )}:${formatNumber(minutos)}`;
};
//#endregion

export { formatDate };
