import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";
import toast, { Toaster } from "react-hot-toast";

import "../../styles/administrador.css";

export const Administrador = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sendData = async (event) => {
    event.preventDefault();
    if (email !== "" && password !== "") {
      const login = await actions.login(email, password);
      if (login) {
        actions.toggleMessage("Logueado correctamente", true);
        setEmail("");
        setPassword("");
        navigate("/administrador/talonarios");
      } else {
        actions.toggleMessage("Credenciales inválidas", false);
      }
    } else {
      actions.toggleMessage("Complete todos los campos", false);
    }
  };

  useEffect(() => {
    if (store.token && store.token !== null) {
      navigate("/administrador/talonarios");
    }
  }, [store.token]);

  return (
    <div className="container-login">
      <Toaster />
      <div className="login text-center text-white">
        <h1>Panel Administrativo</h1>
        <form onSubmit={sendData}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <b>Usuario:</b>
            </label>
            <input
              className="form-control"
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <b>Contraseña:</b>
            </label>
            <input
              className="form-control"
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <input
            className="btn btn-danger w-100 btn-ingresar"
            type="submit"
            value="Ingresar"
          />
        </form>
      </div>
    </div>
  );
};
