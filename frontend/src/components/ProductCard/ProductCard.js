import React from "react";
import Swal from "sweetalert2";

import { ReactComponent as Zoom } from "../../assets/svgs/zoom.svg";

import "../../pages/frontOffice/Catalogue/Catalogue.css";

const ProductCard = ({ product, dark }) => {
  return (
    <div className={`contenedor-producto ${dark ? "oscuro" : ""}`}>
      <div className="product">
        <div className="product-1-col">
          <figure className="figure">
            <Zoom
              className="zoom"
              onClick={() => {
                Swal.fire({
                  title: product.nombre,
                  imageUrl: `${product.urlImagen ||
                    "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"}`,
                  imageWidth: 400,
                  imageHeight: 400,
                  imageAlt: "Vista Producto",
                  confirmButtonColor: "#6c757d",
                  confirmButtonText: "Cerrar",
                  focusConfirm: true,
                });
              }}
            />
            <img
              src={product.urlImagen ||
                "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg"}
              className="product-img"
              alt="Producto"
            />
          </figure>
        </div>
        <div className="product-2-col">
          <h3 className="product-title">{product.nombre}</h3>
          <h3 className="product-desc">
            <pre className="pre">{product.descripcion}</pre>
          </h3>
        </div>
        <div className="product-3-col"></div>
      </div>
    </div>
  );
};

export default ProductCard;
