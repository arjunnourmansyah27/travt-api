const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  getDataById,
  getAllData,
  getPopularDestinations,
  addHistoryReviewUser,
  getDataHistory,
  getRecommendationDestination,
  addFavoriteDestination,
  getFavoriteUser,
  deleteFavoriteUser,
} = require("./handler.js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.get("/destination", getAllData);
app.get("/destination/popular", getPopularDestinations);
app.get("/destination/:place_id", getDataById);
app.post("/destination/:place_id/favorite", addFavoriteDestination);
app.delete("/destination/:place_id/favorite", deleteFavoriteUser);
app.post("/destination/:place_id/review/create", addHistoryReviewUser);
app.get("/favorite", getFavoriteUser);
app.get("/review/history", getDataHistory);
app.get("/recommendation", getRecommendationDestination);

app.listen(PORT, HOST, () => {
  console.log(`Server already running on port ${PORT}`);
});
