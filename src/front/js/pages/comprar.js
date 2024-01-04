import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Context } from '../store/appContext';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

import '../../styles/comprar.css';
import { TalonarioFinalizado } from '../component/talonarioFinalizado';

export const Comprar = () => {
  const { store, actions } = useContext(Context);
  const params = useParams();
  const [errors, setErrors] = useState({});
  const [name, setName] = useState('');
  const [idPago, setIdPago] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tickets, setTickets] = useState(0);
  const [dolar, setDolar] = useState({});
  const [availableTickets, setAvailableTickets] = useState(0);

  let monto = tickets * store.talonarioCompra?.price;
  let montoBs = monto * dolar.dollar;

  //Regex
  // name: ^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$
  // email: ^(?=.*[a-zA-Z])[a-zA-Z0-9_.+-]+@(gmail|yahoo|hotmail|outlook)\.(com|es)$

  const sendData = async (event) => {
    event.preventDefault();
    const err = onValidate({
      name,
      idPago,
      phone,
      email,
      paymentMethod,
      tickets,
    });
    setErrors(err);
    console;
    if (Object.keys(err).length === 0) {
      const response = await actions.sendPayment({
        payment_method: paymentMethod,
        payment_id: idPago,
        number_of_tickets: tickets,
        name: name,
        phone: phone,
        email: email,
        total: monto,
        talonario_id: params.talonario_id,
      });
      if (response) {
        Swal.fire(
          'Tickets comprados con éxito',
          'Su pago ha sido procesado, espere a que sea verificado, luego de ello recibirá un correo con sus números en su bandeja de spam, tenga paciencia, no intente comprar nuevamente, NUMERO DE SOPORTE SOLO VIA WHATSAPP NO LLAMADAS +584241326694',
          'success',
        );
        setName('');
        setIdPago('');
        setPhone('');
        setPaymentMethod('');
        setEmail('');
        setTickets(0);
      } else {
        Swal.fire(
          'Error Tickets',
          'No se pudo comprar los tickets, intente nuevamente',
          'error',
        );
      }
    } else {
      actions.toggleMessage('Complete todos los campos', false);
    }
  };

  const onValidate = (form) => {
    let errors = {};
    const regexName = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;
    const regexEmail =
      /(^(?=.*[a-zA-Z])[a-zA-Z0-9_.+-]+@(gmail|yahoo|hotmail|outlook)\.(com|es)$)/m;

    if (!form.name.trim()) {
      errors.name = "El campo 'Nombre y Apellido' no debe ser vacio";
    } else if (!regexName.test(form.name)) {
      errors.name =
        "El campo 'Nombre y Apellido' solo acepta letras y espacios";
    }

    if (!form.idPago.trim()) {
      errors.idPago = "El campo 'Número de referencia' no debe ser vacio";
    }

    if (!form.phone.trim()) {
      errors.phone = "El campo 'Número Teléfono' no debe ser vacio";
    }

    if (!form.email.trim()) {
      errors.email = "El campo 'Correo' no debe ser vacio";
    } else if (!regexEmail.test(form.email)) {
      errors.email = 'El correo ingresado no es válido';
    }

    if (!form.paymentMethod.trim()) {
      errors.paymentMethod = 'Seleccione un Método de pago';
    }

    if (form.tickets < 2) {
      errors.tickets = 'La compra miníma es de 2 tickets';
    }

    return errors;
  };

  const obtnerPagos = async () => {
    const response = await actions.getPayments(params.talonario_id);
    if (response) {
      await actions.getTalonario(params.talonario_id);
      let sumWithInitial = store.payments.reduce(
        (acc, obj) => acc + obj.number_of_tickets,
        0,
      );
      setAvailableTickets(store.talonarioCompra?.numbers - sumWithInitial);
    }
  };

  const getTasaDolar = async () => {
    try {
      const response = await fetch(
        'https://venecodollar.vercel.app/api/v2/dollar/entity?name=D%C3%B3lar%20Monitor',
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error);
      }
      const data = await response.json();
      setDolar(data.Data.info);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    obtnerPagos();
    if (tickets > availableTickets) {
      actions.toggleMessage('No hay suficientes Tickets', false);
    }
  }, [tickets]);

  useEffect(() => {
    getTasaDolar();
  }, []);

  return (
    <div className="d-flex justify-content-center row">
      <Toaster />

      {store.talonarioCompra?.status == 'activa' ? (
        <>
          <section className="perfil-usuario mt-5">
            <div className="wrapper">
              <div className="cover">
                <h4 className="text-white"> {store.talonarioCompra?.name}</h4>
                <img
                  src={store?.talonarioCompra?.img_url_prize}
                  className="fportada"
                />
              </div>
            </div>
          </section>
          <div className="cuadro p-1 mt-3">
            <div className="input-group mt-3">
              <div className="precio-ticket w-100">
                <p className="text-center h2">
                  {tickets} x ${store.talonarioCompra?.price} = ${monto} ó Bs.
                  {montoBs.toFixed(2)}
                </p>
                <p className="tasa-cambio text-center h2">
                  $1 <i className="fa-solid fa-right-left fa-fade"></i> Bs.
                  {dolar.dollar}
                </p>
              </div>
            </div>

            <div className="container text-center d-flex justify-content-center mt-3">
              <div className="row gap-2 justify-content-center">
                <div className="col-12 col-lg-4">
                  <button
                    disabled={availableTickets < 2 ? true : false}
                    type="button"
                    className="opcion  btn btn-outline-secondary w-100 d-flex flex-column align-items-center gap-1"
                    onClick={() => setTickets(2)}
                  >
                    <div className="d-flex h-100 flex-column align-items-center justify-content-center">
                      <h2 className="select-number">+02</h2>
                      <h3 className="seleccionar">SELECCIONAR</h3>
                    </div>
                  </button>
                </div>
                <div className="col-12 col-lg-4">
                  <button
                    disabled={availableTickets < 5 ? true : false}
                    type="button"
                    className="opcion btn btn-outline-secondary w-100"
                    onClick={() => setTickets(5)}
                  >
                    <h2 className="select-number">+05</h2>
                    <h3 className="seleccionar">SELECCIONAR</h3>
                  </button>
                </div>
                <div className="col-12 col-lg-4">
                  <button
                    disabled={availableTickets < 10 ? true : false}
                    type="button"
                    className="opcion  btn btn-outline-secondary w-100"
                    onClick={() => setTickets(10)}
                  >
                    <h2 className="select-number">+10</h2>
                    <h3 className="seleccionar">SELECCIONAR</h3>
                  </button>
                </div>
                <div className="col-12 col-lg-4">
                  <button
                    disabled={availableTickets < 20 ? true : false}
                    type="button"
                    className="opcion btn btn-outline-secondary w-100"
                    onClick={() => setTickets(20)}
                  >
                    <h2 className="select-number">+20</h2>
                    <h3 className="seleccionar">SELECCIONAR</h3>
                  </button>
                </div>
              </div>
            </div>
            {errors.tickets && (
              <div className="alert alert-danger p-1" role="alert">
                {errors.tickets}
              </div>
            )}
            <div className="input-group d-flex flex-column px-3 py-5">
              <button
                disabled={tickets >= availableTickets ? true : false}
                className="btn btn-outline-secondary"
                type="button"
                id="button-addon1"
                onClick={() => setTickets(tickets + 1)}
              >
                +
              </button>
              <input
                type="number"
                className="input form-control w-100 text-center"
                placeholder="10"
                aria-label="Example text with button addon"
                aria-describedby="button-addon1"
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
              />
              <button
                disabled={tickets <= 2 ? true : false}
                className="btn btn-outline-secondary"
                type="button"
                id="button-addon1"
                onClick={() => setTickets(tickets - 1)}
              >
                -
              </button>
            </div>

            <form
              onSubmit={sendData}
              className="col g-3 d-flex align-items-center flex-column needs-validation"
            >
              <div className="col-10">
                <label
                  htmlFor="validationCustom01"
                  className="form-label fw-bold"
                >
                  Nombre y Apellido:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="validationCustom01"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Pedro Perez"
                />
                {errors.name && (
                  <div className="alert alert-danger p-1" role="alert">
                    {errors.name}
                  </div>
                )}
              </div>
              <div className="col-10">
                <label
                  htmlFor="validationCustom02"
                  className="form-label fw-bold"
                >
                  Número de teléfono:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="confirmationNumber validationCustom02"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="04XX1234567"
                />
                {errors.phone && (
                  <div className="alert alert-danger p-1" role="alert">
                    {errors.phone}
                  </div>
                )}
              </div>
              <div className="col-10">
                <label
                  htmlFor="validationCustom02"
                  className="form-label fw-bold"
                >
                  Correo:
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="validationCustom02"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tucorreo@correo.com"
                />
                {errors.email && (
                  <div className="alert alert-danger p-1" role="alert">
                    {errors.email}
                  </div>
                )}
              </div>
              <div className="col-10 d-flex justify-content-center mt-4">
                <div className="metododepago text-center">
                  <label
                    htmlFor="exampleFormControlTextarea1"
                    className="form-label fw-bold"
                  >
                    <p>Método de pago:</p>
                  </label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="">SELECCIONE SUS MÉTODOS DE PAGO</option>
                    <option value="banco santander">
                      LOS HEROES PREPAGO CHILE
                    </option>
                    <option value="pago movil">PAGO MÓVIL</option>
                    <option value="zelle">ZELLE</option>
                    <option value="binance">BINANCE-USDT</option>
                  </select>
                </div>
              </div>
              {paymentMethod == 'pago movil' ? (
                <div className="datos-transferencia">
                  Banco de Venezuela 0102 <br />
                  V-14072384 <br />
                  04241326694 <br />
                </div>
              ) : paymentMethod == 'banco santander' ? (
                <div className="datos-transferencia">
                  Teryl Castillo
                  <br />
                  Banco: Los Heroes PrePago <br />
                  Tipo de cta: Cuenta Vista Los Héroes
                  <br />
                  Teléfono: +56930016493 <br />
                  Número de cta: 126935972 <br />
                  Rut: 26.935.972-2 <br />
                </div>
              ) : (
                paymentMethod == 'zelle' && (
                  <div className="datos-transferencia">
                    <p>+13464535821 </p>
                    <p>Jesus Pasquale </p>
                    <p>
                      Nota:con el numero podra hacer el zelle sin usar correo
                    </p>
                  </div>
                ) : (
                  paymentMethod == 'binance' ? (
                  <div className="datos-transferencia">
                  <p>ID
                  <p>THE
                  <p>
                    Nota:con el ID podra hacer el pago sin usar correo
               </p>
               </div>
                ) 
              )}
              {errors.paymentMethod && (
                <div className="alert alert-danger p-1" role="alert">
                  {errors.paymentMethod}
                </div>
              )}
              <div className="col-10">
                <label
                  htmlFor="validationCustom02"
                  className="form-label fw-bold"
                >
                  Número de referencia - Operación - Movimiento:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="validationCustom02"
                  value={idPago}
                  onChange={(event) => setIdPago(event.target.value)}
                  placeholder="1k234j4"
                />
                {errors.idPago && (
                  <div className="alert alert-danger p-1" role="alert">
                    Introduzca su Número de referencia
                  </div>
                )}
              </div>

              {tickets <= availableTickets && (
                <button
                  type="submit"
                  className="botonc btn btn-success d-flex justify-content-center w-75"
                >
                  Comprar
                </button>
              )}
            </form>
          </div>
        </>
      ) : store.talonarioCompra?.status == 'finalizada' ? (
        <TalonarioFinalizado />
      ) : (
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
    </div>
  );
};
