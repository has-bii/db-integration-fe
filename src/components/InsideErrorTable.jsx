import { useEffect, useState } from "react";
import { sortByDateAsc, sortByDateDesc } from "../../lib/sortByDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faArrowDownShortWide,
  faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import filterByDate from "../../lib/filterByDate";
import axios from "../../lib/axios";

export default function InsideErrorTable({
  errorsJSON,
  setErrorsJSON,
  startDate,
  endDate,
}) {
  const [modifiedErrorsJson, setModifiedErrosJson] = useState([]);
  const [order, setOrder] = useState("");
  const [page, setPage] = useState(1);
  const [maxRows, setMaxRows] = useState(5);
  const [paginate, setPaginate] = useState([]);

  useEffect(() => {
    if (errorsJSON.length === 0) {
      setModifiedErrosJson([]);
      return;
    }

    const temp = [...errorsJSON];

    if (order === "asc") sortByDateAsc(temp);
    else if (order === "desc") sortByDateDesc(temp);

    setModifiedErrosJson(temp);
  }, [errorsJSON, order]);

  useEffect(() => {
    if (startDate.length === 0 && endDate.length === 0)
      setModifiedErrosJson(errorsJSON);
    else setModifiedErrosJson(filterByDate(errorsJSON, startDate, endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    if (errorsJSON.length === 0) return;

    setPage(1);

    let pages = Math.ceil(errorsJSON.length / parseInt(maxRows));

    if (errorsJSON.length > modifiedErrorsJson.length)
      pages = Math.ceil(modifiedErrorsJson.length / parseInt(maxRows));

    const temp = [];

    for (let index = 0; index < pages; index++) {
      temp.push({ label: index + 1 });
    }

    setPaginate(temp);
  }, [errorsJSON, modifiedErrorsJson, maxRows]);

  function paginateArray(array, pageNumber, pageSize) {
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return array.slice(startIndex, endIndex);
  }

  async function deleteErrorJSON(errorJSON) {
    await axios
      .post("/notification/delete", { data: errorJSON })
      .then((res) => {})
      .catch((err) => console.err(err));

    setErrorsJSON(
      errorsJSON.filter(
        (errJson) =>
          JSON.stringify({ date: errJson.date, message: errJson.message }) !==
          JSON.stringify({ date: errorJSON.date, message: errorJSON.message })
      )
    );
  }

  return (
    <div className="tables-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Message</th>
            <th scope="col">
              <div
                role="button"
                className="inline-flex gap-2 items-center"
                onClick={() =>
                  setOrder(order === "" ? "asc" : order === "asc" ? "desc" : "")
                }
              >
                Date
                {order && (
                  <FontAwesomeIcon
                    icon={
                      order === "asc"
                        ? faArrowDownShortWide
                        : faArrowUpShortWide
                    }
                  />
                )}
              </div>
            </th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {paginateArray(modifiedErrorsJson, page, parseInt(maxRows)).map(
            (errorJson, errorIndex) => (
              <tr key={errorIndex}>
                <td>
                  <div className="inline-flex items-center gap-2">
                    {!errorJson.isRead && (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                    <p>{errorJson.message}</p>
                  </div>
                </td>
                <td>{new Date(errorJson.date).toLocaleString()}</td>
                <td>
                  <button
                    className="btn red"
                    onClick={() => deleteErrorJSON(errorJson)}
                  >
                    delete
                  </button>
                </td>
              </tr>
            )
          )}

          {modifiedErrorsJson.length === 0 && (
            <tr>
              <td colSpan={3} className="w-full text-center text-slate-400">
                There is no data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex flex-row gap-4 items-center justify-center my-4">
        <div className="inline-flex gap-1 pagination">
          <button
            onClick={() => setPage(1)}
            className="pagination-btn"
            disabled={parseInt(page) === 1}
          >
            <FontAwesomeIcon icon={faAnglesLeft} />
          </button>
          <button
            onClick={() => setPage(parseInt(page) - 1)}
            className="pagination-btn"
            disabled={parseInt(page) === 1}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>

          {paginate
            .slice(
              parseInt(page) < 4 ? 0 : parseInt(page) - 3,
              parseInt(page) < 3 ? 5 : parseInt(page) + 2
            )
            .map((pg, iPg) => (
              <div
                key={iPg}
                role="button"
                onClick={() => setPage(pg.label)}
                className={`rounded-full inline-flex items-center justify-center w-10 h-10 ${
                  pg.label === page
                    ? "text-sky-500 bg-sky-100"
                    : "text-sky-300 hover:text-sky-500 hover:bg-sky-100"
                }`}
              >
                {pg.label}
              </div>
            ))}

          <button
            onClick={() => setPage(parseInt(page) + 1)}
            className="pagination-btn"
            disabled={parseInt(page) === paginate.length}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            onClick={() => setPage(paginate.length)}
            className="pagination-btn"
            disabled={parseInt(page) === paginate.length}
          >
            <FontAwesomeIcon icon={faAnglesRight} />
          </button>
        </div>
        <div>
          <select
            className="px-3 py-1.5 border w-fit border-sky-300 text-sky-300 rounded-md"
            value={maxRows}
            onChange={(e) => setMaxRows(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div>Total data: {modifiedErrorsJson.length}</div>
      </div>
    </div>
  );
}
