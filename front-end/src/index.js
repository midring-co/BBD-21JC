import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import NotFound from './NotFound';
import Login from './pages/auth/Login';
import ResetPassword from './pages/auth/ResetPassword';
import ResetPasswordRequest from './pages/auth/ResetPasswordRequest';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import Loader from './components/loader';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loader/>} persistor={persistor}>
        <Router>
          <Routes>
            <Route exact path='/' element={<App/>}></Route>
            <Route exact path='/login' element={<Login/>}></Route>
            <Route exact path='/reset-password' element={<ResetPassword/>}></Route>
            <Route exact path='/reset-password-request/:login/:securitycode/:token' element={<ResetPasswordRequest/>}></Route>
            <Route path='*' element={<NotFound/>}></Route>
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);