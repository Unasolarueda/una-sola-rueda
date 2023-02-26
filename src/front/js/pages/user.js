import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/user.css";

export const User = () => {
  const { store, actions } = useContext(Context);
  useEffect(() => {
    if (store.users && store.users.length > 0) return;
    actions.getUsers();
  }, []);

  console.log(store.users);

  return (
    <div className="container table-user  mt-4">
      <div className="d-flex justify-content-between">
        <h2>Usuarios</h2>
        <button className="btn btn-success text-dark fw-bold">
          Añadir Usuario
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Username</th>
          </tr>
        </thead>
        <tbody>
          {store.users.map((user, index) => (
            <tr key={user.id}>
              <th scope="row">{index + 1}</th>
              <td>{user.email}</td>
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
