/*
  A node.js express demo to illustrate OpenID Connect authorization code flow.
  Author: Mingzhe Wang
  Date: Jul 28, 2022
*/

const mustacheExpress = require('mustache-express')
const express = require('express')
const jwt_decode = require('jwt-decode');

const app = express()
const port = 3000
const client_id = '1032254166654-13ah1po3rnf4cgcee13bmduks7iv53g9.apps.googleusercontent.com'
const client_secret = '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'
const redirect_uri = 'http://localhost:3000/code'
const scope = 'openid profile address email phone'

app.engine('mustache', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', __dirname + '/views')

app.get('/', (req, res) => {
  res.render('index.mustache')
})

app.get('/login', (req, res) => {
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth'
  + '?client_id=' + client_id
  + '&redirect_uri=' + redirect_uri
  + '&scope=' + scope
  + '&response_type=code'
  + '&response_mode=query'
  + '&state=6oawgkr4zyn'
  + '&nonce=v0szchoal3')
})

/*
Then redirect URL will carry a query params as following [Sample redirect URL]:
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
    res.render('code.mustache', {'code': temp_code})
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
        res.render('token.mustache', {'name': idTokenJson.name, 'email': idTokenJson.email, 'picture': idTokenJson.picture, 'access_token': responseJson.access_token})
      });
  })
}
                  
app.listen(port, () => {
  console.log(`App running in: http://localhost:${port}/`)
})

