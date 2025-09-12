import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../common/Context";

import "./Footer.css";

import Facebook from "../../assets/images/facebook.png";
import Instagram from "../../assets/images/instagram.png";

let today = new Date();
let year = today.getFullYear();

function Footer() {
  const { direccionAuto } = useContext(Context);
  const { urlDireccionAuto } = useContext(Context);

  const { telefonoEmpresa } = useContext(Context);

  const { facebook } = useContext(Context);
  const { urlFacebook } = useContext(Context);

  const { instagram } = useContext(Context);
  const { urlInstagram } = useContext(Context);

  const [isMinorista, setIsMinorista] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes("minorista")) {
      setIsMinorista(true);
    }
  }, []);

  const fbName = isMinorista ? "La Gran Feria" : facebook;
  const fbUrl = isMinorista
    ? "https://www.facebook.com/p/La-Gran-Feria-100063696833813"
    : urlFacebook;

  const igName = isMinorista ? "lagranferia.ok" : instagram;
  const igUrl = isMinorista
    ? "https://www.instagram.com/lagranferia.ok"
    : urlInstagram;

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-content-section-global">
          <div className="footer-content-section">
            <div className="footer-content-section">
              {((fbName && fbName !== "") || (igName && igName !== "")) && (
                <div className="social-media">
                  {fbName && fbName !== "" && (
                    <div className="footer-content-section-left-social">
                      <a
                        href={fbUrl ? fbUrl : "#"}
                        target={fbUrl ? "_blank" : ""}
                        rel={fbUrl ? "noopener noreferrer" : ""}
                      >
                        <img
                          src={Facebook}
                          alt="Facebook"
                          className="social-photo"
                        />
                      </a>
                      <p className="social-title">
                        <a
                          className="social-title"
                          href={fbUrl ? fbUrl : "#"}
                          target={fbUrl ? "_blank" : ""}
                          rel={fbUrl ? "noopener noreferrer" : ""}
                        >
                          {fbName}
                        </a>
                      </p>
                    </div>
                  )}

                  {igName && igName !== "" && (
                    <div className="footer-content-section-left-social">
                      <a
                        className="social-title"
                        href={igUrl ? igUrl : "#"}
                        target={igUrl ? "_blank" : ""}
                        rel={igUrl ? "noopener noreferrer" : ""}
                      >
                        <img
                          src={Instagram}
                          alt="Instagram"
                          className="social-photo"
                        />
                      </a>
                      <p className="social-title">
                        <a
                          className="social-title"
                          href={igUrl ? igUrl : "#"}
                          target={igUrl ? "_blank" : ""}
                          rel={igUrl ? "noopener noreferrer" : ""}
                        >
                          {igName}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {((direccionAuto && direccionAuto !== "") ||
                (telefonoEmpresa && telefonoEmpresa !== "")) && (
                <div className="footer-nores">
                  <p className="info-text">
                    {direccionAuto && direccionAuto !== "" && (
                      <a
                        className="address"
                        href={urlDireccionAuto ? urlDireccionAuto : "#"}
                        target={urlDireccionAuto ? "_blank" : ""}
                        rel={urlDireccionAuto ? "noopener noreferrer" : ""}
                      >
                        {direccionAuto}
                      </a>
                    )}

                    {direccionAuto &&
                      direccionAuto !== "" &&
                      telefonoEmpresa &&
                      telefonoEmpresa !== "" && <> - </>}

                    {telefonoEmpresa && telefonoEmpresa !== "" && (
                      <a
                        className="address"
                        href={`tel:${
                          isMinorista ? "3513858870" : telefonoEmpresa
                        }`}
                      >
                        {isMinorista ? "3513858870" : telefonoEmpresa}
                      </a>
                    )}
                  </p>
                </div>
              )}

              <div className="footer-res">
                <p className="info-text">
                  {direccionAuto && direccionAuto !== "" && (
                    <a
                      className="address"
                      href={urlDireccionAuto ? urlDireccionAuto : "#"}
                      target={urlDireccionAuto ? "_blank" : ""}
                      rel={urlDireccionAuto ? "noopener noreferrer" : ""}
                    >
                      {direccionAuto}
                    </a>
                  )}
                </p>
                <p className="info-text">
                  {telefonoEmpresa && telefonoEmpresa !== "" && (
                    <a
                      className="address"
                      href={`tel:${
                        isMinorista ? "3513858870" : telefonoEmpresa
                      }`}
                    >
                      {isMinorista ? "3513858870" : telefonoEmpresa}
                    </a>
                  )}
                </p>
              </div>

              <p className="footer-text">
                Copyright{" "}
                <a
                  className="footer-href"
                  href="https://whatscart.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsCart
                </a>{" "}
                | © {year} Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
