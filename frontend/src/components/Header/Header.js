import React, { useState, useContext, useEffect } from "react";
import { Context } from "../../common/Context";

import "./Header.css";

function Header() {
  const { urlLogo } = useContext(Context);

  const [color, setColor] = useState(false);
  const [isMinorista, setIsMinorista] = useState(false);
  const urlLogoMinorista =
    "https://yourfiles.cloud/uploads/f642b93e351eba82b927f3d0677e49d0/logo.png";
    
  const changeColor = () => {
    if (window.scrollY >= 100) {
      setColor(true);
    } else {
      setColor(false);
    }
  };

  window.addEventListener("scroll", changeColor);

  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes("minorista")) {
      setIsMinorista(true);
    }
  }, []);

  return (
    <nav className={color ? "header-nav header-nav-bg" : "header-nav"}>
      {urlLogo && urlLogo !== "" && (
        <div
          className={
            color ? "header-a-logo  header-a-logo-bg " : "header-a-logo"
          }
        >
          <img
            className={color ? "header-logo  header-logo-bg " : "header-logo"}
            width={140}
            src={isMinorista ? urlLogoMinorista : urlLogo}
            alt="logo"
          />
        </div>
      )}
    </nav>
  );
}

export default Header;
