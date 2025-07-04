import React from "react";

import "./Mantenimiento.css";

import { ReactComponent as MantenimientoSvg } from "../../assets/svgs/mantenimiento.svg";

function Mantenimiento() {
  return (
    <div>
      <section id="notfound" className="notfound-container">
        <div className="notfound-content">
          <div className="error-title">
            <div className="warning">
              <MantenimientoSvg />
            </div>
            <h2 className="error">¡Página en mantenimiento!</h2>
          </div>
          <h2 className="title-error">Estamos realizando mejoras.</h2>
          <p className="title-no">Lamentamos las molestias.</p>
        </div>
      </section>
    </div>
  );
}

export default Mantenimiento;
