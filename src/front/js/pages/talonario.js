import React, { useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NewTalonario } from "../component/newTalonario";
import { Context } from "../store/appContext";

export const Talonario = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.token) {
      navigate("/");
    }
  }, [store.token]);

  return (
    <>
      <>
        <div className="text-center mt-5 mb-5">
          <h1>Tickets</h1>

          <div className="talonario d-flex flex-wrap justify-content-center p-2 gap-2">
            <div data-bs-toggle="modal" data-bs-target="#exampleModal"></div>
          </div>
        </div>
      </>
      <div className="text-center min-vh-100 d-flex justify-content-center align-items-center">
        <NewTalonario />
      </div>

      {/*Primer modal */}

      <div
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Ticket
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex flex-column">
              <span>
                <strong>Estado:</strong>
              </span>

              <button
                className="btn btn-outline-dark btn-closed"
                data-bs-target="#exampleModalToggle2"
                data-bs-toggle="modal"
              >
                Ver datos del participante
              </button>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-dark btn-closed"
                data-bs-dismiss="modal"
              >
                Volver
              </button>

              <button
                type="button"
                className="btn btn-success btn-liberar"
                data-bs-dismiss="modal"
              >
                Liberar Ticket
              </button>

              <button
                type="button"
                className="btn btn-primary register"
                data-bs-dismiss="modal"
              >
                Marcar como pagado
              </button>
            </div>
          </div>
        </div>
      </div>
      {/*Segundo modal */}
      <div
        className="modal fade"
        id="exampleModalToggle2"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel2"
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalToggleLabel2">
                Información del ticket
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-column">
                <span>
                  <strong>Nombre: </strong>
                </span>
                <span>
                  <strong>Teléfono: </strong>
                </span>
                <span>
                  <strong>Email: </strong>
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline-dark btn-closed"
                data-bs-target="#exampleModalToggle"
                data-bs-toggle="modal"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
