const express = require("express");
const router = express.Router();
const BlogPost = require("../models/blogpost.model");
const middleware = require("../middleware");
const multer = require("multer");

// multer configuration
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "./uploads");
    },
    filename: (req, file, callback) => {
      callback(null, req.params.id + ".jpg");
    },
  });

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 6,
    },
});

// Get my blogs
router.route("/getOwnBlog").get(middleware.checkToken, (req, res) => {
    BlogPost.find({ username: req.decoded.username }, (err, result) => {
      if (err) return res.json(err);
      return res.json({ data: result });
    });
  });

// get orhter user blogs
// [$ne] -> not equal -> !=
router.route("/getOtherBlog").get(middleware.checkToken, (req, res) => {
    BlogPost.find({ username: { $ne: req.decoded.username } }, (err, result) => {
      if (err) return res.json(err);
      return res.json({ data: result });
    });
});

// delete blog post
router.route("/delete/:id").delete(middleware.checkToken, (req, res) => {
    BlogPost.findOneAndDelete(
      {
        $and: [{ username: req.decoded.username }, { _id: req.params.id }],
      },
      (err, result) => {
        if (err) return res.json(err);
        else if (result) {
          console.log(result);
          return res.json("Blog deleted");
        }
        return res.json("Blog not deleted");
      }
    );
  });

// add cover img for blog
router
  .route("/add/coverImage/:id")
  .patch(middleware.checkToken, upload.single("img"), (req, res) => {
    BlogPost.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          coverImage: req.file.path,
        },
      },
      { new: true },
      (err, result) => {
        if (err) return res.json(err);
        return res.json(result);
      }
    );
  });

// adding new blog
router.route("/add").post(middleware.checkToken, (req, res) => {
    const blogpost = BlogPost({
      username: req.decoded.username,
      title: req.body.title,
      body: req.body.body,
    });
    blogpost
      .save()
      .then((result) => {
        res.json({ data: result["_id"] }); 
      })
      .catch((err) => {
        console.log(err), res.json({ err: err });
      });
  });

  module.exports = router;