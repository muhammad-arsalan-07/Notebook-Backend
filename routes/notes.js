const express = require("express");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");
const Notes = require("../models/Notes");
const router = express.Router();

//get user all notes using ID
router.get("/getAllNotes", verifyToken, async (req, res) => {
  try {
    const userAllNotes = await Notes.find({ userId: req.userId });
    res.json(userAllNotes);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

//add a new note
router.post(
  "/addNote",
  verifyToken,
  //validate title
  body("title")
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 character"),
  //validate description
  body("description")
    .isLength({ min: 5 })
    .withMessage("description must be at least 5 character"),
  async (req, res) => {
    //check all validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, tags } = req.body;
      const newNote = await Notes.create({
        userId: req.userId,
        title,
        description,
        tags,
      });
      res.send(newNote);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

//update note
router.put(
  "/updateNote/:id",
  verifyToken,
  //validate title
  body("title")
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 character"),
  //validate description
  body("description")
    .isLength({ min: 5 })
    .withMessage("description must be at least 5 character"),
  async (req, res) => {
    //check all validations
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, description, tags } = req.body;

      //find a note is exists or not using note id
      const note = await Notes.findById(req.params.id);

      //if note is not exists
      if (!note) {
        return res.status(404).send("Not found");
      }

      //allow update only if user own this note
      if (note.userId.toString() !== req.userId) {
        return res.status(401).send("Not Allowed");
      }

      //find the note and update it. It will return updated note
      const updateNote = await Notes.findByIdAndUpdate(
        req.params.id,
        {
          $set: { title, description, tags },
        },
        { new: true }
      );

      res.send(updateNote);
    } catch (error) {
      res.status(500).send("Internal server error");
    }
  }
);

router.delete("/deleteNote/:id", verifyToken, async (req, res) => {
  try {
    //find a note is exists or not using note id
    const note = await Notes.findById(req.params.id);

    //if note is not exists
    if (!note) {
      return res.status(404).send("Not found");
    }

    //allow delete only if user own this note
    if (note.userId.toString() !== req.userId) {
      return res.status(401).send("Not Allowed");
    }

    //find the note and delete it. It will return deleted note
    const deletedNote = await Notes.findByIdAndDelete(req.params.id);

    res.send(deletedNote);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
