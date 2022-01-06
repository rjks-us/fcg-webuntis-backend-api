var admin = require("firebase-admin");

var serviceAccount = require("../static/firebase/fcg-app-v1-aa4fe-firebase-adminsdk-8qn31-eb678b31ff.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;