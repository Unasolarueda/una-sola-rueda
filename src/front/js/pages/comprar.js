import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";

import "../../styles/comprar.css"

export const Comprar = () => {
	const { store, actions } = useContext(Context);

	return (
		<div className="d-flex justify-content-center row">
			
			<section className="perfil-usuario mt-5">
				<div className="contenedor-perfil d-flex justify-content-center">
					<img	src="https://img.olx.com.br/images/69/697162555331976.jpg"
							className="portada de perfil"/>
				</div>
				<div className="avatar-perfil">
					<img	src="https://i.pinimg.com/originals/35/18/48/35184802e7fd8aaad3a84bef34ea37c6.jpg"
							className="avatar-perfil"/>
				</div>	

			</section>

			<div className="cuadro ">
				<div className="input-group p-5">
					
					{/* cambiar a p  */}
					<input	type="text" 
							className="imput form-control" 
							placeholder="2 X $1 = 2$" 
							aria-label="Example text with button addon" 
							aria-describedby="button-addon1"/>
				</div>

				<div className="container text-center d-flex justify-content-center ">
					<div className="row">
    					<button	type="button"  
								className="opcion col-6 col-sm-4 btn btn-outline-secondary">
							+02 SELECCIONAR 
						</button>
    					<button type="button" 
								className="opcion col-6 col-sm-4 btn btn-outline-secondary">
							+05 SELECCIONAR
						</button>

    						<div className="w-100 d-none d-md-block"></div>

    					<button type="button" 
								className="opcion col-6 col-sm-4 btn btn-outline-secondary">
							+10 SELECCIONAR
						</button>
    					<button type="button" 	
								className="opcion col-6 col-sm-4 btn btn-outline-secondary">
							+20 SELECCIONAR
						</button>
  					</div>
				</div>

				<div class="input-group p-5">
					<button	class="btn btn-outline-secondary" 
							type="button" 
							id="button-addon1">-
					</button>
						
					<input	type="text" 
							className="imput form-control" 
							placeholder="10" aria-label="Example text with button addon" 
							aria-describedby="button-addon1"/>
							
					<button	className="btn btn-outline-secondary" 
							type="button" 
							id="button-addon1">+
					</button>
				</div>

				<button type="button" 
						className="botonc btn btn-success d-flex justify-content-center">Comprar
				</button>

			</div>

			<div className="datos-comprar d-flex justify-content-center">

			<form className="row g-3 needs-validation" novalidate>
				<div className="col-md-4">
    				<label for="validationCustom01" className="form-label">Nombre y Apellido</label>
    					<input type="text" className="form-control" id="validationCustom01" required/>
    						<div className="valid-feedback">
      							Looks good!
    						</div>
				</div>

				<div className="col-md-4">
    				<label for="validationCustom02" className="form-label">Numero Telefono </label>
    					<input type="text" className="form-control" id="validationCustom02" required/>
    						<div className="valid-feedback">
      							Looks good!
    						</div>
  				</div>

				<div className="col-md-4">
    				<label for="validationCustom02" className="form-label">Correo</label>
    					<input type="text" className="form-control" id="validationCustom02" required/>
    						<div className="valid-feedback">
      							Looks good!
    						</div>
  				</div>

				<div className="col-md-4">
    				<label for="validationCustom02" className="form-label">Metodos de Pago</label>
						<div class="dropdown">
							<button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
								metodos de pago
							</button>
							<ul class="dropdown-menu">
									{/* intentar con p */}
								<li><p class="dropdown-item" >pago movil</p></li>
								<li><p class="dropdown-item" >zelle</p></li>
								<li><p class="dropdown-item" >efectivo</p></li>
							</ul>
						</div>		
  				</div>

				<div className="col-12">
					<button type="button" 
							className="boton btn btn-success d-flex justify-content-center">Registrar
					</button>
  				</div>
			</form>

			</div>



	

			




		</div>
	);
};
