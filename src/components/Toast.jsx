import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function Toast({ messages, delToast }) {
  return (
    <div className="toast-container">
      {messages.map((message, i) => (
        <div key={i} className={`toast ${message.status ? "green" : "red"}`}>
          <span>{message.message}</span>
          <button
            className="appearance-none"
            onClick={() => delToast(message.id)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      ))}
    </div>
  );
}

Toast.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      message: PropTypes.string.isRequired,
      status: PropTypes.bool.isRequired,
    })
  ),
  delToast: PropTypes.func.isRequired,
};

export default Toast;
