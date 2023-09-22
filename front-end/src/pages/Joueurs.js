import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import '../assets/joueurs.css';

const Joueurs = () => {
    const [activeMenu, setActiveMenu] = useState(1);

    const changeMenu = (menuId) => {
        if(activeMenu !== menuId) {
            setActiveMenu(menuId);
        }
    };

    return (
        <React.Fragment>
            <nav className="blocks">
                <Link to="rechercher" className="block">
                    <div className="block__item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    </div>
                </Link>
                <Link to="creer" className="block">
                    <div className="block__item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    </div>
                </Link>
                <Link to="/" className="block">
                    <div className="block__item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    </div>
                </Link>
            </nav>
        </React.Fragment>
    )
};

export default Joueurs;