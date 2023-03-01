import React, { Component } from "react";
import instagramLogo from "../../img/instagram.png";
import facebookLogo from "../../img/facebook.png";
import whatsappLogo from "../../img/whatsapp.png";
import logonav from "../../img/STICKERS CRUZANGELO.png";
import "../../styles/footer.css";

export const Footer = () => (
  <footer className="footer bg-danger text-white pt-3 pb-2">
    <div className="container">
      <div className="row text-center pb-3">
        <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
          <img src={logonav} className="logo-footer" />
        </div>
        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
          <h5 className="text-uppercase text-center mb-4 font-weight-bold text-white">
            Redes Sociales
          </h5>
          <div className="d-flex gap-2 justify-content-center">
            <img src={whatsappLogo} className="social-media-logo" />
            <img src={instagramLogo} className="social-media-logo" />
            <img src={facebookLogo} className="social-media-logo " />
          </div>
        </div>
      </div>
    </div>
  </footer>
);
