const express = require("express");
const router = express.Router();
const Profile = require("../models/profile.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

// multer configuration
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, req.decoded.username + ".jpg");
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 6,
  },
  // fileFilter: fileFilter,
});

// adding and update profile image
router
  .route("/add/image")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    Profile.findOneAndUpdate(
      { username: req.decoded.username },
      {
        $set: {
          img: req.file.path,
        },
      },
      { new: true },
      (err, profile) => {
        if (err) return res.status(500).send(err);
        const response = {
          message: "image added successfully updated",
          data: profile,
        };
        return res.status(200).send(response);
      }
    );
  });


// adding profile info
router.route("/add").post(middleware.checkToken, (req, res) => {
    const profile = Profile({
      username: req.decoded.username,
      name: req.body.name,
      profession: req.body.profession,
      DOB: req.body.DOB,
      titleline: req.body.titleline,
      about: req.body.about,
    });
    profile
      .save()
      .then(() => {
        return res.json({ msg: "profile successfully stored" });
      })
      .catch((err) => {
        return res.status(400).json({ err: err });
      });
  });

  // check profile data
  router.route("/checkProfile").get(middleware.checkToken, (req, res) => {
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
      if (err) return res.json({ err: err });
      else if (result == null) {
        return res.json({ status: false, username: req.decoded.username });
      } else {
        return res.json({ status: true, username: req.decoded.username });
      }
    });
  });

  // get profile info
  router.route("/getData").get(middleware.checkToken, (req, res) => {
    Profile.findOne({ username: req.decoded.username }, (err, result) => {
      if (err) return res.json({ err: err });
      if (result == null) return res.json({ data: [] });
      else return res.json({ data: result });
    });
  });

  // update profile info
  router.route("/update").patch(middleware.checkToken, async (req, res) => {
    let profile = {};
    await Profile.findOne({ username: req.decoded.username }, (err, result) => {
      if (err) {
        profile = {};
      }
      if (result != null) {
        profile = result;
      }
    });
    Profile.findOneAndUpdate(
      { username: req.decoded.username },
      {
        $set: {
          name: req.body.name ? req.body.name : profile.name,
          profession: req.body.profession
            ? req.body.profession
            : profile.profession,
          DOB: req.body.DOB ? req.body.DOB : profile.DOB,
          titleline: req.body.titleline ? req.body.titleline : profile.titleline,
          about: req.body.about ? req.body.about : profile.about, //about:""
        },
      },
      { new: true },
      (err, result) => {
        if (err) return res.json({ err: err });
        if (result == null) return res.json({ data: [] });
        else return res.json({ data: result });
      }
    );
  });

  module.exports = router;
