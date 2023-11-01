import React from 'react';
import '../../styles/talonario.css';

export const PaymentDetail = ({ onClick, details }) => {
  return (
    <div className="w-50 p-2 details">
      <h3>Tickets de la orden #{details[0].payment_id}</h3>
      <div className="d-flex flex-wrap gap-2 mb-2 justify-content-center">
        {details.map((numero, index) => (
          <div
            key={index}
            className="numero_reservado numero d-flex justify-content-center"
          >
            {numero.number}
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-primary" onClick={onClick}>
        Cerrar
      </button>
    </div>
  );
};
