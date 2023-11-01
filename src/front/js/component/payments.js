import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Context } from '../store/appContext';
import { PaymentDetail } from './paymentDetail';

export const Payments = () => {
  const { store, actions } = useContext(Context);
  const [togglePaymentDetails, setTogglePaymentDetails] = useState(false);
  const [detailPayments, setDetailPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [showPayment, setShowPayment] = useState(true);

  const handleTogglePaymentDetails = useCallback(() => {
    setTogglePaymentDetails(!togglePaymentDetails);
  }, [togglePaymentDetails]);

  const handlePayment = async (number_of_tickets, talonario_id, paymentId) => {
    let response = await actions.buyTickets(
      number_of_tickets,
      talonario_id,
      paymentId,
    );
    if (response) {
      actions.toggleMessage('Tickets reservados', true);
      let responsePayment = await actions.updatePayment(
        paymentId,
        talonario_id,
      );
      if (responsePayment) {
        actions.toggleMessage('Pago aprobado', true);
        await actions.sendEmailVerifiedPayment(paymentId);
      } else actions.toggleMessage('El pago no pudo ser aprobado', false);
    } else {
      actions.toggleMessage('No se pudo reservar los tickets', false);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(event.target.value);
  };

  const handleDetailPayment = async (paymentId) => {
    const response = await actions.getTicketsByPaymentId(
      paymentId,
      store?.talonarioSelect?.id,
    );
    if (response) {
      setDetailPayments(response);
      if (!togglePaymentDetails) {
        handleTogglePaymentDetails();
      }
    }
  };

  useEffect(() => {
    if (store?.talonarioSelect?.id !== undefined) {
      actions.getPayments2(store?.talonarioSelect?.id);
      setSearch('');
    }
  }, [store.talonarioSelect]);

  useEffect(() => {
    let timeoutId;

    timeoutId = setTimeout(() => {
      actions.getPayments2(store?.talonarioSelect?.id, search);
    }, 500);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [search]);

  return (
    <div className="mt-3">
      <h3>Pagos</h3>
      <div className="d-flex justify-content-center w-100 my-3">
        <input
          className="w-50 form-control"
          type="text"
          placeholder="Buscar por nombre, celular, referencia, email"
          onChange={handleSearch}
          value={search}
        />
      </div>

      <div className="d-flex justify-content-center w-100 my-3">
        {togglePaymentDetails ? (
          <PaymentDetail
            onClick={handleTogglePaymentDetails}
            details={detailPayments}
          />
        ) : null}
      </div>

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
              <th scope="col"># Orden</th>
              <th scope="col">Fecha</th>
              <th scope="col">Método de pago</th>
              <th scope="col">Celular</th>
              <th scope="col">Nombre</th>
              <th scope="col"># Referencia</th>
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
                  <th scope="row">
                    <div className="d-flex flex-column">
                      <span>{payment.id}</span>
                      {payment.status == `aprobado` ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDetailPayment(payment.id)}
                        >
                          Ver Tickets
                        </button>
                      ) : null}
                    </div>
                  </th>
                  <td>
                    {new Date(payment.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.phone}</td>
                  <td>{payment.name}</td>
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
                              payment.id,
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
                              payment.talonario_id,
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
