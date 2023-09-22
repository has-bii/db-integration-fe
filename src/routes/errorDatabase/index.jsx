import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCheck,
  faCircleExclamation,
  faCircleNotch,
  faClock,
  faFloppyDisk,
  faPlay,
  faRotate,
  faRotateRight,
  faStop,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import DatabaseConfig from "../../components/DatabaseConfig";
import Dropdown from "../../components/Dropdown";
import { useToast } from "../../components/ToastProvider";
import LogError from "../../components/LogError";

export default function ErrorDatabase() {
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [columnsModal, setColumnsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState(true);
  const [type, setType] = useState("interval");
  const [time, setTime] = useState("");
  const [timestamp, setTimestamp] = useState(null);
  const [timeInterval, setTimeInterval] = useState("");
  const [status, setStatus] = useState(false);
  const [selected, setSelected] = useState({
    dbIndex: "",
    tableIndex: "",
  });
  const [newTable, setNewTable] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    intervals: [],
    columns: [],
  });
  const [newColumns, setNewColumns] = useState([]);
  const sourceNameRef = useRef();
  const [sourceName, setSourceName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [logModal, setLogModal] = useState(false);
  const [getColsLoad, setGetColsLoad] = useState(false);
  const [selectedTable, setSelectedTable] = useState({
    connection: {},
    table: {},
  });
  const [fetchedCols, setFetchedCols] = useState({ source: [], target: [] });

  async function fetchDatabases() {
    await axios
      .get("/config/error")
      .then((res) => {
        setDatabases(JSON.parse(res.data.config));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error while fetching Database Configuration: ", err);
      });
  }

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    async function fetchBackup() {
      await axios
        .get("/error-backup/isRunning")
        .then((res) => {
          setStatus(res.data.status);

          if (res.data.timestamp) setTimestamp(res.data.timestamp);

          setType(res.data.type);

          setTimeInterval(res.data.interval);
          setTime(res.data.time);

          setLoadStatus(false);
        })
        .catch((err) => {
          console.error("Error while checking backup is running: ", err);
        });
    }

    fetchBackup();
  }, []);

  useEffect(() => {
    if (timeInterval.length !== 0) {
      if (timeInterval > 59) setTimeInterval(59);

      if (timeInterval <= 0) setTimeInterval(1);
    }
  }, [timeInterval]);

  function updateConnectionSourceHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.source[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  function updateConnectionTargetHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.target[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  async function pushNewColumn() {
    async function add() {
      if (sourceName.length === 0 || targetName.length === 0)
        alert("Column names must not be empty!");
      else {
        setNewColumns((prev) => [
          ...prev,
          {
            source: sourceName,
            target: targetName,
          },
        ]);
      }
    }

    await add();

    setSourceName("");
    setTargetName("");

    sourceNameRef.current.focus();
  }

  async function addNewTable(index) {
    async function update() {
      setDatabases(
        databases.map((database, i) => {
          if (i === index) {
            database.tables = [...database.tables, newTable];
            return database;
          } else return database;
        })
      );
    }

    await update();

    setNewTable({
      sourceTable: "",
      targetTable: "",
      filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
      intervals: [],
      columns: [],
    });
  }

  function delTables(dbIndex, tableIndex) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.filter(
            (table, i) => tableIndex !== i
          );

          return database;
        } else return database;
      })
    );
  }

  function updateTableProperty(
    dbIndex,
    tableIndex,
    tableProperty,
    value,
    filteredCol = false
  ) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.map((table, i) => {
            if (tableIndex === i) {
              if (filteredCol) {
                table.filterByCol[tableProperty] = value;
              } else table[tableProperty] = value;

              return table;
            } else return table;
          });

          return database;
        } else return database;
      })
    );
  }

  function editAndNewColumnsHandler() {
    if (selected.dbIndex.length === 0) {
      setNewTable({ ...newTable, columns: newColumns });
    } else {
      setDatabases(
        databases.map((database, index) => {
          if (selected.dbIndex === index) {
            database.tables = database.tables.map((table, i) => {
              if (selected.tableIndex === i) {
                table.columns = newColumns;
              }

              return table;
            });
          }

          return database;
        })
      );

      setSelected({
        dbIndex: "",
        tableIndex: "",
      });
    }

    setNewColumns([]);
    setColumnsModal(false);
  }

  function delDatabaseHandler(indexDB) {
    setDatabases(databases.filter((db, i) => i !== indexDB));
  }

  function saveConfigs() {
    async function save() {
      const result = await axios
        .post("/config/error-save", { config: JSON.stringify(databases) })
        .then((res) => {
          setSaving(false);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while saving configurations!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
      else pushToast(false, "Failed to save.");
    }

    save();
  }

  function startBackup() {
    async function start() {
      pushToast(true, "Starting backup...");

      const result = await axios
        .post("/error-backup/start", {
          timeInterval,
          type,
          time,
        })
        .then((res) => {
          setStatus(true);
          setTimestamp(res.data.timestamp);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while saving configurations!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
      else pushToast(false, "Failed to start Backup on error.");
    }

    start();
  }

  function stopBackup() {
    async function stop() {
      pushToast(true, "Stopping backup...");

      const result = await axios
        .get("/error-backup/stop")
        .then((res) => {
          setStatus(false);
          setTimestamp(res.data.timestamp);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while saving configurations!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
      else pushToast(false, "Failed to stop Backup on error.");
    }

    stop();
  }

  async function applyInterval() {
    async function restart() {
      pushToast(true, "Restarting backup...");
      const result = await axios
        .post("/error-backup/restart", { timeInterval, type, time })
        .then((res) => {
          setStatus(res.data.status);
          setTimestamp(res.data.timestamp);
          setTimeInterval(res.data.interval);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while restarting main backup!\nError: ", err);
          return null;
        });

      if (result) pushToast(result.status, result.message);
      else pushToast(false, "Failed to restart backup!");
    }

    restart();
  }

  function getColumns() {
    async function get() {
      setGetColsLoad(true);
      const res = await axios
        .post("/db/get-columns", selectedTable)
        .then((res) => {
          console.log(res.data);
          return res.data.data;
        })
        .catch((err) => {
          console.error("Error while fetching columns: ", err);
          pushToast(false, "Error while getting columns!");
          return null;
        })
        .finally(() => setGetColsLoad(false));

      if (res) setFetchedCols(res);
    }

    get();
  }

  return (
    <>
      <button
        className="w-20 h-20 inline-flex justify-center z-4 items-center fixed bottom-6 right-8 rounded-full bg-black text-white"
        onClick={() => {
          pushToast(true, "Saving...");
          saveConfigs();
        }}
      >
        <FontAwesomeIcon icon={faFloppyDisk} size="2xl" />
      </button>
      <Modal
        show={columnsModal}
        setShow={setColumnsModal}
        header="Edit Columns"
        className="enable-overflow"
      >
        <div>
          <div className="tables-wrapper enable-overflow">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Source</th>
                  <th scope="col">Target</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newColumns.map((col, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{col.source}</td>
                    <td>{col.target}</td>
                    <td>
                      <button
                        className="btn fluid red"
                        onClick={() => {
                          setNewColumns(
                            newColumns.filter((c, i) => i !== index)
                          );
                        }}
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>#</td>
                  <td>
                    <div className="inline-flex">
                      <input
                        ref={sourceNameRef}
                        type="text"
                        placeholder="Column name"
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                      />
                      {fetchedCols.source.length > 0 && (
                        <Dropdown icon={faCaretDown}>
                          <ul className="max-h-56 overflow-y-auto">
                            {fetchedCols.source.map((col, i) => (
                              <li key={i}>
                                <button onClick={() => setSourceName(col)}>
                                  {col}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Dropdown>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className=" inline-flex">
                      <input
                        type="text"
                        placeholder="Column name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") pushNewColumn();
                        }}
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                      />
                      {fetchedCols.target.length > 0 && (
                        <Dropdown icon={faCaretDown}>
                          <ul className="max-h-56 overflow-y-auto">
                            {fetchedCols.target.map((col, i) => (
                              <li key={i}>
                                <button onClick={() => setTargetName(col)}>
                                  {col}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Dropdown>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="btn fluid green" onClick={pushNewColumn}>
                      add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <button
            className="btn gray"
            onClick={() => {
              setColumnsModal(false);
              setSelectedTable({ connection: {}, table: {} });
              setFetchedCols({ source: [], target: [] });
            }}
          >
            Cancel
          </button>
          <button className="btn yellow" onClick={getColumns}>
            Get Cols
            {getColsLoad && (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            )}
          </button>
          <button className="btn green" onClick={editAndNewColumnsHandler}>
            Save
          </button>
        </div>
      </Modal>
      <LogError logModal={logModal} setLogModal={setLogModal} />
      <Layout>
        <div className="flex flex-col px-4 md:px-0 md:flex-row gap-4 md:items-center mb-4">
          <div className="text-2xl font-bold text-slate-950">
            Error Databases
          </div>
          {!loadStatus && (
            <div className="inline-flex gap-4">
              <div
                className={`px-3 py-1 rounded-md text-sm w-fit first-letter:uppercase border ${
                  status
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }`}
              >
                {status ? "Running at" : "stopped at"}
              </div>
              {timestamp && (
                <div className="inline-flex gap-2 items-center text-slate-400">
                  <FontAwesomeIcon icon={faClock} />
                  <span>
                    {new Date(timestamp).toLocaleString().replaceAll("/", "-")}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-row gap-4 ml-auto items-center">
            <div className="inline-flex gap-2 items-center text-slate-400">
              {saving ? (
                <>
                  <FontAwesomeIcon
                    icon={faArrowsRotate}
                    className="animate-spin"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Saved</span>
                </>
              )}
            </div>

            <div className="inline-flex bg-white border rounded-md overflow-hidden">
              <button
                className="px-3 bg-black py-1 text-white capitalize border-r"
                onClick={applyInterval}
              >
                apply
              </button>
              {type === "interval" ? (
                <input
                  type="number"
                  placeholder="Interval in 1-59 mins"
                  className="px-3 py-1 bg-transparent max-w-xs"
                  value={timeInterval}
                  onChange={(e) => setTimeInterval(e.target.value)}
                />
              ) : (
                <input
                  type="time"
                  placeholder="Interval in 1-59 mins"
                  className="px-3 py-1 bg-transparent w-fit"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              )}
              <button
                className="px-3 bg-black py-1 text-white capitalize border-l"
                onClick={() => {
                  if (type === "interval") {
                    setType("time");
                  } else setType("interval");
                }}
              >
                change
              </button>
            </div>

            <Dropdown>
              <ul>
                <li>
                  <button onClick={() => setLogModal(true)}>
                    <FontAwesomeIcon icon={faCircleExclamation} />
                    Logs
                  </button>
                </li>
                <li>
                  <button onClick={startBackup}>
                    <FontAwesomeIcon icon={faPlay} />
                    Start
                  </button>
                </li>
                <li>
                  <button onClick={stopBackup}>
                    <FontAwesomeIcon icon={faStop} />
                    Stop
                  </button>
                </li>
                <li>
                  <button onClick={applyInterval}>
                    <FontAwesomeIcon icon={faRotateRight} />
                    Restart
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setDatabases([]);
                      fetchDatabases();
                    }}
                  >
                    <FontAwesomeIcon icon={faRotate} />
                    refresh
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>

        {/* Databases */}
        {loading ? (
          <div className="w-full h-80 flex justify-center items-center text-2xl gap-4 text-slate-300 font-semibold animate-pulse">
            Fetching data...
            <FontAwesomeIcon
              icon={faCircleNotch}
              size="lg"
              className="animate-spin"
            />
          </div>
        ) : databases.length > 0 ? (
          databases.map((database, index) => (
            <DatabaseConfig
              key={index}
              index={index}
              database={database}
              delDatabaseHandler={delDatabaseHandler}
              newTable={newTable}
              setNewTable={setNewTable}
              updateConnectionSourceHandler={updateConnectionSourceHandler}
              updateConnectionTargetHandler={updateConnectionTargetHandler}
              updateTableProperty={updateTableProperty}
              setColumnsModal={setColumnsModal}
              setNewColumns={setNewColumns}
              addNewTable={addNewTable}
              setSelected={setSelected}
              delTables={delTables}
              setSelectedTable={setSelectedTable}
              saveConfigs={saveConfigs}
            />
          ))
        ) : (
          <div className="w-full h-80 flex justify-center items-center text-2xl text-slate-300 font-semibold">
            There is no configuration.
          </div>
        )}
      </Layout>
    </>
  );
}
