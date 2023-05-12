import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import CloudinaryUploadWidget from "../component/cloudinary";

import "../../styles/newuser.css";

export const NewTalonario = () => {
  const [name, setName] = useState("");
  const [prize, setPrize] = useState("");
  const [numbers, setNumbers] = useState("");
  const [price, setPrice] = useState("");
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const sendData = async (event) => {
    event.preventDefault();
    if (
      name.trim() !== "" &&
      prize.trim() !== "" &&
      numbers !== "" &&
      price !== ""
    ) {
      const response = await actions.createTalonario(
        name,
        prize,
        numbers,
        price
      );
      if (response) {
        actions.toggleMessage("Talonario añadido exitosamente", true);
        setName("");
        setPrize("");
        setNumbers("");
        setPrice("");
      } else {
        actions.toggleMessage("No se pudo añadir el talonario", false);
      }
    } else {
      actions.toggleMessage("Llene todos los campos", false);
    }
  };
  return (
    <>
      <button
        type="button"
        className="btn btn-success text-dark fw-bold"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Nuevo talonario <i className="fa-solid fa-plus"></i>
      </button>

      {/* <!-- Modal --> */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div
            className="modal-content"
            style={{ backgroundColor: "rgba(61, 61, 61)" }}
          >
            <div className="modal-header">
              <h1
                className="modal-title fs-5 text-white"
                id="exampleModalLabel"
              >
                Nuevo Talonario
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={sendData}>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="name">
                    <b>Nombre:</b>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="name"
                    placeholder="Introduzca nombre de la rifa"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="prize">
                    <b>Premio:</b>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="prize"
                    placeholder="Introduzca premio a sortear"
                    required
                    value={prize}
                    onChange={(event) => setPrize(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="img_prize">
                    <b>Cantidad de números del talonario:</b>
                  </label>
                  <select
                    className="form-select"
                    aria-label="Default select example"
                    value={numbers}
                    onChange={(event) => setNumbers(event.target.value)}
                  >
                    <option value="">Selecciona</option>
                    <option value={1000}>1000</option>
                    <option value={10000}>10000</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="price">
                    <b>Precio del ticket:</b>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="price"
                    placeholder="Ejemplo: 5"
                    required
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="img_prize">
                    <b>Imagen del premio:</b>
                    <CloudinaryUploadWidget />
                  </label>
                  {Object.entries(store.imageUrls).length > 0 && (
                    <div>
                      <img src={store.imageUrls.thumbnail}></img>
                    </div>
                  )}
                </div>

                <div className="modal-footer mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <input
                    className="btn btn-success"
                    data-bs-dismiss={
                      name.trim() !== "" && prize.trim() !== "" ? "modal" : ""
                    }
                    type="submit"
                    value="Guardar"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
