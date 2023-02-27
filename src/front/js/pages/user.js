import React, { useEffect, useContext } from "react";
import { Context } from "../store/appContext";
import { useJwt } from "react-jwt";
import "../../styles/user.css";
import { NewUser } from "../component/newUser";

export const User = () => {
  const { store, actions } = useContext(Context);
  const { decodedToken, isExpired } = useJwt(store.token);

  useEffect(() => {
    if (store.users && store.users.length > 0) return;
    actions.getUsers();
  }, []);

  return (
    <div className="container table-user  mt-4 mb-4">
      <div className="d-flex justify-content-between">
        <h2 className="text-white">Usuarios</h2>
        <NewUser />
      </div>
      <table className="table text-white">
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
