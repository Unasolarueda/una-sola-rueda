import React, { useEffect, useContext, useState } from "react";
import { Context } from "../store/appContext";

export const Payments = () => {
  const { store, actions } = useContext(Context);
  const [showPayment, setShowPayment] = useState(true);
  useEffect(() => {
    if (store?.talonarioSelect?.id !== undefined) {
      actions.getPayments(store?.talonarioSelect?.id);
    }
  }, [store.talonarioSelect]);

  const handlePayment = async (number_of_tickets, talonario_id, paymentId) => {
    let response = await actions.buyTickets(
      number_of_tickets,
      talonario_id,
      paymentId
    );
    console.log(response);
    if (response) {
      actions.toggleMessage("Tickets reservados", true);
      let responsePayment = await actions.updatePayment(
        paymentId,
        talonario_id
      );
      if (responsePayment) {
        actions.toggleMessage("Pago aprobado", true);
        await actions.sendEmailVerifiedPayment(paymentId);
      } else actions.toggleMessage("El pago no pudo ser aprobado", false);
    } else {
      actions.toggleMessage("No se pudo reservar los tickets", false);
    }
  };

  return (
    <div className="mt-3">
      <h3>Pagos</h3>

      <div className="container  table-responsive table-user  mb-4">
        <div className="d-flex justify-content-center gap-2 mt-1">
          <button
            className={
              showPayment ? `btn btn-outline-danger` : `btn btn-danger`
            }
            onClick={() => setShowPayment(false)}
          >
            Aprobados
          </button>
          <button
            className={
              showPayment ? `btn btn-danger` : `btn btn-outline-danger`
            }
            onClick={() => setShowPayment(true)}
          >
            No aprobados
          </button>
        </div>
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
            {store.payments
              .filter((payment) => {
                if (showPayment) {
                  return payment.status == `no-aprobado`;
                } else {
                  return payment.status == `aprobado`;
                }
              })
              .map((payment, index) => (
                <tr key={payment.id}>
                  <th scope="row">{index + 1}</th>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.payment_id}</td>
                  <td>{payment.number_of_tickets}</td>
                  <td>{payment.total}</td>
                  {payment.status == `no-aprobado` && (
                    <>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            handlePayment(
                              payment.number_of_tickets,
                              payment.talonario_id,
                              payment.id
                            )
                          }
                        >
                          Aprobar
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            actions.deletePayment(
                              payment.id,
                              payment.talonario_id
                            )
                          }
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
