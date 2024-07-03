const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} = require("firebase-admin/firestore");
const firebaseServiceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({
  credential: cert(firebaseServiceAccount),
  databaseURL: process.env.DATABASE_URL,
});
const db = getFirestore();

//Opsi direct firestore
// const { Firestore } = require("@google-cloud/firestore");
// const db = new Firestore({
//   projectId: "",
//   keyFilename: "path/to/credentials-firestore-service-account.json"
// });

const destinations = [];

const getDestination = async () => {
  await db
    .collection("Destinations")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        destinations.push(doc.data());
      });
    });
};
getDestination();

const getEncode = async (place_id) => {
  const historyEncode = await db.collection("place_encode").doc(place_id).get();

  if (historyEncode != null) {
    return historyEncode.data();
  } else {
    console.log("Document not found");
  }
};

const getAllEncode = async () => {
  try {
    const place = [];
    await db
      .collection("place_encode")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          place.push(doc.data());
        });
      });
    return place;
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
};

const favoriteUser = async (user_id) => {
  const history = await db.collection("favorite_place").doc(user_id).get();

  if (history != null) {
    return history.data();
  } else {
    console.log("Document not found");
  }
};

async function storeFavoritePlace(user_id, placeId, data) {
  const docRef = db.collection("favorite_place").doc(user_id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      [placeId]: { ...data },
    });
  } else {
    await docRef.set({
      [placeId]: { ...data },
    });
  }
}

async function deleteFavorite(user_id, placeId) {
  const docRef = db.collection("favorite_place").doc(user_id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      [placeId]: FieldValue.delete(),
    });
  }
}

const historyData = async (user_id) => {
  const history = await db.collection("History_Review").doc(user_id).get();

  if (history != null) {
    return history.data();
  } else {
    console.log("Document not found");
  }
};

async function storeDataHistoryReview(user_id, placeId, dataReview) {
  const docRef = db.collection("History_Review").doc(user_id);
  const doc = await docRef.get();

  if (doc.exists) {
    await docRef.update({
      [placeId]: { ...dataReview },
    });
  } else {
    await docRef.set({
      [placeId]: { ...dataReview },
    });
  }
}

module.exports = {
  destinations,
  storeDataHistoryReview,
  historyData,
  getEncode,
  getAllEncode,
  storeFavoritePlace,
  favoriteUser,
  deleteFavorite,
};
