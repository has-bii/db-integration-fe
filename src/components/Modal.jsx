import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";

function Modal({ children, setShow, show, header, className }) {
  return (
    <div className={`modal-container ${show ? "show" : ""}`}>
      <div className={`modal-card ${className}`}>
        <div className="flex px-4 py-2 justify-between items-center bg-slate-100 border-b rounded-t-lg">
          <h4 className="text-lg font-semibold text-slate-950">{header}</h4>
          <button>
            <FontAwesomeIcon
              icon={faXmark}
              size="lg"
              onClick={() => setShow(false)}
            />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  header: PropTypes.string.isRequired,
};

export default Modal;
