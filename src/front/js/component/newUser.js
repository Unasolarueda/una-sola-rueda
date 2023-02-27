import React, { useContext, useState, useEffect } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import "../../styles/newuser.css";

export const NewUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();

  const sendData = async (event) => {
    event.preventDefault();
    if (email.trim() !== "" && password.trim() !== "") {
      const response = await actions.addUser(email, password);
      if (response) {
        toast.success("Usuario añadido exitosamente");
        setEmail("");
        setPassword("");
      } else {
        toast.error("No se pudo añadir el usario");
      }
    } else {
      toast.error("No se pudo añadir el usario");
    }
  };
  return (
    <>
      <Toaster />
      <button
        type="button"
        className="btn btn-success text-dark fw-bold"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Añadir Usuario <i class="fa-solid fa-plus"></i>
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
                Nuevo Usuario
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
                  <label className="form-label text-white" htmlFor="email">
                    <b>Usuario:</b>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    id="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-white" htmlFor="password">
                    <b>Contraseña:</b>
                  </label>
                  <div>
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      required
                      onChange={(event) => setPassword(event.target.value)}
                    ></input>
                    <div onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <i className="fa-regular fa-eye pwd-icon"></i>
                      ) : (
                        <i className="fa-regular fa-eye-slash pwd-icon"></i>
                      )}
                    </div>
                  </div>
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
                      email.trim() !== "" && password.trim() !== "" && "modal"
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
