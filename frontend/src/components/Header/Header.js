import React, { useState, useContext } from "react";
import { Context } from "../../common/Context";

import "./Header.css";

function Header() {
  const { urlLogo } = useContext(Context);

  const [color, setColor] = useState(false);
  const changeColor = () => {
    if (window.scrollY >= 100) {
      setColor(true);
    } else {
      setColor(false);
    }
  };

  window.addEventListener("scroll", changeColor);

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
            src={urlLogo}
            alt="logo"
          />
        </div>
      )}
    </nav>
  );
}

export default Header;
