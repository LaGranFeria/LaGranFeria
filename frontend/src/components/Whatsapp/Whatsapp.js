import React, { useContext, useEffect, useState } from "react";

import "../Whatsapp/Whatsapp.css";

import { Context } from "../../common/Context";

import { ReactComponent as Whatsapplogo } from "../../assets/svgs/whatsapp.svg";

function WhatsApp() {
  const { whatsapp } = useContext(Context);

  const [isMinorista, setIsMinorista] = useState(false);

   useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes("minorista")) {
       setIsMinorista(true);
    }
  }, []);

  // Si el número no está disponible, retorna null o un componente de carga
  if (!whatsapp || whatsapp === "0") {
    return null; // Puedes retornar un componente de carga si prefieres
  }

  return (
    <a
      href={`https://wa.me/${isMinorista ? "3513858870" : whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="js-btn-fixed-bottom btn-whatsapp"
      aria-label="Comunicate por WhatsApp"
    >
      {" "}
      <Whatsapplogo />
    </a>
  );
}

export default WhatsApp;
