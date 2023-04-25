import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

import "../../styles/comprar.css";

export const Comprar = () => {
  const { store, actions } = useContext(Context);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [tickets, setTickets] = useState(2);
  const [dolar, setDolar] = useState(2);

  const sendData = async (event) => {
    event.preventDefault();
    if (name !== "" && phone !== "" && email !== ""){
      let comprar = await actions.comprar(name, phone, email)
      if (response) {
        toast.success("ticket comprado exitosamente");
      } else {
        toast.error("No se pudo comprar ticket");
      } 
    }
  };

  const validForm = (form) => {
    let errors = {}; 
    let validName = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü\s]+$/;
    let validPhone = /[+]*[0-9]{1,4}/;
    let validEmail = /^(\w+[/./-]?){1,}@[a-z]+[/.]\w{2,}$/;
    if (!form.name.trim()){
      errors.name = "El campo es requerido"
    } else if(!validName.test(form.name.trim())) {
      errors.name = "El campo solo acepta letras"
    }

    if (!form.phone.trim()){
      errors.phone = "El campo es requerido"
    } else if(!validPhone.test(form.phone.trim())) {
      errors.name = "El campo solo acepta (+) y numeros"
    }

    if (!form.email.trim()){
      errors.email = "El campo es requerido"
    } else if(!validEmail.test(form.email.trim())) {
      errors.name = "El campo solo acepta email"
    }

    return errors;
  }


  return (
    <div className="d-flex justify-content-center row">

      <section className="perfil-usuario mt-5">
      <div className="wrapper">
        <div className="cover">
          <img src="https://img.olx.com.br/images/69/697162555331976.jpg" className="fportada"/>
        </div>
        <div className="id-section">
          <div className="circle">
            <img src="https://i.pinimg.com/originals/35/18/48/35184802e7fd8aaad3a84bef34ea37c6.jpg" className="logo"/>
          </div>
        </div>

      </div>
      </section>


      <div className="cuadro ">
        <div className="input-group p-5">
          {/* cambiar a p  */}
          <div className="precio-ticket w-100">
          <p className="text-center h2">{tickets} x {setDolar}$</p>
            <p className="tasa-cambio text-center h2">$1.00 <i class="fa-solid fa-right-left fa-fade"></i> Bs.25.00</p>

            
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
              <br/>
              <h3>SELECCIONAR</h3>
            </button>
            <button
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(5)}
            >
              <h2>+05</h2> 
              <br/>
              <h3>SELECCIONAR</h3>
            </button>

            <div className="w-100 d-none d-md-block"></div>

            <button
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(10)}
            >
              <h2>+10</h2>
              <br/>
              <h3>SELECCIONAR</h3>
            </button>
            <button
              type="button"
              className="opcion col-6 col-sm-4 btn btn-outline-secondary"
              onClick={() => setTickets(20)}
            >
              <h2>+20</h2> 
              <br/>
              <h3>SELECCIONAR</h3>
            </button>
          </div>
        </div>

        <div className="input-group p-5">
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
            className="imput form-control"
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
              Angelo Pasquale <br/>
              12163660 <br/>
              04241854650 <br/>
            </div>
          ) : paymentMethod == "banco santander" ? (
            <div className="datos-transferencia">
              Cruzangelo Jhosed Pasquale <br/>
              26.510.063-5 <br/>
              Cuenta: 71001956137 <br/>
              Banco: Santander <br/>
              Tipo de cuenta: Vista <br/>
            </div>
          ) : paymentMethod == "zelle" && (
            <div className="datos-transferencia">
              +13464535821 <br/>
              Jesus Pasquale <br/>
              Nota:con el numero podra hacer el zelle sin usar correo<br/>
            </div>
          )}

		    {/* boton adjuntar archivo*/}
        <div className="mt-3">
          <input className="adjuntar-archivo form" type="file" />
        </div>

          <button
            type="submit"
            className="botonc btn btn-success d-flex justify-content-center"
			// onClick={}
          >
            Comprar
          </button>
        </form>
      </div>

      <div className="datos-comprar d-flex justify-content-center"></div>
    </div>
  );
};
