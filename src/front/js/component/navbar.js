import React from "react";
import { Link } from "react-router-dom";
import logonav from "../../img/STICKERS CRUZANGELO.png"

export const Navbar = () => {
	return (
		<nav className="navbar bg-dark d-flex justify-content-center" data-bs-theme="dark">
			<img src={logonav} className="logonav"></img>
		</nav>
	);
};
