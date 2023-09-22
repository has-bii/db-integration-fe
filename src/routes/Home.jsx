import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Home() {
  const [cookies, setCookie] = useCookies(["access_token"]);
  const [configs, setConfigs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!cookies.access_token) navigate("/login");
  }, []);

  return <Layout></Layout>;
}
