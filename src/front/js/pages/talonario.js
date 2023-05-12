import React, { useEffect, useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NewTalonario } from "../component/newTalonario";
import { Context } from "../store/appContext";
import Swal from "sweetalert2";
import "../../styles/talonario.css";
import { Payments } from "../component/payments";
import { BtnCompartir } from "../component/btnCompartir";

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
    actions.numberFilter(store.reservedTickets, store.talonarioSelect?.numbers);
  }, [store.reservedTickets]);

  useEffect(() => {
    if (store.talonarioSelect !== null) {
      actions.getTickets(store?.talonarioSelect?.id);
    }
  }, [store.talonarioSelect]);

  useEffect(() => {
    if (store.talonarios.length > 0) {
      actions.selectTalonario(store.talonarios[0].id);
    }
  }, [store.talonarios]);

  const deleteTalonario = () => {
    Swal.fire({
      title: "¿Estás seguro de elimnar la rifa?",
      text: "Se eliminarán todos los datos relacionados al talonario, eliminar unicamente si ya se conoce el ganador",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then((result) => {
      if (result.isConfirmed) {
        actions.deleteTalonario(store.talonarioSelect.id).then((response) => {
          console.log(response);
          if (response) {
            Swal.fire("Rifa eliminada!", "El talonario se elimino", "success");
          } else {
            Swal.fire(
              "Rifa no eliminada!",
              "El talonario no pudo ser eliminado",
              "error"
            );
          }
        });
      }
    });
  };

  const finishTalonario = () => {
    Swal.fire({
      title: "¿Estás seguro de finalizar la rifa?",
      text: "Al finalizar la rifa ya no se podrán comprar mas tickets de este talonario",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, finalizar",
    }).then((result) => {
      if (result.isConfirmed) {
        actions.updateTalonario(store.talonarioSelect.id).then((response) => {
          console.log(response);
          if (response) {
            Swal.fire(
              "Rifa finalizada!",
              "El talonario se actualizo a estado finalizado",
              "success"
            );
          } else {
            Swal.fire(
              "Rifa no finalizada!",
              "El talonario no pudo ser marcado como finalizado",
              "error"
            );
          }
        });
      }
    });
  };

  return (
    <>
      {store.talonarios.length > 0 ? (
        <>
          <div className="text-center mt-5 mb-5 text-white">
            <h1>{store.talonarioSelect?.name}</h1>
            <BtnCompartir talonario={store.talonarioSelect} />
            <NewTalonario />
            <div className="d-flex flex-column align-items-center mt-3">
              <label className="h4">Nuestra meta:</label>

              <div className="progress">
                <div
                  className="progress-bar bg-danger text-dark"
                  role="progressbar"
                  aria-label="Example with label"
                  style={{
                    width: `${
                      (store.reservedTickets.length * 100) /
                      store.talonarioSelect?.numbers
                    }%`,
                  }}
                  aria-valuenow="25"
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {(store.reservedTickets.length * 100) /
                    store.talonarioSelect?.numbers}
                  %
                </div>
              </div>
            </div>

            <div className="talonario d-flex flex-wrap justify-content-center p-2 gap-2  text-white">
              {store.tickets.map((numero, index) => (
                <div
                  key={index}
                  className={
                    numero.status == "reservado"
                      ? "numero_reservado numero d-flex justify-content-center"
                      : numero.status == "pagado"
                      ? "numero_pagado numero d-flex justify-content-center"
                      : "numero numero_disponible d-flex justify-content-center"
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
            <div className="mt-5">
              {store.talonarioSelect?.status === "activa" ? (
                <button className="btn btn-danger" onClick={finishTalonario}>
                  Finalizar Rifa
                </button>
              ) : (
                <button className="btn btn-danger" onClick={deleteTalonario}>
                  Eliminar Talonario
                </button>
              )}
            </div>
            <Payments />
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
