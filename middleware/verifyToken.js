const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../secret");

const verifyToken = (req, res, next) => {
  try {
    //get jwt token from request header
    const token = req.header("auth-token");

    //verify jwt token
    const verifyToken = jwt.verify(token, JWT_SECRET);

    // add user id to request object
    req.userId = verifyToken.id;

    next();
  } catch (error) {
    res.status(401).send({ error: "your token is invalid" });
  }
};
module.exports = verifyToken;
