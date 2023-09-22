import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";

function Dropdown({
  children,
  icon = faEllipsisVertical,
  position = "bottom left",
  textButton = "",
  iconSize = "lg",
  closeOnClick = false,
  Button = null,
}) {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef();
  const dropdownListRef = useRef();

  useEffect(() => {
    // Function to handle clicks outside of the dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }

      if (
        dropdownListRef.current &&
        dropdownListRef.current.contains(event.target) &&
        closeOnClick
      ) {
        event.target.click();
        setShow(false);
      }
    }

    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      {Button === null ? (
        <button className="appearance-none" onClick={() => setShow(!show)}>
          <FontAwesomeIcon icon={icon} size={iconSize} />{" "}
          <span className="hidden md:block">{textButton}</span>
        </button>
      ) : (
        React.cloneElement(Button, { onClick: () => setShow(!show) })
      )}

      <div
        ref={dropdownListRef}
        className={`dropdown-list ${position} ${show ? "show" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

Dropdown.propTypes = {
  icon: PropTypes.any,
  position: PropTypes.string,
  textButton: PropTypes.string,
  iconSize: PropTypes.string,
  closeOnClick: PropTypes.bool,
  Button: PropTypes.element,
};

export default Dropdown;
