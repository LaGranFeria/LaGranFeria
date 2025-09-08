import React from "react";

import "./Loader.css";

import loadergif from "../../assets/images/loader.gif";
import loadergifMinorista from "../../assets/images/loaderMinorista.gif";

export default function Loader() {
  const pathname = window.location.pathname.toLowerCase();
  const isMinorista = pathname.includes("minorista");

  return (
    <div className="loading-container">
      <img
        className="loader"
        src={isMinorista ? loadergifMinorista : loadergif}
        alt="Cargando..."
      />
    </div>
  );
}