# oidc-express-demo
 This is a simple demo which shows how to implement oidc in a server-side web (via Express) w/o using any third-party library.

# A live demo
 see https://oidc-express-demo.myron0220.repl.co for a live demo
 
# Installation
 To deploy this website on your own server.
 - ```
   git clone 'https://github.com/myron0220/oidc-express-demo.git'
   cd oidc-express-demo
   ```
 - Get your OIDC credential file from Google by following  
   https://developers.google.com/identity/protocols/oauth2/openid-connect#getcredentials  
 - Put your ".json" credential file into current project folder.
 - Change ```let fileName = '[Change this to your own json key distributed by Google]'``` to you ".json" credential file name.
 - ```
   npm install
   node app.js
   ```
 
