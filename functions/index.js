const functions = require("firebase-functions");
const express = require("express");
const app = express();

const auth = require("./utilities/auth");

const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream,
} = require("./routes/screams");
const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getUserDetails,
} = require("./routes/users");

//Scream routes
app.get("/screams", getAllScreams);

//Creating documents
app.post("/scream", auth, postOneScream);

//
app.get("/scream/:screamId", getScream);

//Delete Scream
app.delete("/scream/:screamId", auth, deleteScream);

//Like Scream
app.get("/scream/:screamId/like", auth, likeScream);

//Unlike Scream
app.get("/scream/:screamId/unlike", auth, unlikeScream);

//Comment Scream
app.post("/scream/:screamId/comment", auth, commentOnScream);

//User Registration
app.post("/signup", signup);

//User Login
app.post("/login", login);

//Upload User Image
app.post("/user/image", auth, uploadImage);

//Adding User Details
app.post("/user", auth, addUserDetails);

app.get("/user", auth, getUserDetails);

exports.api = functions.region("us-east4").https.onRequest(app);
