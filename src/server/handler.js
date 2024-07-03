const {
  destinations,
  getEncode,
  historyData,
  storeDataHistoryReview,
  getAllEncode,
  storeFavoritePlace,
  favoriteUser,
  deleteFavorite,
} = require("../services/Data_Connection.js");
const { PythonShell } = require("python-shell");

const getAllData = async (req, res) => {
  if (destinations.length === 0) {
    res.status(200).send({
      status: "success",
      data: [],
    });
  } else {
    res.status(200).send({
      status: "success",
      data: destinations,
    });
  }
};

const getPopularDestinations = (req, res) => {
  const popularDestination = destinations.filter((d) => d.rating >= 4.5);

  res.status(200).send({
    status: "success",
    data: popularDestination,
  });
};

const getDataById = async (req, res) => {
  const placeId = req.params.place_id;
  const user_id = req.query.uid;
  const dataHistoryUser = await historyData(user_id);
  const ratingDetail = dataHistoryUser[placeId]?.rating_user;
  const favorite_user = await favoriteUser(user_id);
  const favorite_detail = favorite_user[placeId]?.favorite;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[new Date().getDay()];

  const destination = destinations.filter(
    (d) => d.placeId.toString() === placeId
  )[0];

  if (destination !== undefined) {
    res.status(200).send({
      status: "success",
      data: {
        ...destination,
        day,
        rating_user: ratingDetail ?? 0,
        favorite: favorite_detail,
      },
    });
  } else {
    res.status(404).send({
      status: "fail",
      message: "destination tidak ditemukan",
    });
  }
};

const addFavoriteDestination = async (req, res) => {
  try {
    const placeId = req.params.place_id;
    const user_id = req.query.uid;
    const { favorite } = req.body;

    if (!placeId || !user_id) {
      return res.status(400).send({
        status: "error",
        message: "placeId atau user_id kosong",
      });
    }

    if (!favorite) {
      return res.status(400).send({
        status: "error",
        message: "pilih tempat favoritmu ya..",
      });
    }

    const destination = destinations.filter(
      (d) => d.placeId.toString() === placeId
    )[0];

    const data = {
      ...destination,
      favorite,
    };

    await storeFavoritePlace(user_id, placeId, data);

    res.status(200).send({
      status: "success",
      message: "Berhasil Menyimpan tempat favoritmu",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

const deleteFavoriteUser = async (req, res) => {
  const placeId = req.params.place_id;
  const user_id = req.query.uid;
  const { favorite } = req.body;

  console.log(favorite);

  if (!favorite) {
    await deleteFavorite(user_id, placeId);
    res.status(200).send({
      status: "success",
      message: "Berhasil menghapus favorite",
    });
  } else {
    res.status(400).send({
      status: "fail",
      message: "gagal menghapus favorite, pastikan kamu menghapus dengan benar",
    });
  }
};

const addHistoryReviewUser = async (req, res) => {
  try {
    const placeId = req.params.place_id;
    const user_id = req.query.uid;
    const { rating } = req.body;
    const encodeDetail = await getEncode(placeId);

    if (!placeId || !user_id) {
      return res.status(400).send({
        status: "error",
        message: "placeId atau user_id kosong",
      });
    }

    if (!rating) {
      return res.status(400).send({
        status: "error",
        message: "Jangan lupa isi rating ya...",
      });
    }

    const createdAt = new Date().toISOString();

    const destination = destinations.filter(
      (d) => d.placeId.toString() === placeId
    )[0];

    const dataRiview = {
      placeId: Number(placeId),
      rating_user: rating,
      category: encodeDetail.kategori,
      city: encodeDetail.kota,
      rating_place: encodeDetail.penilaian,
      verified: encodeDetail.terverifikasi,
      createdAt,
      name: destination.name,
      photo: destination.photo1,
    };

    await storeDataHistoryReview(user_id, placeId, dataRiview);

    res.status(200).send({
      status: "success",
      message: "Berhasil Menyimpan data history",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

const getFavoriteUser = async (req, res) => {
  const user_id = req.query.uid;
  try {
    const favorite_user = await favoriteUser(user_id);

    res.status(200).send({
      status: "success",
      data:
        favorite_user != null
          ? favorite_user
          : "Kamu belum punya tempat favorite, Yuk Jelajah",
    });
  } catch (error) {
    console.error("Error retrieving history data: ", error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getDataHistory = async (req, res) => {
  const user_id = req.query.uid;
  try {
    const historyUser = await historyData(user_id);

    res.status(200).send({
      status: "success",
      data:
        historyUser != null
          ? historyUser
          : "kamu belum pernah mereview tempat manapun",
    });
  } catch (error) {
    console.error("Error retrieving history data: ", error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getRecommendationDestination = async (req, res) => {
  const user_id = req.query.uid;

  let userIdInput;
  let placeInput;
  let categoryInput;
  let cityInput;
  let ratingAllInput;
  let verifiedInput;
  let ratingUserInput;

  if (await historyData(user_id)) {
    const valueHistoryUser = Object.values(await historyData(user_id));
    userIdInput = new Array(valueHistoryUser.length).fill(27499);
    placeInput = valueHistoryUser.map((v) => v.placeId);
    categoryInput = valueHistoryUser.map((v) => v.category);
    cityInput = valueHistoryUser.map((v) => v.city);
    ratingAllInput = valueHistoryUser.map((v) => v.rating_place);
    verifiedInput = valueHistoryUser.map((v) => v.verified);
    ratingUserInput = valueHistoryUser.map((v) => v.rating_user);
  } else {
    userIdInput = "";
    placeInput = "";
    categoryInput = "";
    cityInput = "";
    ratingAllInput = "";
    verifiedInput = "";
    ratingUserInput = "";
  }

  const encode = await getAllEncode();
  const place_encode = encode.map((e) => e.tempatId);
  const category_encode = encode.map((e) => e.kategori);
  const city_encode = encode.map((e) => e.kota);
  const rating_encode = encode.map((e) => e.penilaian);
  const verified_encode = encode.map((e) => e.terverifikasi);

  let options = {
    args: [
      userIdInput,
      placeInput,
      categoryInput,
      cityInput,
      ratingAllInput,
      verifiedInput,
      ratingUserInput,
      place_encode,
      category_encode,
      city_encode,
      rating_encode,
      verified_encode,
    ],
  };

  const runPythonScript = async () => {
    try {
      let train = await PythonShell.run(
        "./src/server/model/trainmodel.py",
        options
      );
      return train;
    } catch (err) {
      console.error("Error executing Python script:", err);
      throw err;
    }
  };

  let hasilData = await runPythonScript();
  const hasil = JSON.parse(hasilData[1]);

  res.status(200).send({
    status: "success",
    data: destinations.filter((item) => hasil.includes(item.placeId)),
  });
};

module.exports = {
  getAllData,
  getPopularDestinations,
  getDataById,
  addFavoriteDestination,
  deleteFavoriteUser,
  addHistoryReviewUser,
  getFavoriteUser,
  getDataHistory,
  getRecommendationDestination,
};
