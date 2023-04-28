const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/notebook";

const coonectToMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("connected to mongo successfully"))
    .catch((error) =>
      console.log("error occurs while connecting mongodb", error)
    );
};

module.exports = coonectToMongo;
