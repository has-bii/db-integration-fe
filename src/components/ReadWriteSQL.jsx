import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";

export default function ReadWriteSQL({ query, setQuery }) {
  const [newColumnsSQL, setNewColumnsSQL] = useState([]);
  const [columnName, setColumnName] = useState("");
  const [columnAsName, setColumnAsName] = useState("");

  const valueNameRef = useRef();

  const [newJoins, setNewJoins] = useState([]);
  const [typeJoin, setTypeJoin] = useState("");
  const [tableJoin, setTableJoin] = useState("");
  const [onJoin, setOnJoin] = useState("");

  const [newWheres, setNewWheres] = useState([]);
  const [clause, setClause] = useState("");
  const [filterType, setFilterType] = useState("manual");
  const [lastData, setLastData] = useState("");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    setQuery({ ...query, columnsSQL: newColumnsSQL });
  }, [newColumnsSQL]);

  useEffect(() => {
    if (query.columnsSQL.length > newColumnsSQL.length)
      setNewColumnsSQL(query.columnsSQL);
  }, [query]);

  useEffect(() => {
    setQuery({ ...query, joins: newJoins });
  }, [newJoins]);

  useEffect(() => {
    if (query.joins.length > newJoins.length) setNewJoins(query.joins);
  }, [query]);

  useEffect(() => {
    setQuery({ ...query, wheres: newWheres });
  }, [newWheres]);

  useEffect(() => {
    if (query.wheres.length > newWheres.length) setNewWheres(query.wheres);
  }, [query]);

  async function pushNewColumnSQL() {
    async function push() {
      setNewColumnsSQL((prev) => [
        ...prev,
        { column: columnName, name: columnAsName },
      ]);
    }

    await push();

    setColumnName("");
    setColumnAsName("");
  }

  function changeColumnSQL(colSQLIndex, property, value) {
    setNewColumnsSQL(
      newColumnsSQL.map((item, index) => {
        if (index === colSQLIndex) item[property] = value;

        return item;
      })
    );
  }

  async function pushNewJoin() {
    async function push() {
      setNewJoins((prev) => [
        ...prev,
        { type: typeJoin, table: tableJoin, on: onJoin },
      ]);
    }

    await push();

    setTypeJoin("");
    setTableJoin("");
    setOnJoin("");
  }

  function changeJoin(joinIndex, property, value) {
    setNewJoins(
      newJoins.map((item, index) => {
        if (index === joinIndex) item[property] = value;

        return item;
      })
    );
  }

  async function pushNewWhere() {
    async function push() {
      setNewWheres((prev) => [
        ...prev,
        {
          clause: clause,
          condition,
          type: filterType,
        },
      ]);
    }

    async function push2() {
      setNewWheres((prev) => [
        ...prev,
        {
          clause: `${clause} :${lastData}`,
          condition,
          type: filterType,
        },
      ]);
    }

    filterType === "manual" ? await push() : await push2();

    setClause("");
    setLastData("");
    setCondition("");
    setFilterType("manual");
  }

  return (
    <>
      <h6 className="mt-2 font-semibold">COLUMNS & TABLES</h6>
      <div className="flex flex-row gap-4 w-full">
        <div className="p-3 flex flex-col gap-2 border rounded-md w-full">
          <p>SELECT</p>
          {newColumnsSQL.map((colSQL, colSQLIndex) => (
            <div key={colSQLIndex} className="inline-flex gap-2 items-center">
              <input
                type="text"
                className="px-3 py-1.5 border rounded"
                value={colSQL.column}
                onChange={(e) =>
                  changeColumnSQL(colSQLIndex, "column", e.target.value)
                }
              />
              <span>as</span>
              <input
                type="text"
                className="px-3 py-1.5 border rounded"
                value={colSQL.name}
                onChange={(e) =>
                  changeColumnSQL(colSQLIndex, "name", e.target.value)
                }
              />
              <button
                className="btn red"
                onClick={() =>
                  setNewColumnsSQL(
                    newColumnsSQL.filter((item, i) => i !== colSQLIndex)
                  )
                }
              >
                Delete
              </button>
            </div>
          ))}

          <div className="inline-flex gap-2 items-center">
            <input
              type="text"
              className="px-3 py-1.5 rounded border"
              placeholder="Column/function"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
            <p>as</p>
            <input
              type="text"
              className="px-3 py-1.5 rounded border"
              placeholder="AS name"
              value={columnAsName}
              onChange={(e) => setColumnAsName(e.target.value)}
            />
            <button
              className="btn green"
              onClick={pushNewColumnSQL}
              disabled={columnName.length === 0 || columnAsName.length === 0}
            >
              add
            </button>
          </div>

          <label htmlFor="from-table">FROM</label>
          <input
            id="from-table"
            type="text"
            className="px-3 py-1.5 border rounded"
            placeholder="Table name..."
            value={query.from}
            onChange={(e) => setQuery({ ...query, from: e.target.value })}
          />

          <label htmlFor="join-table">JOIN</label>
          <div className="inline-flex gap-2 items-center">
            <select
              id="join-table"
              className="px-3 py-1.5 border rounded"
              value={typeJoin}
              onChange={(e) => setTypeJoin(e.target.value)}
            >
              <option value="">Type...</option>
              <option value="INNER">INNER</option>
              <option value="LEFT">LEFT</option>
              <option value="RIGHT">RIGHT</option>
              <option value="FULL">FULL</option>
            </select>
            <input
              type="text"
              className="px-3 py-1.5 border rounded"
              placeholder="Table name..."
              value={tableJoin}
              onChange={(e) => setTableJoin(e.target.value)}
            />
            <p>ON</p>
            <input
              type="text"
              className="px-3 py-1.5 border rounded"
              placeholder="ON ..."
              value={onJoin}
              onChange={(e) => setOnJoin(e.target.value)}
            />
            <button
              className="btn green"
              disabled={
                typeJoin.length === 0 ||
                tableJoin.length === 0 ||
                typeJoin.length === 0
              }
              onClick={pushNewJoin}
            >
              add
            </button>
          </div>
          {newJoins.map((join, joinIndex) => (
            <div key={joinIndex} className="inline-flex gap-2 items-center">
              <select
                className="px-2 py-1 border rounded"
                value={join.type}
                onChange={(e) => changeJoin(joinIndex, "type", e.target.value)}
              >
                <option value="INNER">INNER</option>
                <option value="LEFT">LEFT</option>
                <option value="RIGHT">RIGHT</option>
                <option value="FULL">FULL</option>
              </select>
              <input
                type="text"
                className="px-2 py-1 border rounded w-fit"
                value={join.table}
                onChange={(e) => changeJoin(joinIndex, "table", e.target.value)}
              />
              <p>ON</p>
              <input
                type="text"
                className="px-2 py-1 border rounded"
                value={join.on}
                onChange={(e) => changeJoin(joinIndex, "on", e.target.value)}
              />
              <button
                className="btn red"
                onClick={() =>
                  setNewJoins(newJoins.filter((item, i) => i !== joinIndex))
                }
              >
                delete
              </button>
            </div>
          ))}

          <div className="inline-flex items-center mt-2">
            <label className="w-1/6">WHERE</label>
            <div className="inline-flex gap-2 items-center w-full">
              {newWheres.length !== 0 && (
                <select
                  className="px-2 py-1 border rounded"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="">Condition...</option>
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}
              <input
                type="text"
                className="px-2 py-1 border rounded"
                placeholder="Clause..."
                value={clause}
                onChange={(e) => setClause(e.target.value)}
              />
              <select
                className="px-2 py-1 w-fit border rounded"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="manual">manual</option>
                <option value="last data">last data</option>
              </select>
              {filterType === "last data" && (
                <select
                  className="px-2 py-1 w-fit border rounded"
                  value={lastData}
                  onChange={(e) => setLastData(e.target.value)}
                >
                  <option value="">select value</option>
                  {query.values.map((value, valueIndex) => (
                    <option key={valueIndex} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
              <button className="btn green" onClick={pushNewWhere}>
                add
              </button>
            </div>
          </div>

          {newWheres.map((where, whereIndex) => (
            <div
              key={whereIndex}
              className="inline-flex gap-2 justify-between items-center px-3 py-1 rounded bg-slate-200 font-semibold text-slate-500"
            >
              {`${where.condition} ${where.clause} type: ${where.type}`}
              <button
                onClick={() =>
                  setNewWheres(newWheres.filter((item, i) => i !== whereIndex))
                }
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 flex flex-col gap-2 border rounded-md w-full">
          <p>INSERT INTO</p>
          <input
            type="text"
            className="px-3 py-1.5 border rounded"
            placeholder="Table name..."
            value={query.targetTable}
            onChange={(e) =>
              setQuery({ ...query, targetTable: e.target.value })
            }
          />
          <p>VALUES</p>
          <div className="inline-flex gap-2 items-center">
            <select
              ref={valueNameRef}
              className="px-3 py-1.5 border rounded w-full"
            >
              <option value="">Select column name</option>
              {newColumnsSQL
                .filter(
                  (item) => !query.values.some((value) => value === item.name)
                )
                .map((colSQL, colSQLIndex) => (
                  <option key={colSQLIndex} value={colSQL.name}>
                    {colSQL.name}
                  </option>
                ))}
            </select>
            <button
              className="btn green"
              onClick={() => {
                setQuery({
                  ...query,
                  values: [...query.values, valueNameRef.current.value],
                });
                valueNameRef.current.value = "";
              }}
            >
              add
            </button>
          </div>

          {query.values.map((value, valueIndex) => (
            <div
              key={valueIndex}
              className="inline-flex justify-between items-center px-2 py-1 rounded bg-slate-100 text-slate-500 font-semibold"
            >
              {value}
              <button
                onClick={() =>
                  setQuery({
                    ...query,
                    values: query.values.filter((va, i) => i !== valueIndex),
                  })
                }
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
