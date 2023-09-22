import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./routes/Home";
import Login from "./routes/auth";
import "./index.css";
import { CookiesProvider } from "react-cookie";
import Database from "./routes/database";
import ErrorDatabase from "./routes/errorDatabase";
import { ToastProvider } from "./components/ToastProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/database",
    element: <Database />,
  },
  {
    path: "/error",
    element: <ErrorDatabase />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <CookiesProvider defaultSetCookies={{ path: "/" }}>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </CookiesProvider>
  // </React.StrictMode>
);
