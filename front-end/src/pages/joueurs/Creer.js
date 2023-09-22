import React from 'react';

import { Link } from 'react-router-dom';

import '../../assets/joueurs-sousmenu.css';

const Creer = () => {
    return (
        <React.Fragment>
            <div className="main-container-2">
                <center><h3>Créer un joueur</h3></center>
                <input className="menu-form" type="text" placeholder="Prénom"></input>
                <input className="menu-form" type="text" placeholder="Nom"></input>
                <input className="menu-form" type="text" placeholder="Numéro de téléphone"></input>
                <input className="menu-form" type="text" placeholder="Matricule d'entreprise"></input>
                <input className="menu-form" type="text" placeholder="Matricule de gang"></input>
                <button className="menu-button">Rechercher</button>
                <Link to="/joueurs"><button className="menu-back-button">Retour au menu</button></Link>
            </div>
        </React.Fragment>
    )
};

export default Creer;