const functions = require('firebase-functions');
const fetch = require('node-fetch');
const cuid = require('cuid');
const cors = require('cors')({ origin: true })

//const CLIENT_ID = '5df4d191fad291440cd4e279';
//const CLIENT_ID = '5de48c708e561f1e4c5c95d8';
//const CLIENT_ID = '5e16e1c27dfa953e84109fc4';
const CLIENT_ID = '5e16e15d07bf863dd83ed9f5';
// const GED_SIGNIN_CALLBACK_URL = 'https://app-newton.gedtaugor.com.br/signin-oidc';
const GED_SIGNIN_CALLBACK_URL = 'https://fir-zm4.firebaseapp.com/';

const TAUGOR_IDENTITY_URL = 'https://sso.gedtaugor.com.br';
const CREATE_TOKEN_URL = `${TAUGOR_IDENTITY_URL}/api/account/login`;

const gerarTokenDeAcesso = async ({ username, password, rememberLogin }) => {
    const resposta = await fetch(CREATE_TOKEN_URL, {
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ username, password, rememberLogin })
    }).then(res => res.json())
    return resposta.result;
}
const consultaUsuarioTaugor = async ({ username, password }) => {
    const mappedUserCredentials = await Promise.resolve({
        username, password
    });
    return {
        username: mappedUserCredentials.username,
        password: mappedUserCredentials.password
    }

}
const gerarUrlDeAcesso = (token, returnUrl) => `${TAUGOR_IDENTITY_URL}/account/token/${token}?returnUrl=${encodeURIComponent(returnUrl)}`;
const montarReturnUrl = (clientId, url) => {
    const redirect_uri = encodeURIComponent(url);
    const response_type = 'id_token';
    const scope = 'openid profile';
    const response_mode = 'form_post';
    const nonce = cuid();

    return `/connect/authorize/callback?`
        + `client_id=${clientId}`
        + `&redirect_uri=${redirect_uri}`
        + `&response_type=${response_type}`
        + `&scope=${scope}`
        + `&response_mode=${response_mode}`
        + `&nonce=${nonce}`;
}
const autenticar = async (data) => {
    const usuarioTaugor = await consultaUsuarioTaugor(data);
    const token = await gerarTokenDeAcesso({
        ...usuarioTaugor,
        rememberLogin: true
    });
    const returnUrl = montarReturnUrl(CLIENT_ID, GED_SIGNIN_CALLBACK_URL);
    const urlDeAcesso = gerarUrlDeAcesso(token, returnUrl);
    return urlDeAcesso;
}
 
exports.auth = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
        if (request.method !== 'POST') {
            return response.status(500).json({
                message: `${request.method} not allowed`
            })
        }
        autenticar(request.body).then(result => {
            return response.send(result);
        });
    })
});

