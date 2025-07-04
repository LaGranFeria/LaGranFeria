import React from "react";

import "./Loader.css";

import loadergif from "../../assets/images/loader.gif";

const loader = () => {
  return (
    <div className="loading-container">
      <img className="loader" src={loadergif} alt="La Gran Feria" />
    </div>
  );
};

export default loader;
