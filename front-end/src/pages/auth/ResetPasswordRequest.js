import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { InputAdornment, Alert, Divider } from '@mui/material';
import { VpnKey, Lock, Send, Done, Close } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/reducers';

import Loader from '../../components/loader';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'© '}
      <Link color="inherit" href="https://google.com">
        MOPM
      </Link>{' - v1 - '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

const ResetPasswordRequest = () => {
  const [isLoadedLayout, setIsLoadedLayout] = useState(false);
  const [password, setPassword] = useState('');
  const [isValidPasswordNumberChar, setIsValidPasswordNumberChar] = useState(false);
  const [IsValidPasswordSpecialChar, setIsValidPasswordSpecialChar] = useState(false);
  const [isValidPasswordUpperChar, setIsValidPasswordUpperChar] = useState(false);
  const [repeatPassword, setRepeatPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasRequest, setHasRequest] = useState(false);

  const { login, securitycode, token } = useParams();

  const reduxToken = useSelector(state => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changePassword = (formPassword) => {
    setPassword(formPassword);

    if(formPassword.length >= 8 && formPassword.length <= 16) {
      setIsValidPasswordNumberChar(true);
    } else {
      setIsValidPasswordNumberChar(false);
    }

    if(formPassword.match(/[!@#$%^&*_\-]/g) && formPassword.match(/[!@#$%^&*_\-]/g).length >= 2 && !(/[^a-zA-Z0-9!@#$%^&*_\-]/.test(formPassword))) {
      setIsValidPasswordSpecialChar(true);
    } else {
      setIsValidPasswordSpecialChar(false);
    }

    if(/[A-Z]/.test(formPassword)) {
      setIsValidPasswordUpperChar(true);
    } else {
      setIsValidPasswordUpperChar(false);
    }
  }

  const checkResetCredentials = () => {
    const credentials = {
      hashedLogin: login,
      hashedSecurityCode: securitycode,
      hashedToken: token,
      currentToken: reduxToken
    };
    if(login.length > 0 && securitycode.length > 0 && token.length > 0) {
      if(/^[a-zA-Z0-9]+$/.test(login) && /^[a-zA-Z0-9]+$/.test(securitycode) && /^[a-zA-Z0-9]+$/.test(token)) {
        axios.post('http://localhost:8000/api/auth/reset-password-check', credentials, { timeout: 10000 })
        .then(response => {
          if(response.data.requestResponse) {
            if(response.data.reset && response.data.message) {
              if(response.data.message === 'VALID_RESET_PASSWORD_CHECK') {
                checkToken();
              } else {
                navigate('/');
              }
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
        }).catch(error => {
          navigate('/');
        });
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }
  
  const checkToken = () => {
    if(reduxToken != 'undefined') {
      axios.post('http://localhost:8000/api/login/check-token', reduxToken, { timeout: 10000 })
      .then(response => {
        if(response.data.requestResponse) {
          if(response.data.message === 'VALID_LOGIN_BY_TOKEN') {
            navigate('/');
          } else {
            dispatch(logout({}));
            setHasRequest(false);
            setIsLoadedLayout(true);
          }
        } else {
          dispatch(logout({}));
          setHasRequest(false);
          setIsLoadedLayout(true);
        }
      }).catch(error => {
        dispatch(logout({}));
        setHasRequest(false);
        setIsLoadedLayout(true);
      });
    } else {
      setIsLoadedLayout(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const credentials = {
      hashedLogin: login,
      hashedSecurityCode: securitycode,
      hashedToken: token,
      password: password,
      repeatPassword: repeatPassword,
      secretCode: secretCode,
      currentToken: reduxToken
    };

    const tryRequest = () => {
      if(isLoadedLayout) {
        setHasRequest(true);
        setError(null);
        axios.post('http://localhost:8000/api/auth/reset-password-send', credentials, { timeout: 10000 })
        .then(response => {
          if(response.data.requestResponse) {
            if(response.data.reset) {
              if(response.data.message && response.data.message === 'VALID_RESET_PASSWORD_SEND') {
                setError(null);
                setSuccess('Votre mot de passe a été réinitialisé avec succès. Vous pouvez vous connecter avec votre nouveau mot de passe.');
                setSecretCode('');
                setPassword('');
                setRepeatPassword('');
                setIsValidPasswordNumberChar(false);
                setIsValidPasswordSpecialChar(false);
                setIsValidPasswordUpperChar(false);
                setHasRequest(false);
              } else {
                setSuccess(null);
                setError(response.data.message);
                setHasRequest(false);
              }
            } else {
              setSuccess(null);
              setError(response.data.message);
              setHasRequest(false);
            }
          } else {
            if(response.data.message && response.data.message === 'LOGIN_TOKEN_ALREADY_EXISTS') {
              checkToken();
            } else {
              setSuccess(null);
              setError(response.data.message);
              setHasRequest(false);
            }
          }
        }).catch(error => {
          setSuccess(null);
          setError('Une erreur est survenue.');
          setHasRequest(false);
        });
      }
    }
    
    if(reduxToken === 'undefined') {
      var formPassword = password.trim();
      var formRepeatPassword = repeatPassword.trim();
      var formLogin = login.trim();
      var formSecurityCode = securitycode.trim();
      var formToken = token.trim();
      var formSecretCode = secretCode.trim();
      if(formPassword.length > 0 && formRepeatPassword.length > 0 && formLogin.length > 0 && formSecurityCode.length > 0 && formToken.length > 0 && formSecretCode.length > 0) {
        if(isValidPasswordNumberChar && IsValidPasswordSpecialChar && isValidPasswordUpperChar) {
          if(formPassword === formRepeatPassword) {
            if(/^[a-zA-Z0-9]+$/.test(formLogin) && /^[a-zA-Z0-9]+$/.test(formSecurityCode) && /^[a-zA-Z0-9]+$/.test(formToken)) {
              if(/^\d+$/.test(formSecretCode) && formSecretCode.length == 6) {
                if(!hasRequest) {
                  tryRequest();
                }
              } else {
                setSuccess(null);
                setError('Le code secret saisi doit être une suite de 6 chiffres.');
                setHasRequest(false);
              }
            } else {
              navigate('/');
            }
          } else {
            setSuccess(null);
            setError('Les deux mots de passe saisis ne sont pas identiques.');
            setHasRequest(false);
          }
        } else {
          setSuccess(null);
          setError('Veuillez respecter les critères soumis pour votre mot de passe.');
          setHasRequest(false);
        }
      } else {
        setSuccess(null);
        setError('Veuillez saisir tous les champs.');
        setHasRequest(false);
      }
    } else {
      checkToken();
    }
  };

  useEffect(() => {
    checkResetCredentials();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      { isLoadedLayout ? (
      <>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: 'url(http://localhost:3000/assets/images/auth-bg.png)',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Réinitialisez votre mot de passe
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error ?
                (  
                  <Alert severity="error">
                  <strong>{error}</strong>
                  </Alert>
                ) : <div></div> }
                {success ?
                (  
                  <Alert severity="success">
                  <strong>{success}</strong>
                  </Alert>
                ) : <div></div> }
                <TextField InputProps={{
                  endAdornment: (
                      <InputAdornment position="start">
                          <VpnKey />
                      </InputAdornment>
                  )
                  }}
                  margin="normal"
                  required
                  fullWidth
                  name="secretcode"
                  label="Code secret"
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  id="secretcode"
                />
                <TextField InputProps={{
                  endAdornment: (
                      <InputAdornment position="start">
                          <Lock />
                      </InputAdornment>
                  )
                  }}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  value={password}
                  onChange={(e) => changePassword(e.target.value)}
                  id="password"
                />
                <Typography variant="body1" gutterBottom>
                  Votre mot de passe doit posséder les critères suivants :
                </Typography>
                <Divider /> 
                <Grid container direction="row" alignItems="center" wrap="nowrap" mt={1}>
                  {isValidPasswordNumberChar ? (
                  <Grid item color="green">
                    <Done />
                  </Grid>
                  ) : (
                    <Grid item color="red">
                      <Close />
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant="body2" gutterBottom>
                      Contenir au moins 8 caractères et au plus 16 caractères
                    </Typography>
                  </Grid>
                </Grid>   
                <Grid container direction="row" alignItems="center" wrap="nowrap" mt={1}>
                  {IsValidPasswordSpecialChar ? (
                  <Grid item color="green">
                    <Done />
                  </Grid>
                  ) : (
                    <Grid item color="red">
                      <Close />
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant="body2" gutterBottom>
                      Contenir au moins 2 caractères spéciaux<br/>(les caractères spéciaux autorisés sont !@#$%^&*-_)
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction="row" alignItems="center" wrap="nowrap" mt={1}>
                  {isValidPasswordUpperChar ? (
                  <Grid item color="green">
                    <Done />
                  </Grid>
                  ) : (
                    <Grid item color="red">
                      <Close />
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant="body2" gutterBottom>
                      Contenir au moins 1 majuscule
                    </Typography>
                  </Grid>
                </Grid>       
                <TextField InputProps={{
                  endAdornment: (
                      <InputAdornment position="start">
                          <Lock />
                      </InputAdornment>
                  )
                  }}
                  margin="normal"
                  required
                  fullWidth
                  name="repeatpassword"
                  label="Répétez votre mot de passe"
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  id="repeatpassword"
                />
                {!hasRequest ? (
                <Button
                  color="secondary"
                  type="Connexion"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  endIcon={<Send />}
                >
                  Réinitialisation
                </Button>
                ) : (
                  <Button
                  color="secondary"
                  type="Connexion"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled
                >
                  Veuillez patienter...
                </Button>
                )}
                <Grid container>
                  <Grid item xs>
                    <Link href="/login" variant="body2">
                      Se connecter
                    </Link>
                  </Grid>
                </Grid>
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </>
      ) : 
      <>
        <Loader/>
      </>
      }
    </ThemeProvider>
  );
}

export default ResetPasswordRequest;