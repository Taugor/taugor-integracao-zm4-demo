import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { UserManager } from 'oidc-client'

const oidcConfig = {
  authority: "https://sso.gedtaugor.com.br",
  client_id: "5e16e15d07bf863dd83ed9f5",
  popup_redirect_uri: "https://fir-zm4.firebaseapp.com/",
  silent_redirect_uri: "https://fir-zm4.firebaseapp.com/",
  response_type: "id_token token",
  scope: "openid profile api1",
  post_logout_redirect_uri: "https://fir-zm4.firebaseapp.com/",
  metadata: {
    "issuer": "Taugor Identity Provider",
    "jwks_uri": "https://sso.gedtaugor.com.br/.well-known/openid-configuration/jwks",
    "authorization_endpoint": "https://sso.gedtaugor.com.br/connect/authorize",
    "token_endpoint": "https://sso.gedtaugor.com.br/connect/token",
    "userinfo_endpoint": "https://sso.gedtaugor.com.br/connect/userinfo",
    "end_session_endpoint": "https://sso.gedtaugor.com.br/connect/endsession",
    "check_session_iframe": "https://sso.gedtaugor.com.br/connect/checksession",
    "revocation_endpoint": "https://sso.gedtaugor.com.br/connect/revocation",
    "introspection_endpoint": "https://sso.gedtaugor.com.br/connect/introspect",
    "device_authorization_endpoint": "https://sso.gedtaugor.com.br/connect/deviceauthorization",
    "frontchannel_logout_supported": true,
    "frontchannel_logout_session_supported": true,
    "backchannel_logout_supported": true,
    "backchannel_logout_session_supported": true,
    "scopes_supported": [
      "openid",
      "profile",
      "legacy",
      "api1",
      "offline_access"
    ],
    "claims_supported": [
      "sub",
      "legacy_user",
      "legacy_token",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ],
    "grant_types_supported": [
      "authorization_code",
      "client_credentials",
      "refresh_token",
      "implicit",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    "response_types_supported": [
      "code",
      "token",
      "id_token",
      "id_token token",
      "code id_token",
      "code token",
      "code id_token token"
    ],
    "response_modes_supported": [
      "form_post",
      "query",
      "fragment"
    ],
    "token_endpoint_auth_methods_supported": [
      "client_secret_basic",
      "client_secret_post"
    ],
    "subject_types_supported": [
      "public"
    ],
    "id_token_signing_alg_values_supported": [
      "RS256"
    ],
    "code_challenge_methods_supported": [
      "plain",
      "S256"
    ],
    "request_parameter_supported": true
  }
};

window.addEventListener('load', (event) => {
  console.log('load');
  const userManager = new UserManager(oidcConfig);
  userManager.signinSilentCallback().then(function () {
    console.log('signinSilentCallback')
  });
  userManager.signinPopupCallback().then(function () {
    console.log('signinPopupCallback')
  });
  userManager.signinSilent()
    .then(user => {
      console.log('user', user);
      window.location.href = 'https://app-zm4-newton.gedtaugor.com.br/'
    })
    .catch((ex) => {
      console.log('error', ex);
      if (ex.error === 'login_required') {
        return;
      }
      return;
    });
});

function App() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState();

  const doLogin = () => {
    if (!loading) {
      setLoading(true);
      const response = fetch('https://us-central1-fir-zm4.cloudfunctions.net/auth', {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      }).then(res => res.text())

      response.finally(() => setLoading(false));
      response
        .then(result => {
          window.location.href = result;
        })
        .catch(err => {
          alert('erro')
          console.error(err);
        })
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className={`App-logo ${loading ? 'spin' : ''}`} alt="logo" />
        <div>
          <b>Usuário</b>
        </div>
        <div>
          <input type="text" name="username" disabled={loading} value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <b>Senha</b>
        </div>
        <div>
          <input type="password" name="password" disabled={loading} value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <button type="button" disabled={loading} onClick={() => doLogin()}>Entrar</button>
        </div>
      </header>
    </div>
  );
}

export default App;
