import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Context } from "../store/appContext";
import toast, { Toaster } from "react-hot-toast";

import "../../styles/comprar.css";

export const Comprar = () => {
  const { store, actions } = useContext(Context);
  const params = useParams();
  const [name, setName] = useState("");
  const [idPago, setIdPago] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tickets, setTickets] = useState(0);
  const [dolar, setDolar] = useState(2);
  const [availableTickets, setAvailableTickets] = useState(0);
  let tasa = 25.0;
  let monto = tickets * store.talonarioCompra?.price;
  let montoBs = monto * tasa;
  const dateMs = Date.now();
  const actualDate = new Date(dateMs);
  const fecha = actualDate.toLocaleDateString();

  const sendData = async (event) => {
    event.preventDefault();
    if (
      name !== "" &&
      phone !== "" &&
      email !== "" &&
      tickets > 0 &&
      paymentMethod != "" &&
      idPago != ""
    ) {
      const response = await actions.sendPayment({
        payment_method: paymentMethod,
        payment_id: idPago,
        number_of_tickets: tickets,
        name: name,
        phone: phone,
        email: email,
        total: monto,
        date: fecha,
        talonario_id: params.talonario_id,
      });
      if (response) {
        actions.toggleMessage("ticket comprado exitosamente", true);
        setName("");
        setIdPago("");
        setPhone("");
        setEmail("");
        setTickets(0);
      } else {
        actions.toggleMessage(
          "No se pudo comprar los tickets, intente nuevamente",
          false
        );
      }
    } else {
      actions.toggleMessage("Complete todos los campos", false);
    }
  };

  const obtnerPagos = async () => {
    const response = await actions.getPayments(params.talonario_id);
    if (response) {
      await actions.getTalonario(params.talonario_id);
      let sumWithInitial = store.payments.reduce(
        (acc, obj) => acc + obj.number_of_tickets,
        0
      );
      setAvailableTickets(store.talonarioCompra?.numbers - sumWithInitial);
    }
  };

  useEffect(() => {
    obtnerPagos();
    if (tickets > availableTickets) {
      actions.toggleMessage("No hay suficientes Tickets", false);
    }
  }, [tickets]);

  useEffect(() => {
    actions.getTickets(params.talonario_id);
  }, []);

  return (
    <div className="d-flex justify-content-center row">
      <Toaster />
      <section className="perfil-usuario mt-5">
        <div className="wrapper">
          <div className="cover">
            <h4 className="text-white"> {store.talonarioCompra?.name}</h4>
            <img
              src={store?.talonarioCompra?.img_url_prize}
              className="fportada"
            />
          </div>
          <div className="id-section">
            <div className="circle">
              <img
                src="https://res.cloudinary.com/drcuplwe7/image/upload/v1680654977/STICKERS_CRUZANGELO_k8nf24.png"
                className="logo"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="cuadro ">
        <div className="input-group p-5">
          {/* cambiar a p  */}
          <div className="precio-ticket w-100">
            <p className="text-center h2">
              {tickets} x ${store.talonarioCompra?.price} = ${monto} ó Bs.
              {montoBs}
            </p>
            <p className="tasa-cambio text-center h2">
              $1 <i className="fa-solid fa-right-left fa-fade"></i> Bs.{tasa}
            </p>
          </div>
        </div>

        <div className="container text-center d-flex justify-content-center ">
          <div className="cuatro row">
            <button
              disabled={availableTickets < 2 ? true : false}
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(2)}
            >
              <h2>+02</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>
            <button
              disabled={availableTickets < 5 ? true : false}
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(5)}
            >
              <h2>+05</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>

            <div className="w-100 d-none d-md-block"></div>

            <button
              disabled={availableTickets < 10 ? true : false}
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(10)}
            >
              <h2>+10</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>
            <button
              disabled={availableTickets < 20 ? true : false}
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(20)}
            >
              <h2>+20</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>
          </div>
        </div>

        <div className="input-group px-5 pt-5 pb-5">
          <button
            disabled={tickets < 1 ? true : false}
            className="btn btn-outline-secondary"
            type="button"
            id="button-addon1"
            onClick={() => setTickets(tickets - 1)}
          >
            -
          </button>
          <input
            type="number"
            className="input form-control"
            placeholder="10"
            aria-label="Example text with button addon"
            aria-describedby="button-addon1"
            value={tickets}
            onChange={(e) => setTickets(Number(e.target.value))}
          />

          <button
            disabled={tickets >= availableTickets ? true : false}
            className="btn btn-outline-secondary"
            type="button"
            id="button-addon1"
            onClick={() => setTickets(tickets + 1)}
          >
            +
          </button>
        </div>

        <form
          onSubmit={sendData}
          className="col g-3 d-flex align-items-center flex-column needs-validation"
        >
          <div className="col-10">
            <label htmlFor="validationCustom01" className="form-label">
              Nombre y Apellido:
            </label>
            <input
              type="text"
              className="form-control"
              id="validationCustom01"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Pedro Perez"
              required
            />
          </div>
          <div className="col-10">
            <label htmlFor="validationCustom02" className="form-label">
              Numero Telefono:
            </label>
            <input
              type="text"
              className="form-control"
              id="confirmationNumber validationCustom02"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="04XX1234567"
              required
            />
          </div>
          <div className="col-10">
            <label htmlFor="validationCustom02" className="form-label">
              Correo:
            </label>
            <input
              type="email"
              className="form-control"
              id="validationCustom02"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tucorreo@correo.com"
              required
            />
          </div>
          <div className="col-10 d-flex justify-content-center mt-4">
            <div className="metododepago">
              <label
                htmlFor="exampleFormControlTextarea1"
                className="form-label"
              >
                <p>Método de pago:</p>
              </label>
              <select
                className="form-select"
                aria-label="Default select example"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="">Seleccione método de pago</option>
                <option value="banco santander">banco santander</option>
                <option value="pago movil">Pago movil</option>
                <option value="zelle">Zelle</option>
              </select>
            </div>
          </div>
          {paymentMethod == "pago movil" ? (
            <div className="datos-transferencia">
              Angelo Pasquale <br />
              12163660 <br />
              04241854650 <br />
            </div>
          ) : paymentMethod == "banco santander" ? (
            <div className="datos-transferencia">
              Cruzangelo Jhosed Pasquale <br />
              26.510.063-5 <br />
              Cuenta: 71001956137 <br />
              Banco: Santander <br />
              Tipo de cuenta: Vista <br />
            </div>
          ) : (
            paymentMethod == "zelle" && (
              <div className="datos-transferencia">
                +13464535821 <br />
                Jesus Pasquale <br />
                Nota:con el numero podra hacer el zelle sin usar correo
                <br />
              </div>
            )
          )}
          {/* boton adjuntar archivo*/}
          {/* <div className="mt-3">
            <input className="adjuntar-archivo form" type="file" />
          </div> */}
          <div className="col-10">
            <label htmlFor="validationCustom02" className="form-label">
              Id de pago:
            </label>
            <input
              type="text"
              className="form-control"
              id="validationCustom02"
              value={idPago}
              onChange={(event) => setIdPago(event.target.value)}
              placeholder="1k234j4"
              required
            />
          </div>
          <div className="col-10">
            <label htmlFor="validationCustom02" className="form-label">
              Fecha: {fecha}
            </label>
          </div>
          {tickets <= availableTickets && (
            <button
              type="submit"
              className="botonc btn btn-success d-flex justify-content-center"
            >
              Comprar
            </button>
          )}
        </form>
      </div>

      <div className="datos-comprar d-flex justify-content-center"></div>
    </div>
  );
};
