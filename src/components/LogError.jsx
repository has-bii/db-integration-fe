import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import axios from "../../lib/axios";

function LogError({ logModal, setLogModal }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState("");
  const [onread, setOnread] = useState("");

  useEffect(() => {
    async function fetching() {
      setLoading(true);
      await axios
        .get("/log")
        .then((res) => {
          setData(res.data.data);
          setLoading(false);
          return res.data;
        })
        .catch((err) => {
          console.error("Failed to fetch error logs!\nError: ", err);
          return null;
        });
    }

    if (logModal) {
      fetching();
    }
  }, [logModal]);

  useEffect(() => {
    if (selected.length === 0) setOnread("");
    else setOnread(data[selected].log);
  }, [selected]);

  return (
    <Modal show={logModal} setShow={setLogModal} header="View Error Logs">
      <div>
        <select
          className="border px-3 py-1.5 rounded-md w-full"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {loading ? (
            <option value="">Fetching files...</option>
          ) : (
            <option value="">Select file...</option>
          )}
          {data.map((dt, i) => (
            <option key={i} value={i}>
              {dt.name}
            </option>
          ))}
        </select>
        {onread.length > 0 && (
          <pre className="bg-black text-white px-8 py-6 overflow-y-auto max-h-96 mt-4 rounded-md mb-4">
            {onread}
          </pre>
        )}
      </div>
      <div>
        <button className="btn gray" onClick={() => setLogModal(false)}>
          close
        </button>
      </div>
    </Modal>
  );
}

LogError.propTypes = {
  logModal: PropTypes.bool.isRequired,
  setLogModal: PropTypes.func.isRequired,
};

export default LogError;
