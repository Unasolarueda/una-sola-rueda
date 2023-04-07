import React, { useContext } from "react";
import { Context } from "../store/appContext";

import imagen1 from "../../img/317481662_1167955070805434_6691803026419288151_n.jpg";
import imagen2 from "../../img/176599722_2965506053687072_5692659685441954106_n.jpg";
import imagen3 from "../../img/293528203_727020271688354_6971905411783642798_n.jpg";
import imagen4 from "../../img/297262554_1396485714171790_5287303683723447565_n.jpg";

import "../../styles/home.css";

export const Home = () => {
  const { store, actions } = useContext(Context);

  return (
    <div className="text-center mt-5">
      <h1 className="title">PARTICIPA YA!</h1>
      <button type="button" 
              className="botonvr btn btn-danger"
              // onClick={rifaActiva}>
              >
        Rifa Activa
      </button>
      <div className="fotosinicio d-flex justify-content-center">
        <img src={imagen1} className="fi" />
        <img src={imagen2} className="fi" />
        <img src={imagen3} className="fi" />
        <img src={imagen4} className="fi" />
      </div>
      <div className="ia d-flex justify-content-center">
          <h2 className="tittle">Donde los Sueños los hacemos realidad</h2>
      </div>
    </div>
  );
};
//
