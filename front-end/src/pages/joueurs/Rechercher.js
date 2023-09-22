import React from 'react';

import { Link } from 'react-router-dom';

import '../../assets/joueurs-sousmenu.css';

const Rechercher = () => {
    return (
        <React.Fragment>
            <div className="main-container">
                <h3>Rechercher un joueur</h3>
                <input className="menu-form" type="text" placeholder="Prénom_Nom"></input>
                <button className="menu-button">Rechercher</button>
                <Link to="/joueurs"><button className="menu-back-button">Retour au menu</button></Link>
            </div>
        </React.Fragment>
    )
};

export default Rechercher;