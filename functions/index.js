const functions = require("firebase-functions");
const express = require("express");
const app = express();

const auth = require("./utilities/auth");

const { db } = require("./utilities/admin");

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
  getAuthenticatedUserDetails,
  getUserDetails,
  markNotificationsRead,
} = require("./routes/users");

//Scream routes
app.get("/screams", getAllScreams);

//Creating documents
app.post("/scream", auth, postOneScream);

//Get Scream
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

//Get Authenticated User
app.get("/user", auth, getAuthenticatedUserDetails);

//Get User Details
app.get("/user/:handle", auth, getUserDetails);

//Read Notifications
app.post("/notifications", auth, markNotificationsRead);

exports.api = functions.region("northamerica-northeast1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("northamerica-northeast1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .region("northamerica-northeast1")
  .firestore.document("likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });
exports.createNotificationOnComment = functions
  .region("northamerica-northeast1")
  .firestore.document("comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

//Trigger to change all of the user's image on screams
exports.onUserImageChange = functions
  .region("northamerica-northeast1")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    const batch = db.batch();
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      return db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

//Delete all notifications related to deleted scream
exports.onScreamDelete = functions
  .region("northamerica-northeast1")
  .firestore.document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("screamId", "==", screamId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
