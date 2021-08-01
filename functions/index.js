const functions = require("firebase-functions");
const express = require("express");
const app = express();

const auth = require("./utilities/auth");

const { getAllScreams, postOneScream } = require("./routes/screams");
const { signup, login } = require("./routes/users");

//Scream routes
app.get("/screams", getAllScreams);

//Creating documents
app.post("/scream", auth, postOneScream);

//User Registration
app.post("/signup", signup);

//User Login
app.post("/login", login);

exports.api = functions.region("us-east4").https.onRequest(app);
