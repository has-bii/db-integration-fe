import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCaretDown,
  faCheck,
  faCircleNotch,
  faClock,
  faFloppyDisk,
  faPlay,
  faPlus,
  faRotate,
  faRotateRight,
  faStop,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import DatabaseConfig from "../../components/DatabaseConfig";
import NewDBConfig from "../../components/NewDBConfig";
import Dropdown from "../../components/Dropdown";
import { useToast } from "../../components/ToastProvider";

export default function Database() {
  const { pushToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [columnsModal, setColumnsModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [showNewDB, setShowNewDB] = useState(false);
  const [newDB, setNewDB] = useState({
    connection: {
      source: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "1521",
        dialect: "oracle",
      },
      target: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "5432",
        dialect: "postgres",
      },
    },
    tables: [],
    sqls: [],
  });
  const [newTableDB, setNewTableDB] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    intervals: [],
    columns: [],
    sqls: [],
  });
  const [getColsLoad, setGetColsLoad] = useState(false);
  const [selectedTable, setSelectedTable] = useState({
    connection: {},
    table: {},
  });
  const [fetchedCols, setFetchedCols] = useState({ source: [], target: [] });
  const [typeInterval, setTypeInterval] = useState("minute");
  const intervalValue = useRef();
  const [intervals, setIntervals] = useState([]);

  async function fetchDatabases() {
    await axios
      .get("/config")
      .then((res) => {
        setDatabases(res.data.config);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error while fetching Database Configuration: ", err);
      });
  }

  async function fetchBackup() {
    await axios
      .get("/backup/isRunning")
      .then((res) => {
        setIntervals(res.data.intervals);
      })
      .catch((err) => {
        console.error("Error while checking backup is running: ", err);
      });
  }

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    fetchBackup();
  }, []);

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
    if (showNewDB) {
      setNewTableDB({ ...newTableDB, columns: newColumns });
    } else if (selected.dbIndex.length === 0) {
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
    setFetchedCols({ source: [], target: [] });
  }

  function delDatabaseHandler(indexDB) {
    setDatabases(databases.filter((db, i) => i !== indexDB));
  }

  function saveConfigs() {
    async function save() {
      setSaving(true);
      const result = await axios
        .post("/config/update", { config: JSON.stringify(databases) })
        .then((res) => {
          setSaving(false);
          return res.data;
        })
        .catch((err) => {
          pushToast(false, "Failed to save config!");
          console.error("Error while saving configurations!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
    }

    save();
  }

  function startBackup() {
    async function start() {
      pushToast(true, "Applying intervals...");
      const result = await axios
        .post("/backup/start", { intervals })
        .then((res) => {
          setIntervals(res.data.intervals);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while starting main backup!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
    }

    start();
  }

  function startAllBackup() {
    async function start() {
      pushToast(true, "Starting all tasks...");
      const result = await axios
        .post("/backup/start-all", { intervals })
        .then((res) => {
          setIntervals(res.data.intervals);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while starting all tasks!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
    }

    start();
  }

  function stopBackup() {
    async function stop() {
      pushToast(true, "Stopping all tasks...");
      const result = await axios
        .get("/backup/stop-all")
        .then((res) => {
          setIntervals(res.data.intervals);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while stopping all tasks!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, "All tasks have been stopped");
      else pushToast(false, "Failed to stop all tasks!");
    }

    stop();
  }

  async function applyInterval() {
    async function restart() {
      pushToast(true, "Restarting backup...");
      const result = await axios
        .post("/backup/restart")
        .then((res) => {
          setIntervals(res.data.intervals);
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
          return res.data.data;
        })
        .catch((err) => {
          console.error("Error while fetching columns: ", err);
          pushToast(false, "Error while getting columns!");
          return null;
        })
        .finally(() => setGetColsLoad(false));

      if (res) {
        if (res.source.length === 0) {
          pushToast(
            false,
            `${selectedTable.table.sourceTable} table name does not exist!`
          );
        }

        if (res.target.length === 0) {
          pushToast(
            false,
            `${selectedTable.table.targetTable} table name does not exist!`
          );
        }

        setFetchedCols(res);
      }
    }

    get();
  }

  async function addIntervals(value, type) {
    async function add() {
      setIntervals((prev) => [
        {
          value,
          type,
          status: false,
        },
        ...prev,
      ]);
    }

    await add();
    intervalValue.current.value = "";
  }

  return (
    <>
      <button
        className="w-20 h-20 inline-flex justify-center items-center drop-shadow-lg z-30 fixed bottom-6 right-8 rounded-full bg-sky-300 text-white"
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
                        <Dropdown icon={faCaretDown} closeOnClick={true}>
                          <ul className=" max-h-56 overflow-y-auto">
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
                        <Dropdown icon={faCaretDown} closeOnClick={true}>
                          <ul className=" max-h-56 overflow-y-auto">
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
      <Layout>
        <div className="flex flex-col px-4 md:px-0 md:flex-row gap-4 lg:items-center mb-4">
          <div className="text-2xl font-bold text-slate-950">Databases</div>

          <div className="flex flex-row gap-2 items-center">
            <span className="border border-black px-3 py-1 text-black rounded-md text-sm">
              Running intervals:{" "}
            </span>
            {intervals.filter((int) => int.status).length === 0 ? (
              <span className="text-slate-400">No interval is running</span>
            ) : (
              intervals
                .filter((int) => int.status)
                .map((interval, i) => (
                  <span
                    key={i}
                    className="bg-green-200 text-green-500 font-semibold text-sm px-3 py-1 rounded-md"
                  >
                    {interval.value} {interval.type}s
                  </span>
                ))
            )}
          </div>

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

            <Dropdown
              Button={
                <button className="btn md black">
                  <FontAwesomeIcon icon={faClock} size="sm" /> Interval
                </button>
              }
            >
              <div className="flex flex-col gap-4 p-4">
                <div className="inline-flex rounded overflow-hidden border">
                  <input
                    ref={intervalValue}
                    type="number"
                    className="px-2 py-1 w-24"
                    placeholder="Value"
                  />
                  <button
                    className="px-2 py-1 bg-black text-white capitalize"
                    onClick={() => {
                      setTypeInterval(
                        typeInterval !== "minute" ? "minute" : "hour"
                      );
                    }}
                  >
                    {typeInterval}s
                  </button>
                  <button
                    className="px-2 py-1 border-l border-white/50 bg-black text-white"
                    onClick={() =>
                      addIntervals(intervalValue.current.value, typeInterval)
                    }
                  >
                    Add
                  </button>
                </div>

                {intervals.map((int, i) => (
                  <div key={i} className="inline-flex gap-2 items-center">
                    <button
                      className={`px-2 py-1 rounded ${
                        int.status
                          ? "bg-green-200 text-green-500"
                          : "bg-red-200 text-red-500"
                      }`}
                      onClick={() =>
                        setIntervals(
                          intervals.map((intt, index) => {
                            if (index === i) intt.status = !intt.status;
                            return intt;
                          })
                        )
                      }
                    >
                      {int.status ? "Run" : "Stop"}
                    </button>
                    <div className="inline-flex gap-2 justify-between bg-slate-200 text-slate-700 items-center rounded w-full px-2 py-1">
                      <div>
                        {int.value} {int.type}s
                      </div>
                      <button
                        onClick={() =>
                          setIntervals(
                            intervals.filter((intt, index) => index !== i)
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  </div>
                ))}

                <button className="btn md green" onClick={startBackup}>
                  Apply
                </button>
              </div>
            </Dropdown>

            <Dropdown>
              <ul>
                <li>
                  <button onClick={() => setShowNewDB(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add
                  </button>
                </li>
                <li>
                  <button onClick={startAllBackup}>
                    <FontAwesomeIcon icon={faPlay} />
                    Start all
                  </button>
                </li>
                <li>
                  <button onClick={stopBackup}>
                    <FontAwesomeIcon icon={faStop} />
                    Stop all
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
                      fetchBackup();
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

        {/* New DB */}

        <NewDBConfig
          showNewDB={showNewDB}
          setShowNewDB={setShowNewDB}
          setColumnsModal={setColumnsModal}
          newColumns={newColumns}
          setNewColumns={setNewColumns}
          newTableDB={newTableDB}
          setNewTableDB={setNewTableDB}
          newDB={newDB}
          setNewDB={setNewDB}
          setDatabases={setDatabases}
          setSelectedTable={setSelectedTable}
          fetchedCols={fetchedCols}
          setFetchedCols={setFetchedCols}
          getColumns={getColumns}
          getColsLoad={getColsLoad}
        />

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
              databases={databases}
              setDatabases={setDatabases}
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
              intervals={intervals}
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
