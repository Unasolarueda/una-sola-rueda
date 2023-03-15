import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";

export const Payments = () => {
  const { store, actions } = useContext(Context);
  useEffect(() => {
    if (store?.talonarioSelect?.id !== undefined) {
      actions.getPayments(store?.talonarioSelect?.id);
    }
  }, [store.talonarioSelect]);

  return (
    <div className="container  table-responsive table-user mt-5 mb-4">
      <table className="table text-white">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Fecha</th>
            <th scope="col">Método de pago</th>
            <th scope="col">ID pago</th>
            <th scope="col">Tickets comprados</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {store.payments.map((payment, index) => (
            <tr key={payment.id}>
              <th scope="row">{index + 1}</th>
              <td>{new Date(payment.date).toLocaleDateString()}</td>
              <td>{payment.payment_method}</td>
              <td>{payment.payment_id}</td>
              <td>{payment.number_of_tickets}</td>
              <td>{payment.total}</td>
              <td>
                <button
                  className="btn btn-success"
                  onClick={() =>
                    actions.buyTickets(
                      payment.number_of_tickets,
                      payment.talonario_id,
                      payment.user_ticket_id
                    )
                  }
                >
                  Aprobar
                </button>
              </td>
              <td>
                <button className="btn btn-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
