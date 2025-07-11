import React, { useContext } from "react";
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

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-content-section-global">
          <div className="footer-content-section">
            <div className="footer-content-section">
              {((facebook && facebook !== "") ||
                (instagram && instagram !== "")) && (
                <div className="social-media">
                  {facebook && facebook !== "" && (
                    <div className="footer-content-section-left-social">
                      <a
                        href={urlFacebook ? urlFacebook : "#"}
                        target={urlFacebook ? "_blank" : ""}
                        rel={urlFacebook ? "noopener noreferrer" : ""}
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
                          href={urlFacebook ? urlFacebook : "#"}
                          target={urlFacebook ? "_blank" : ""}
                          rel={urlFacebook ? "noopener noreferrer" : ""}
                        >
                          {facebook}
                        </a>
                      </p>
                    </div>
                  )}

                  {instagram && instagram !== "" && (
                    <div className="footer-content-section-left-social">
                      <a
                        className="social-title"
                        href={urlInstagram ? urlInstagram : "#"}
                        target={urlInstagram ? "_blank" : ""}
                        rel={urlInstagram ? "noopener noreferrer" : ""}
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
                          href={urlInstagram ? urlInstagram : "#"}
                          target={urlInstagram ? "_blank" : ""}
                          rel={urlInstagram ? "noopener noreferrer" : ""}
                        >
                          {instagram}
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
                      <a className="address" href={`tel:${telefonoEmpresa}`}>
                        {telefonoEmpresa}
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
                    <a className="address" href={`tel:${telefonoEmpresa}`}>
                      {telefonoEmpresa}
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
