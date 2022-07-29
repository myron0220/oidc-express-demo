/*
  A node.js express demo to illustrate OpenID Connect authorization code flow.
  Author: Mingzhe Wang
  Date: Jul 28, 2022
*/

/* ------------ Libraries ------------ */
const express = require('express') // node.js express
const mustacheExpress = require('mustache-express') // show dynamic html view
const jwt_decode = require('jwt-decode'); // jwt decoder for decoding id_token
const randomStr = require('./funcs/randomStr')
const fs = require('fs'); // for reading json file

/* ------------ INPUT ------------ */
let fileName = '[Change this to your own json key distributed by Google]'
if (fileName == '[Change this to your own json key distributed by Google]') {
  throw "Please change the fileName first! More info: https://developers.google.com/identity/protocols/oauth2/openid-connect#getcredentials"
}
let clientInfStr = fs.readFileSync(fileName).toString("utf-8")

/* ------------ Configuration ------------ */
let clientInfJson = JSON.parse(clientInfStr)
// console.log(clientInfJson.web)
const port = 3000
const scope = 'openid profile address email phone'
const client_id = clientInfJson.web.client_id
const client_secret = clientInfJson.web.client_secret
const redirect_uri = clientInfJson.web.redirect_uris[0]

/* ------------ Global Variables ------------ */
let state
let nonce

/* ------------ App Routers ------------ */
const app = express()

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.get('/', (req, res) => {
  state = randomStr(12)
  // console.log("State: " + state)
  nonce = randomStr(12)
  // console.log("nonce: " + nonce)
  res.render('index.mustache', {'state': state, 'nonce': nonce})
})

app.get('/login', (req, res) => {
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth'
  + '?client_id=' + client_id
  + '&redirect_uri=' + redirect_uri
  + '&scope=' + scope
  + '&response_type=code'
  + '&response_mode=query'
  + '&state=' + state
  + '&nonce=' + nonce)
})

/*
Sample redirect URL returned by Google's authorization server:
  http://localhost:3000/private
  ?state=6oawgkr4zyn
  &code=4%2F0AdQt8qiwTYtAJmDSBbWK7eRGOHVezS3CWWfPFLGOmtTDpbCHCw1hh7UCVYwNosAvo50ujw
  &scope=email+profile+openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email
  &authuser=0
  &prompt=consent
*/

{
  let temp_code

  app.get('/code', (req, res) => {
    temp_code = req.query.code
    res.render('code.mustache', {'code': temp_code, 'appState': state, 'urlState': req.query.state})
  })
  
  app.get('/token', (req, res) => {
    fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },    
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'code': temp_code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret,
      })
    }).then(response => response.json()) // json(): JSON string -> JSON object
      .then(responseJson => {
        idTokenJson = jwt_decode(responseJson.id_token) // jwt_decode: string -> JSON object
        res.render('token.mustache', {'idTokenJson': JSON.stringify(idTokenJson),
          'name': idTokenJson.name, 'email': idTokenJson.email, 'picture': idTokenJson.picture, 'access_token': responseJson.access_token, 
          'id_token': responseJson.id_token, 'appNonce': nonce, 'jwtNonce': idTokenJson.nonce})
      });
  })
}
                  
app.listen(port, () => {
  console.log(`App running in: ${clientInfJson.web.redirect_uris[0]}`)
})



