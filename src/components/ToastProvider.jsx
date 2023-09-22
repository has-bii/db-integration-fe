import { createContext, useContext, useEffect, useState } from "react";
import Toast from "./Toast";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [to, setTo] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      if (to) clearTimeout(to);

      setTo(setTimeout(() => setData(data.slice(1, data.length)), 2000));
    }
  }, [data]);

  function pushToast(status, message) {
    const id = data.length;

    setData((prev) => [...prev, { status, message, id }]);
  }

  function delToast(id) {
    setData(data.filter((dt) => dt.id !== id));
  }

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {data && <Toast messages={data} delToast={delToast} />}
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
