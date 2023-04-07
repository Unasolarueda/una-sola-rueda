import React, { useContext, useEffect } from "react";
import { Context } from "../store/appContext";

import "../../styles/crear.css";

export const Crear = () => {
    const { store, actions } = useContext(Context);
	const { nombreRifa, setNombreRifa } = useEffect("")
	const { premio, setPremio } = useEffect("")
	const { precioTiket, setPrecioTiket } = useEffect("")
	const { descripcion, setDescripcion } = useEffect("")
	const { contacto, setContacto } = useEffect("")
	



	return (
        <div className="d-flex justify-content-center">

			<div className="datos-crear d-flex justify-content-center">

				<form className="col g-3 needs-validation" novalidate>
					<div className="col-md-4">
						<label for="validationCustom01" className="d-flex justify-content-center form-label">Nombre Rifa:</label>
							<input type="text" className="d-flex justify-content-center form-control" id="validationCustom01" required/>
								<div className="valid-feedback">
									Looks good!
								</div>
					</div>

					<div className="col-md-4">
						<label for="validationCustom02" className="form-label">Premio:d</label>
							<input type="text" className="form-control" id="validationCustom02" required/>
								<div className="valid-feedback">
									Looks good!
								</div>
					</div>

					{/* <div claasName="col-md-4">
						<span claasName="input-group-text">$</span>
							<span claasName="input-group-text">0.00</span>
								<input type="text" claasName="form-control" aria-label="Dollar amount (with dot and two decimal places)"/>
					</div> */}


					<div className="col-md-4">
						<label for="validationCustom02" className="form-label">Precio tiket:</label>
							<input type="text" className="form-control" id="validationCustom02" required/>
								<div className="valid-feedback">
									Looks good!
								</div>
					</div>

					<div className="col-md-4">
						{/* descripcion quitar */}
						<label for="validationCustom02" className="form-label">Descripcion:</label>
							<input type="text" className="form-control" id="validationCustom02" required/>
								<div className="valid-feedback">
									Looks good!
								</div>
					</div>

					<div className="col-md-4">
						<label for="validationCustom02" className="form-label">Contacto:</label>
							<input type="text" className="form-control" id="validationCustom02" required/>
								<div className="valid-feedback">
									Looks good!
								</div>
					</div>

					<div className="col-12">
						<button type="button" 
								className="boton btn btn-success d-flex justify-content-center"
								onClick={crearRifa}>Crear Rifa
						</button>
					</div>

				</form>
			</div>
	
		</div>

        );

};