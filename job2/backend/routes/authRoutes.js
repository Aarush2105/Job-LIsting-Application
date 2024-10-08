const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const authKeys = require("../lib/authKeys");

const User = require("../db/User");
const JobApplicant = require("../db/JobApplicant");
const Recruiter = require("../db/Recruiter");

const router = express.Router();

router.post("/signup", (req, res) => {
  console.log("hi");
  const data = req.body;
  let user = new User({
    email: data.email,
    password: data.password,
    type: data.type,
  });
  console.log("bye")
  user.save().then(() => {
    let userDetails;
    if (user.type === "recruiter") {
      userDetails = new Recruiter({
        userId: user._id,
        name: data.name,
        contactNumber: data.contactNumber,
        bio: data.bio
      });
    } else {
      userDetails = new JobApplicant({
        userId: user._id,
        name: data.name,
        institutionName: data.institutionName,
        startYear: data.startYear,
        endYear: data.endYear,
        resume: data.resume
      });
    }
      userDetails.save().then(() => {
          const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
          res.json({ token: token, type: user.type });
        }).catch((err) => {
          user.delete().then(() => { res.status(400).json(err); })
            .catch((err) => { res.json({  message: "Error deleting user",error: err.message });});
        });
    }).catch((err) => { res.status(400).json({ message: "Error saving user", error: err.message }); });
});

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(401).json(info);
        return;
      }
      const token = jwt.sign({ _id: user._id }, authKeys.jwtSecretKey);
      res.json({
        token: token,
        type: user.type,
      });
    }
  )(req, res, next);
});

module.exports = router;
