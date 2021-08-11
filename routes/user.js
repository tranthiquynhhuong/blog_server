const express = require("express");
const User = require("../models/user.model");
const config = require("../config");
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");

const router = express.Router();

router.route("/:username").get(
    middleware.checkToken,
    (req,res) => {
        console.log('username: ', req.params.username);
        User.findOne(
            {username: req.params.username},
            (err,result) => {
                console.log("get user: ", err, result);
                if(err) return res.status(500).json({msg:err});
                res.json({
                    data: result,
                    username: req.params.username,
                });
            }
        );
    }
);

router.route("/checkusername/:username").get((req, res) => {
    User.findOne({ username: req.params.username }, (err, result) => {
      if (err) return res.status(500).json({ msg: err });
      if (result !== null) {
        return res.json({
          Status: true,
        });
      } else
        return res.json({
          Status: false,
        });
    });
  });

router.route("/login").post((req, res)=>{
    User.findOne(
        {username: req.body.username},
        (err,result) => {
            if(err) return res.status(500).json({msg:err});
            if(result === null){
               return res.status(403).json("Username incorrect");
            }
            if(result.password === req.body.password){
                let token = jwt.sign(
                    {username: req.body.username},
                    config.key,{} // expire in 24 hours
                );

                res.json({
                    token: token,
                    msg: "success",
                });
            }else{
                res.status(403).json("Password is incorrect");
            }
        }
    ); 
});

router.route("/register").post((req,res)=>{
    console.log("inside the register");
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
    });

    user.save().then(()=>{
        console.log("user registered");
        res.status(200).json("ok");
    }).catch((err)=>{
        res.status(403).json({msg:err});
    });
});

router.route("/update/:username").patch((req, res)=>{
    User.findOneAndUpdate(
        {username: req.params.username},
        {$set: {password: req.body.password}},
        (err, result) => {
            if(err) return res.status(500).json({msg:err});
            const msg = {
                msg: "password successfully update",
                username: req.params.username,
            }
            return res.json(msg);
        }
    );
});

router.route("/delete/:username").delete((req, res)=>{
    User.findOneAndDelete(
        {username: req.params.username},
        (err,result) => {
            if(err) return res.status(500).json({msg: err});
            const msg = {
                msg: "User deleted",
                username: req.params.username,
            }
            return res.json(msg);
        }
    );
});

module.exports = router;