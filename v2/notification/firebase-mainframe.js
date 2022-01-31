var admin = require("firebase-admin");

var serviceAccount = require("../static/firebase/fcg-app-2ec05-firebase-adminsdk-wpr06-f33c5aeda9.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;