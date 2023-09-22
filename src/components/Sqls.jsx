import PropTypes from "prop-types";
import Dropdown from "./Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function Sqls({
  sqls,
  setNewSQLModal,
  dbIndex,
  delSQL,
  setNewSQL,
  setSelectedSQL,
  intervals,
  selectedInterval,
  setSelectedInterval,
  addIntervalSQL,
  delIntervalSQL,
  editSQL,
}) {
  return (
    <div className="sqls">
      <h4 className="heading">SQL</h4>
      <div className="tables-wrapper enable-overflow">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Label</th>
              <th scope="col">Type</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {sqls.map((sql, sqlIndex) => (
              <tr key={sqlIndex}>
                <th scope="row">{sqlIndex + 1}</th>
                <td className="whitespace-nowrap">{sql.label}</td>
                <td className="whitespace-nowrap">{sql.type}</td>
                <td>
                  <div className="inline-flex gap-4 items-center">
                    <button
                      type="button"
                      className="btn sky"
                      onClick={() => {
                        setSelectedSQL(sqlIndex);
                        editSQL(sql, sqlIndex);
                        setNewSQLModal(true);
                      }}
                    >
                      edit
                    </button>
                    <button
                      className="btn red"
                      onClick={() => delSQL(dbIndex, sqlIndex)}
                    >
                      delete
                    </button>
                    {intervals !== null && (
                      <Dropdown position="bottom left">
                        <div className="flex flex-col gap-4 p-4 w-72">
                          <div className="inline-flex gap-4 items-center w-full">
                            <select
                              className="px-2 py-1 w-full border rounded"
                              value={selectedInterval}
                              onChange={(e) =>
                                setSelectedInterval(e.target.value)
                              }
                            >
                              <option value="">Add interval</option>
                              {intervals.map((int, i) => (
                                <option key={i} value={i}>
                                  {int.value + " " + int.type}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn md green"
                              disabled={selectedInterval.length === 0}
                              onClick={() => {
                                addIntervalSQL(
                                  dbIndex,
                                  sqlIndex,
                                  intervals[selectedInterval]
                                );
                                setSelectedInterval("");
                              }}
                            >
                              add
                            </button>
                          </div>
                          {sql.intervals.length === 0 ? (
                            <div className="mx-auto text-slate-400">
                              Not running
                            </div>
                          ) : (
                            sql.intervals.map((interval, index) => (
                              <div
                                key={index}
                                className="inline-flex px-2 py-1 rounded gap-4 font-semibold items-center w-full justify-between bg-slate-200 text-slate-500"
                              >
                                <span>
                                  {interval.value} {interval.type}
                                </span>
                                <button
                                  onClick={() =>
                                    delIntervalSQL(dbIndex, sqlIndex, index)
                                  }
                                >
                                  <FontAwesomeIcon icon={faXmark} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </Dropdown>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* New Row */}
            <tr>
              <td colSpan={6}>
                <div className="flex flex-row items-center">
                  {sqls.length === 0 && (
                    <div className="text-slate-400">There is no SQL</div>
                  )}
                  <button
                    type="button"
                    className="ml-auto btn green"
                    onClick={() => setNewSQLModal(true)}
                  >
                    Add SQL
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

Sqls.propTypes = {
  sqls: PropTypes.array.isRequired,
};

export default Sqls;
