const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const firebase = require("firebase");

admin.initializeApp();

const config = {
  apiKey: "AIzaSyB7Z4YSwS9ekMUjzBN-2U3DlUaw7viVnKI",
  authDomain: "twitchapp-da2f5.firebaseapp.com",
  projectId: "twitchapp-da2f5",
  storageBucket: "twitchapp-da2f5.appspot.com",
  messagingSenderId: "48560801093",
  appId: "1:48560801093:web:0fedc9b1040ab4eb00ea2c",
  measurementId: "G-1GLMGQ066S",
};

firebase.initializeApp(config);

const db = admin.firestore();

const auth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" "[0] === "Bearer")
  ) {
    idToken = req.headers.authorization.split(" ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.error("Token verification error", err);
      return res.status(403).json(err);
    });
};

//Getting documents
app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

//Creating documents
app.post("/scream", auth, (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.user.handle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({
        message: `document ${doc.id} created successfully`,
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error!",
      });
      console.error(err);
    });
});

//Helper functions for validation
const isEmpty = (string) => {
  if (string.trim() === "") return true;
  return false;
};

const isEmail = (email) => {
  const emailRegEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  return false;
};

//User Registration
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  let errors = {};
  if (isEmpty(newUser.email)) {
    errors.email = "Email is required";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be valid email address";
  }

  if (isEmpty(newUser.password)) errors.password = "Password is required";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords don't match!";
  if (isEmpty(newUser.handle)) errors.handle = "Handle is required";
  if (Object.keys(errors).length) return res.status(400).json(errors);
  //Validate data
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({
          handle: "This handle is already taken",
        });
      }
      return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password);
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCreds = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.handle}`).set(userCreds);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({
          email: "Email is already in use",
        });
      }
      return res.status(500).json({ error: err.code });
    });
});

//User Login
app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Email is required";
  if (isEmpty(user.password)) errors.password = "Password is required";

  if (Object.keys(errors).length) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        return res.status(403).json({
          general: "Wrong Credentials. Please try again",
        });
      }
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("us-east4").https.onRequest(app);
