const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const { JWT_SECRET } = require("../secret");

// create user
router.post(
  "/createUser",
  [
    //validate name
    body("name")
      .isLength({ min: 3 })
      .withMessage("username must be at least 3 character"),
    //validate email
    body("email")
      .isEmail()
      .withMessage("Enter a valid email")
      .custom((value) => {
        return User.findOne({ email: value })
          .exec()
          .then((user) => {
            if (user) {
              return Promise.reject("E-mail already exists.");
            }
          });
      }),
    //validate password
    body("password")
      .isLength({ min: 5 })
      .withMessage("password must be at least 5 character"),
  ],
  async (req, res) => {
    //check all validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      var salt = bcrypt.genSaltSync(10);
      var hashPassword = bcrypt.hashSync(password, salt);

      //create the user
      const user = await User.create({
        name: name,
        email: email,
        password: hashPassword,
      });

      //this data is send to JWT payload
      const data = { id: user.id };

      //create a JWT token
      const jwt_token = jwt.sign(data, JWT_SECRET);

      res.send({ authtoken: jwt_token });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

// login user
router.post(
  "/login",
  [
    //validate email
    body("email").isEmail().withMessage("Enter a valid email"),
    //check password is exists
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    //check all validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      // find user in database
      const user = await User.findOne({ email });

      //if user is not exists
      if (!user) {
        return res
          .status(400)
          .json({ error: "login credentials is incorrect" });
      }

      //compare password
      const passwordCompare = await bcrypt.compare(password, user.password);

      //if password is not match
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "login credentials is incorrect" });
      }

      //this data is send to JWT payload
      const data = { id: user.id };

      //create a JWT token
      const jwt_token = jwt.sign(data, JWT_SECRET);

      res.send({ authtoken: jwt_token });
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//get user data using ID
router.post("/getUser", verifyToken, async (req, res) => {
  try {
    //find a user and send it but without password key
    const user = await User.findById(req.userId).select("-password");
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
