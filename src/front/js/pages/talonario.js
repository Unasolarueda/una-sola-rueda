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
      {store.talonarios.length > 0 ? (
        <>
          <div className="text-center mt-5 mb-5 text-white">
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
                  data-bs-target="#exampleModalToggle"
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
        </>
      ) : (
        <div className="text-center min-vh-100 d-flex justify-content-center align-items-center">
          <NewTalonario />
        </div>
      )}

      {/* Primer Modal */}
      <div
        className="modal fade"
        id="exampleModalToggle"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalToggleLabel">
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
              {ticketSelected.status !== "disponible" && (
                <button
                  className="btn btn-outline-dark btn-closed"
                  data-bs-target="#exampleModalToggle2"
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segundo Modal */}
      <div
        className="modal fade"
        id="exampleModalToggle2"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel2"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalToggleLabel2">
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
                  <strong>Nombre: {store.infoTicket?.user_name}</strong>
                </span>
                <span>
                  <strong>Teléfono: {store.infoTicket?.user_phone}</strong>
                </span>
                <span>
                  <strong>Email: {store.infoTicket?.user_email}</strong>
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
