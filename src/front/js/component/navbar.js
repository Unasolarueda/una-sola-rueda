import React, { useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../store/appContext";
import logonav from "../../img/STICKERS CRUZANGELO.png";
import toast, { Toaster } from "react-hot-toast";
import { NewTalonario } from "./newTalonario";

export const Navbar = () => {
  const { store, actions } = useContext(Context);
  const location = useLocation();

  useEffect(() => {
    if (store.message.text === "") return;
    if (store.message.type) {
      toast.success(store.message.text);
    } else {
      toast.error(store.message.text);
    }
  }, [store.message]);

  return (
    <nav className="navbar navbar-expand-md sticky-top bg-dark navbar-dark bg-dark">
      {location.pathname == "/administrador/users" ||
      location.pathname == "/administrador/talonarios" ? (
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src={logonav} className="logonav-secondary"></img>
          </Link>
          <Toaster />
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <div className="w-100 d-flex justify-content-end">
              <ul className="navbar-nav">
                <li className="nav-item px-2">
                  {location.pathname !== "/administrador/talonarios" ? (
                    <Link
                      className="nav-link active text-white fw-bold"
                      aria-current="page"
                      to="/administrador/talonarios"
                    >
                      Talonarios
                    </Link>
                  ) : (
                    <div className="dropdown dropdown-menu-start">
                      <button
                        className="btn btn-dark fw-bold dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Talonarios
                      </button>
                      <ul className="dropdown-menu dropdown-navbar px-4">
                        {store.talonarios.map((talonario) => (
                          <li
                            key={talonario.id}
                            onClick={(e) =>
                              actions.selectTalonario(talonario.id)
                            }
                          >
                            <span className="dropdown-item dropdown-item-navbar">
                              {talonario.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
                {store.role && store.role !== "raffler" && (
                  <li className="nav-item px-2">
                    <Link
                      className="nav-link text-white fw-bold"
                      to="/administrador/users"
                    >
                      Usuarios
                    </Link>
                  </li>
                )}

                <li className="nav-item px-2">
                  <button
                    className="nav-link text-dark fw-bold btn btn-danger"
                    onClick={() => actions.logout()}
                  >
                    Cerrar Sesión
                  </button>
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
