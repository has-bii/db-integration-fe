import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faDungeon } from "@fortawesome/free-solid-svg-icons";
import ErrorTables from "./ErrorLogs";
import Notifications from "./Notifications";

export default function Navbar() {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const location = useLocation();

  return (
    <div className="bg-white drop-shadow-xl relative z-20">
      <div className=" flex justify-center text-2xl font-extrabold border-b py-4 text-gray-700">
        INTEGRATION DB
      </div>
      <ul className="flex flex-row gap-8 justify-center py-4 border-b navbar overflow-visible">
        <li>
          <Link className={location.pathname === "/" ? "active" : ""} to={"/"}>
            <FontAwesomeIcon icon={faDungeon} size="xl" />
            <span className="hidden md:block">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            className={location.pathname === "/database" ? "active" : ""}
            to={"/database"}
          >
            <FontAwesomeIcon icon={faDatabase} size="xl" />
            <span className="hidden md:block">Database</span>
          </Link>
        </li>
        <li>
          <Link
            className={location.pathname === "/error" ? "active" : ""}
            to={"/error"}
          >
            <FontAwesomeIcon icon={faDatabase} size="xl" />
            <span className="hidden md:block">Error Database</span>
          </Link>
        </li>
        <li>
          <Notifications />
        </li>
        <li>
          <ErrorTables />
        </li>
      </ul>
    </div>
  );
}
