import React from "react";

import "../../styles/administrador.css";

export const Administrador = () => {
  return (
    <div className="container-login">
      <div className="login text-center">
        <h1>Panel Administrativo</h1>
        <form>
          <div className="form-group">
            <label className="form-label" for="email">
              <b>Usuario:</b>
            </label>
            <input className="form-control" type="email" id="email" required />
          </div>
          <div className="form-group">
            <label className="form-label" for="password">
              <b>Contraseña:</b>
            </label>
            <input
              className="form-control"
              type="password"
              id="password"
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
