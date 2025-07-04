import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Context } from "../../../common/Context";

import Loader from "../../../components/Loaders/LoaderCircle";

import ReactImageMagnify from "react-image-magnify";

import "./Product.css";

import { ReactComponent as NoProductSvg } from "../../../assets/svgs/noproducts.svg";
import { ReactComponent as Whatsapplogo } from "../../../assets/svgs/whatsapp.svg";
import { ReactComponent as Promocion } from "../../../assets/svgs/promocion.svg";
import { ReactComponent as Destacado } from "../../../assets/svgs/destacado.svg";
import { ReactComponent as Back } from "../../../assets/svgs/back.svg";

import { GetProductById } from "../../../services/ProductService";

function Product() {
  const {
    whatsapp,
    setCategoria,
    setSubcategoria,
    setPromocion,
    setDestacado,
  } = useContext(Context);

  const params = useParams();
  const [product, setProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log(product.nombre);

  useEffect(() => {
    (async () => {
      try {
        const productById = await GetProductById(params.id, 1);
        setProduct(productById);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false); // Establece isLoading en false cuando se completa la carga del producto
      }
    })();
  }, [params.id]);

  if (isLoading === true) {
    return (
      <div className="loading-single-product">
        <Loader />
        <p>Cargando producto...</p>
      </div>
    );
  } else if (product.nombre === undefined || product.nombre === null) {
    return (
      <div>
        <Helmet>
          <title>La Gran Feria | Producto no encontrado</title>
        </Helmet>
        <section id="products" className="products-container2">
          <div className="products-content">
            <div className="product-svg">
              <NoProductSvg />
            </div>
            <h2 className="title-no mb2">
              No se ha encontrado el producto que busca.
            </h2>
            <Link to="/ecommerce" className="btn btn-info btn-back">
              <div className="btn-back-content">
                <Back className="back" />
                <p className="p-back">Ver productos</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    );
  } else {
    return (
      <div>
        <Helmet>
          <title>La Gran Feria | {product.nombre}</title>
        </Helmet>

        <section id="product" className="products-container">
          <div className="products-content">
            <div className="filter-products-container2">
              <div className="product-info">
                <Link
                  className="link-products"
                  to="/ecommerce"
                  onClick={() => {
                    setCategoria(null);
                    setSubcategoria(null);
                    setPromocion(null);
                    setDestacado(null);
                  }}
                >
                  Productos
                </Link>
                <p className="separator"> / </p>
                <Link
                  className="link-products"
                  to="/ecommerce"
                  onClick={() => {
                    setCategoria(product.nombreCategoria);
                    setSubcategoria(null);
                    setPromocion(null);
                    setDestacado(null);
                  }}
                >
                  {product.nombreCategoria}
                </Link>
                {product.nombreSubcategoria && (
                  <>
                    <p className="separator"> / </p>
                    <Link
                      className="link-products"
                      to="/ecommerce"
                      onClick={() => {
                        setCategoria(null);
                        setSubcategoria(product.nombreSubcategoria);
                        setPromocion(null);
                        setDestacado(null);
                      }}
                    >
                      {product.nombreSubcategoria}
                    </Link>
                  </>
                )}
                <p className="separator"> / </p>
                <p className="selected">{product.nombre}</p>
              </div>

              <div className="info-photo">
                <div className="product-left">
                  <ReactImageMagnify
                    className="magnify"
                    {...{
                      smallImage: {
                        alt: "Producto",
                        width: 400,
                        height: 400,
                        src:
                          product.urlImagen ||
                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                      },
                      largeImage: {
                        src:
                          product.urlImagen ||
                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                        width: 1500,
                        height: 1500,
                      },
                    }}
                  />

                  <ReactImageMagnify
                    className="magnify2"
                    {...{
                      smallImage: {
                        alt: "Producto",
                        width: 300,
                        height: 300,
                        src:
                          product.urlImagen ||
                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                      },
                      largeImage: {
                        src:
                          product.urlImagen ||
                          "https://yourfiles.cloud/uploads/98310f0d0f14ff456c3886d644d438b6/vacio.jpg",
                        width: 1600,
                        height: 1600,
                      },
                    }}
                  />
                </div>

                <div className="product-right">
                  <h2 className="product-title-ind">{product.nombre}</h2>
                  <div className="product-info-cont">
                    <p className="categoria-producto">
                      <Link
                        className="no-underline"
                        to="/ecommerce"
                        onClick={() => {
                          setCategoria(product.nombreCategoria);
                          setSubcategoria(null);
                          setPromocion(null);
                          setDestacado(null);
                        }}
                      >
                        {product.nombreCategoria}
                      </Link>
                    </p>

                    {product.enPromocion === true ? (
                      <p className="promocion-btn">
                        <Link
                          className="no-underline"
                          to="/ecommerce"
                          onClick={() => {
                            setCategoria(null);
                            setSubcategoria(null);
                            setPromocion(true);
                            setDestacado(null);
                          }}
                        >
                          <span className="sale-tag">
                            <Promocion className="input-group-svg-white2" />
                            EN PROMOCIÓN
                          </span>
                        </Link>
                      </p>
                    ) : (
                      <></>
                    )}

                    {product.enDestacado === true ? (
                      <p>
                        <Link
                          className="no-underline"
                          to="/ecommerce"
                          onClick={() => {
                            setCategoria(null);
                            setSubcategoria(null);
                            setPromocion(null);
                            setDestacado(true);
                          }}
                        >
                          <span className="destacado-tag">
                            <Destacado className="input-group-svg-white2" />
                            DESTACADO
                          </span>
                        </Link>
                      </p>
                    ) : (
                      <></>
                    )}

                    <p className="product-desc-ind">{product.descripcion}</p>

                    <button className="product-wpp-btn">
                      <a
                        className="btn-wpp"
                        href={`https://wa.me/${whatsapp}/?text=Hola%21%20Tengo%20una%20consulta%20sobre%20${
                          product.nombre
                        }${
                          product.urlImagen ? `... (${product.urlImagen})` : ""
                        }`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Whatsapplogo className="svg-wpp" />
                        Consultar por WhatsApp
                      </a>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Product;
