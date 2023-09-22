import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faCircleExclamation,
  faRefresh,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../../lib/axios";
import InsideErrorTable from "./InsideErrorTable";
import Dropdown from "./Dropdown";

export default function ErrorLogs() {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorsJSON, setErrorJSON] = useState([]);

  async function fetchErrorJSON() {
    await axios
      .get("/notification")
      .then((res) => {
        setErrorJSON(res.data.data);
      })
      .catch((err) => {
        if (err.response) console.log(err.response);
      });
  }

  useEffect(() => {
    fetchErrorJSON();
  }, []);

  function readNotifications() {
    async function read() {
      await axios.get("/notification/read");

      setErrorJSON(
        errorsJSON.map((err) => {
          err.isRead = true;
          return err;
        })
      );
    }

    read();
  }

  function clearNotifications() {
    async function clear() {
      await axios.get("/notification/clear");

      setErrorJSON([]);
    }

    clear();
  }

  return (
    <>
      <Modal show={showModal} setShow={setShowModal} header="Errors Log">
        <div className="overflow-auto max-h-[46rem]">
          <div className="flex flex-row gap-4 mb-4 items-center justify-end">
            <span>From</span>
            <input
              type="datetime-local"
              className="px-3 w-fit py-1.5 rounded-md border"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>to</span>
            <input
              type="datetime-local"
              className="px-3 w-fit py-1.5 rounded-md border"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <Dropdown>
              <ul className="max-w-3xl">
                <li>
                  <button onClick={fetchErrorJSON}>
                    <FontAwesomeIcon icon={faRefresh} /> Refresh
                  </button>
                </li>
                <li>
                  <button onClick={readNotifications}>
                    <FontAwesomeIcon icon={faBookmark} /> Read all
                  </button>
                </li>
                <li>
                  <button onClick={clearNotifications} className="truncate">
                    <FontAwesomeIcon icon={faTrashCan} /> Clear all
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>

          <InsideErrorTable
            errorsJSON={errorsJSON}
            setErrorJSON={setErrorJSON}
            startDate={startDate}
            endDate={endDate}
            setErrorsJSON={setErrorJSON}
          />
        </div>
        <div>
          <button className="btn gray" onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      </Modal>
      <button
        className="inline-flex gap-2 items-center"
        onClick={() => setShowModal(true)}
      >
        <FontAwesomeIcon icon={faCircleExclamation} size="xl" />
        <span className="hidden md:block">Logs</span>
      </button>
    </>
  );
}
