import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import logonav from "../../img/STICKERS CRUZANGELO.png";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const location = useLocation();
  return (
    <nav className="navbar navbar-expand-lg bg-dark">
      {location.pathname == "/administrador/users" ? (
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={logonav} className="logonav-secondary"></img>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon">
              <span className="" role="button">
                <i
                  className="fa fa-bars"
                  aria-hidden="true"
                  style={{ color: "white" }}
                ></i>
              </span>
            </span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="w-100 d-flex justify-content-end">
              <ul className="navbar-nav">
                <li className="nav-item px-2">
                  <Link
                    className="nav-link active text-white fw-bold"
                    aria-current="page"
                    to="/administrador/talonarios"
                  >
                    Talonarios
                  </Link>
                </li>
                {store.role && store.role !== "raffler" && (
                  <li className="nav-item px-2">
                    <Link className="nav-link text-white fw-bold" to="#">
                      Usuarios
                    </Link>
                  </li>
                )}

                <li className="nav-item px-2">
                  <Link
                    className="nav-link text-dark fw-bold btn btn-danger"
                    to="#"
                  >
                    Cerrar Sesión
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center w-100">
          <img src={logonav} className="logonav-main"></img>
        </div>
      )}
    </nav>
  );
};
