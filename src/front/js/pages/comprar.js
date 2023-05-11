import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { Context } from "../store/appContext";

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
  let tasa = 25.00;
  let monto = tickets * dolar;
  let montoBs = monto * tasa;
  const dateMs = Date.now();
  const actualDate = new Date(dateMs);
  const fecha = actualDate.toLocaleDateString();
  const numeroDeTalonario = store?.talonarioCompra?.id;
  console.log(store?.talonarioCompra?.id);
  //const numeroDeTalonario = 1;

  console.log(fecha);

  const sendData = (event) => {
    event.preventDefault();
    if (name !== "" && phone !== "" && email !== "") {
      actions.sendPayment({
        payment_method: paymentMethod,
        payment_id: idPago,
        number_of_tickets: tickets,
        name: name,
        phone: phone,
        email: email,
        total: monto,
        date: fecha,
        talonario_id: numeroDeTalonario,
      });
      actions.toggleMessage("ticket comprado exitosamente",true);
      setName("");
      setIdPago("");
      setPhone("");
      setEmail("");
      } else {
        actions.toggleMessage("No se pudo comprar ticket", false);
      }
    
  };

  useEffect(() => {
    if (params.talonario_id !== undefined) {
      actions.getPayments(params.talonario_id);
    }
  }, [store.talonarioSelect]);

  let reservedButNotPaidArray = store.payments.filter(index => index.status == "no-aprobado")
 console.log(reservedButNotPaidArray);
  let totalReservedButNotPaidTickets = reservedButNotPaidArray.reduce ((sum, index) => sum + index.number_of_tickets,0 )
  console.log(totalReservedButNotPaidTickets);
  


  const validForm = (form) => {
    let errors = {};
    let validName = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/;
    let validPhone = /[+]*[0-9]{1,4}/;
    let validEmail = /^(\w+[/./-]?){1,}@[a-z]+[/.]\w{2,}$/;
    if (!form.name.trim()) {
      errors.name = "El campo es requerido";
    } else if (!validName.test(form.name.trim())) {
      errors.name = "El campo solo acepta letras";
    }

    if (!form.phone.trim()) {
      errors.phone = "El campo es requerido";
    } else if (!validPhone.test(form.phone.trim())) {
      errors.name = "El campo solo acepta (+) y numeros";
    }

    if (!form.email.trim()) {
      errors.email = "El campo es requerido";
    } else if (!validEmail.test(form.email.trim())) {
      errors.name = "El campo solo acepta email";
    }

    return errors;
  };

  useEffect(() => {
    actions.getTalonario(params.talonario_id);
    actions.getTickets(params.talonario_id);
  }, []);
  

    let ticketsDisponibles = 0
    if(store.reservedTickets != 0 && store.talonarioCompra.numbers != 0) {
    ticketsDisponibles = store.talonarioCompra.numbers - store.reservedTickets.length - totalReservedButNotPaidTickets
    }

  console.log(ticketsDisponibles);
  console.log(store.reservedTickets);
  console.log(store.talonarioCompra);
  console.log(store.payments);
  useEffect(() => {
    if (tickets > ticketsDisponibles) {
      alert(`¡Hola! estas intentando comprar más tickets de los que hay disponibles`)  
    }}, [tickets])

  return (
    <div className="d-flex justify-content-center row">
      <section className="perfil-usuario mt-5">
        <div className="wrapper">
          <div className="cover">
          <h4 className="text-white"> Talonario {numeroDeTalonario}</h4>
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
              {tickets} x ${dolar} = ${monto} ó Bs.{montoBs}
            </p>
            <p className="tasa-cambio text-center h2">
              $1 <i className="fa-solid fa-right-left fa-fade"></i> Bs.{tasa}
            </p>
          </div>
        </div>

        <div className="container text-center d-flex justify-content-center ">
          <div className="cuatro row">
            <button
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(2)}
            >
              <h2>+02</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>
            <button
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
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(10)}
            >
              <h2>+10</h2>
              <br />
              <h3>SELECCIONAR</h3>
            </button>
            <button
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
            className="btn btn-outline-secondary"
            type="button"
            id="button-addon1"
            onClick={() => setTickets(tickets + 1)}
            >
            +
          </button>
        </div>
        {/* <p className="pb-5 ps-5">Tickets disponibles: {ticketsDisponibles}</p> */}

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
          
          {tickets < ticketsDisponibles ?
            <button
              type="submit"
              className="botonc btn btn-success d-flex justify-content-center"
       
            >
              Comprar
            </button>
          :""}
        </form>
      </div>

      <div className="datos-comprar d-flex justify-content-center"></div>
    </div>
  );
};
