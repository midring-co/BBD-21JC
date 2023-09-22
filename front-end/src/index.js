import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import Joueurs from './pages/Joueurs';
import Rechercher from './pages/joueurs/Rechercher';
import Creer from './pages/joueurs/Creer';
import NotFound from './NotFound';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route exact path="/" element={<App/>}></Route>
        <Route exact path="/joueurs" element={<Joueurs/>}></Route>
        <Route exact path="/joueurs/rechercher" element={<Rechercher/>}></Route>
        <Route exact path="/joueurs/creer" element={<Creer/>}></Route>
        <Route path="*" element={<NotFound/>}></Route>
      </Routes>
    </Router>
  </React.StrictMode>
);