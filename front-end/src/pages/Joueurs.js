import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/joueurs.css';

const Joueurs = () => {

    return (
        <React.Fragment>
            <div className="wrapper">
                <div className="card-switch">
                    <label className="switch">
                        <input type="checkbox" className="toggle"></input>
                        <span className="slider"></span>
                        <span className="card-side"></span>
                        <div className="flip-card__inner">
                            <div className="flip-card__front">
                                <div className="title">Recherche de joueur</div>
                                <form className="flip-card__form" action="">
                                    <input className="flip-card__input" name="firstname_lastname" placeholder="Prénom_Nom" type="text"></input>
                                    <button className="flip-card__btn">C'est parti !</button>
                                </form>
                            </div>
                            <div className="flip-card__back">
                                <div className="title">Création de joueur</div>
                                <form className="flip-card__form" action="">
                                    <input className="flip-card__input" placeholder="Name" type="name"></input>
                                    <input className="flip-card__input" name="email" placeholder="Email" type="email"></input>
                                    <input className="flip-card__input" name="password" placeholder="Password" type="password"></input>
                                    <button className="flip-card__btn">Confirm!</button>
                                </form>
                            </div>
                        </div>
                    </label>
                </div>   
            </div>
        </React.Fragment>
    )
};

export default Joueurs;