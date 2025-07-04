import React, { useContext } from "react";
import { Context } from "../../common/Context";
import { ReactComponent as Close } from "../../assets/svgs/closebtn.svg";
import { ReactComponent as Aviso } from "../../assets/svgs/aviso.svg";

import "./Modal.css";

function Modal() {
  const { aviso, setModalCerrado } = useContext(Context);

  const closeModal = () => {
    setModalCerrado(true);
  };

  return (
    <div className="modal-container">
      <div className="aviso-container">
        <Close className="close-btn-modal closemodal" onClick={closeModal} />

        <div className="div-aviso-txt">
          <Aviso className="close-btn-modal" />
          <b className="title-color-p">AVISO IMPORTANTE:</b>
        </div>

        <p className="color-p">{aviso}</p>
      </div>
    </div>
  );
}

export default Modal;
