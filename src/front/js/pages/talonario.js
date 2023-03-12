import React, { useEffect, useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NewTalonario } from "../component/newTalonario";
import { Context } from "../store/appContext";
import "../../styles/talonario.css";

export const Talonario = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [ticketSelected, setTicketSelected] = useState({});

  useEffect(() => {
    if (!store.token) {
      navigate("/");
    }
  }, [store.token]);

  useEffect(() => {
    if (store.talonarios && store.talonarios.length > 0) return;
    actions.getTalonarios();
  }, []);

  useEffect(() => {
    actions.numberFilter(store.reservedTickets);
  }, [store.reservedTickets]);

  useEffect(() => {
    if (store.talonarioSelect !== undefined) {
      actions.getTickets(store?.talonarioSelect?.id);
    }
  }, [store.talonarioSelect]);

  useEffect(() => {
    if (store.talonarios.length > 0) {
      actions.selectTalonario(store.talonarios[0].id);
    }
  }, [store.talonarios]);

  return (
    <>
      <div className="text-center mt-5 mb-5">
        <h1>Tickets</h1>

        <div className="talonario d-flex flex-wrap justify-content-center p-2 gap-2">
          <div data-bs-toggle="modal" data-bs-target="#exampleModal2"></div>
        </div>
      </div>
      <div className="text-center mt-5 mb-5">
        <h1>Tickets</h1>
        <div className="talonario d-flex flex-wrap justify-content-center p-2 gap-2  text-white">
          {store.tickets.map((numero, index) => (
            <div
              value={`${numero.status} ${numero.value}`}
              key={index}
              className={
                numero.status == "reservado"
                  ? "numero_reservado numero"
                  : numero.status == "pagado"
                  ? "numero_pagado numero"
                  : "numero numero_disponible"
              }
              data-bs-toggle="modal"
              data-bs-target="#exampleModal2"
              onClick={(e) =>
                setTicketSelected({
                  value: numero.value,
                  numero: numero.numero,
                  status: numero.status,
                })
              }
            >
              {numero.value}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center min-vh-100 d-flex justify-content-center align-items-center">
        <NewTalonario />
      </div>

      {/*Primer modal */}

      <div
        className="modal fade"
        id="exampleModal2"
        tabIndex={-1}
        aria-labelledby="exampleModal2Label"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModal2Label">
                Ticket {ticketSelected.value}
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
                <strong>Estado: {ticketSelected.status}</strong>
              </span>

              <button
                className="btn btn-outline-dark btn-closed"
                data-bs-target="#exampleModal2Toggle2"
                data-bs-toggle="modal"
                onClick={(e) =>
                  actions.infoTicket(
                    ticketSelected.numero,
                    store.talonarioSelect.id
                  )
                }
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
        id="exampleModal2Toggle2"
        aria-hidden="true"
        aria-labelledby="exampleModal2ToggleLabel2"
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModal2ToggleLabel2">
                Información del ticket {ticketSelected.value}
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
                data-bs-target="#exampleModal2Toggle"
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
