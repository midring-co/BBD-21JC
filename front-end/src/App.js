import React from 'react';
import { Link } from 'react-router-dom';

import './assets/app.css';

const App = () => {

    return (
        <React.Fragment>
            <div className="cards-list">
  
                <Link to="/joueurs" style={{textDecoration: 'none'}}>
                    <div className="card">
                        <div className="card_image"> <img src="bdd-1.jpg" /> </div>
                        <div className="card_title title-white">
                        <h3>Joueurs</h3>
                        </div>
                    </div>
                </Link>

                <Link to="/entreprises" style={{textDecoration: 'none'}}>
                    <div className="card">
                        <div className="card_image"> <img src="bdd-2.jpg" /> </div>
                        <div className="card_title title-white">
                        <h3>Entreprises</h3>
                        </div>
                    </div>
                </Link>

                <Link to="/gangs" style={{textDecoration: 'none'}}>
                    <div className="card">
                        <div className="card_image"> <img src="bdd-3.jpg" /> </div>
                        <div className="card_title title-white">
                        <h3>Gangs</h3>
                        </div>
                    </div>
                </Link>
                
            </div>
        </React.Fragment>
    )
};

export default App;