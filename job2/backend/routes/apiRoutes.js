const express = require("express");
const mongoose = require("mongoose");
const jwtAuth = require("../lib/jwtAuth");

const User = require("../db/User");
const JobApplicant = require("../db/JobApplicant");
const Recruiter = require("../db/Recruiter");
const Job = require("../db/Job");
const Application = require("../db/Application");

const router = express.Router();

router.post("/jobs", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") { res.status(401).json({ message: "You don't have permissions to add jobs", });
    return; }
  const data = req.body;
  let job = new Job({ userId: user._id, title: data.title, dateOfPosting: data.dateOfPosting, deadline: data.deadline,
                      jobType: data.jobType, duration: data.duration, salary: data.salary });
  job.save().then(() => { res.json({ message: "Job added successfully to the database" }) })
    .catch((err) => { res.status(400).json(err) });
});
router.get("/jobs", jwtAuth, (req, res) => {
  let arr = [{
      $lookup: {
        from: "recruiterinfos",
        localField: "userId",
        foreignField: "userId",
        as: "recruiter",
      }}, { $unwind: "$recruiter" }
  ];
  Job.aggregate(arr).then((posts) => {
      if (posts == null || posts.length === 0) {
        res.status(404).json({ message: "No job found" });
        return; }
      res.json(posts);
    }).catch((err) =>{ res.status(400).json(err) });
});

router.get("/jobs/:id", jwtAuth, (req, res) => {
  Job.findOne({ _id: req.params.id }).then((job) => {
      if (job == null) { res.status(400).json({ message: "Job does not exist", });
        return; }
      res.json(job);
    })
    .catch((err) => {res.status(400).json(err); });
});

router.put("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({ message: "You don't have permissions to change the job details", });
    return; }
  Job.findOne({_id: req.params.id , userId: user.id })
    .then((job) => {
      if (job == null) {res.status(404).json({ message: "Job does not exist", });
        return; }
      const data = req.body;
      if (data.deadline) { job.deadline = data.deadline; }
      job.save().then(() => { res.json({ message: "Job details updated successfully", }); })
        .catch((err) => { res.status(400).json(err); });
    }).catch((err) => { res.status(400).json(err); });
});

router.delete("/jobs/:id", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({ message: "You don't have permissions to delete the job", });
    return; }
  Job.findOneAndDelete({ _id: req.params.id, userId: user.id })
    .then((job) => {
      if (job === null) {
        res.status(401).json({ message: "You don't have permissions to delete the job" });
        return; }
      res.json({ message: "Job deleted successfully", });
    }).catch((err) => { res.status(400).json(err); });
});

router.get("/user", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    Recruiter.findOne({ userId: user._id }).then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({ message: "User does not exist" });
          return; }
        res.json(recruiter);
      }) .catch((err) => { res.status(400).json(err); });
  } else {
    JobApplicant.findOne({ userId: user._id }) .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({ message: "User does not exist", });
          return; }
        res.json(jobApplicant);
      }).catch((err) => { res.status(400).json(err) })}
});

router.get("/user/:id", jwtAuth, (req, res) => {
  User.findOne({ _id: req.params.id }).then((userData) => {
      if (userData === null) {
        res.status(404).json({ message: "User does not exist" })
        return;}
      if (userData.type === "recruiter") {
        Recruiter.findOne({ userId: userData._id }).then((recruiter) => {
            if (recruiter === null) {
              res.status(404).json({ message: "User does not exist" })
              return;}
            res.json(recruiter);
          }).catch((err) => { res.status(400).json(err); });
      } else {
        JobApplicant.findOne({ userId: userData._id }).then((jobApplicant) => {
            if (jobApplicant === null) {
              res.status(404).json({ message: "User does not exist", });
              return;}
            res.json(jobApplicant);
          }).catch((err) => { res.status(400).json(err) })}
    }).catch((err) => { res.status(400).json(err); });
});

router.put("/user", jwtAuth, (req, res) => {
  const user = req.user;
  const data = req.body;
  if (user.type == "recruiter") {
    Recruiter.findOne({ userId: user._id }).then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({ message: "User does not exist" })
          return; }
        if (data.name) { recruiter.name = data.name }
        if (data.contactNumber) { recruiter.contactNumber = data.contactNumber }
        if (data.bio) { recruiter.bio = data.bio; }
        recruiter.save().then(() => { res.json({ message: "User information updated successfully" }) } )
          .catch((err) => { res.status(400).json(err) });
      }).catch((err) => { res.status(400).json(err) });
  } else {
    JobApplicant.findOne({ userId: user._id }).then((jobApplicant) => {
        if (jobApplicant == null) { res.status(404).json({ message: "User does not exist", });
          return;}
        if (data.name) { jobApplicant.name = data.name; }
        if (data.education) { jobApplicant.education = data.education; }
        if (data.skills) { jobApplicant.skills = data.skills; }
        if (data.profile) {jobApplicant.profile = data.profile; }
        jobApplicant.save().then(() => { res.json({ message: "User information updated successfully", }); })
          .catch((err) => { res.status(400).json(err) });
      }).catch((err) => { res.status(400).json(err) });
  }
});

router.post("/jobs/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {res.status(401).json({ message: "You don't have permissions to apply for a job", });
    return;}
  const data = req.body;
  const jobId = req.params.id;
  Application.findOne({ userId: user._id, jobId: jobId,status: { $nin: ["deleted", "accepted", "cancelled"],}
  }).then((appliedApplication) => {
      if (appliedApplication !== null) {res.status(400).json({ message: "You have already applied for this job", });
        return; }
      Job.findOne({ _id: jobId })
        .then((job) => {
          if (job === null) { res.status(404).json({ message: "Job does not exist", });
            return; }
              Application.countDocuments({ userId: user._id, status: {$nin: ["rejected", "deleted", "cancelled", "finished"]} })
                .then((myActiveApplicationCount) => {
                  if (myActiveApplicationCount < 10) {
                    Application.countDocuments({ userId: user._id, status: "accepted"
                    }).then((acceptedJobs) => {
                      if (acceptedJobs === 0) {
                        const application = new Application({ userId: user._id, recruiterId: job.userId, jobId: job._id, status: "applied", sop: data.sop });
                        application.save().then(() => { res.json({message: "Job application successful", }); })
                          .catch((err) => { res.status(400).json(err); });
                    } else {
                      res.status(400).json({ message: "You already have an accepted job. Hence you cannot apply." });}
                    }).catch((err) => { res.status(400).json(err); });
                } else {
                  res.status(400).json({ message: "You have 10 active applications. Hence you cannot apply." }) }
              }).catch((err) => { res.status(400).json(err); });
      }).catch((err) => { res.status(400).json(err); })
  }).catch((err) => { res.status(400).json(err); });
});

router.get("/jobs/:id/applications", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {res.status(401).json({ message: "You don't have permissions to view job applications", });
    return;}
  const jobId = req.params.id;
  let findParams = { jobId: jobId,recruiterId: user._id };

  Application.find(findParams)
    .collation({ locale: "en" })
    .then((applications) => { res.json(applications); })
    .catch((err) => { res.status(400).json(err); });
});

router.get("/applications", jwtAuth, (req, res) => {
  const user = req.user;
  Application.aggregate([{
      $lookup: {
        from: "jobapplicantinfos",
        localField: "userId",
        foreignField: "userId",
        as: "jobApplicant"
      }
    }, { $unwind: "$jobApplicant" },
    { $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job"
      }
    }, { $unwind: "$job" },
    { $lookup: {
        from: "recruiterinfos",
        localField: "recruiterId",
        foreignField: "userId",
        as: "recruiter"
      }
    }, { $unwind: "$recruiter" },
    { $match: {
        [user.type === "recruiter" ? "recruiterId" : "userId"]: user._id
      } }
  ]).then((applications) => { res.json(applications); })
    .catch((err) => { res.status(400).json(err);  });
});

router.put("/applications/:id", jwtAuth, (req, res) => {
  console.log("hello")
  const user = req.user;
  const id = req.params.id;
  const status = req.body.status;

  if (user.type === "recruiter") {
    if (status === "accepted") {
      Application.findOne({ _id: id, recruiterId: user._id 
      }).then((application) => {
          if (application === null) {
            res.status(404).json({ message: "Application not found" });
            return; }
          Job.findOne({ _id: application.jobId, userId: user._id 
          }).then((job) => {
            if (job === null) { res.status(404).json({ message: "Job does not exist" });
              return; }
            Application.countDocuments({ recruiterId: user._id, jobId: job._id, status: "accepted"
            }).then((activeApplicationCount) => {
                application.status = status;
                application.dateOfJoining = req.body.dateOfJoining;
                application.save().then(() => {
                    Application.updateMany({
                        _id: { $ne: application._id }, userId: application.userId,
                        status: {
                          $nin: [ "rejected", "deleted" ,"cancelled","accepted","finished" ]
                        }},
                      { $set: { status: "cancelled" } },{ multi: true }
                    ).then(() => {
                        if (status === "accepted") {
                          Job.findOneAndUpdate({ _id: job._id, userId: user._id },
                            { $set: { acceptedCandidates: activeApplicationCount + 1 } }
                          ).then(() => { res.json({ message: `Application ${status} successfully`, }); })
                            .catch((err) => { res.status(400).json(err); });
                        } else {
                          res.json({ message: `Application ${status} successfully`, });
                        }
                      })
                      .catch((err) => {res.status(400).json(err); });
                  })
                  .catch((err) => { res.status(400).json(err); });
            });
          });
        }).catch((err) => { res.status(400).json(err); });
    } else {
      Application.findOneAndUpdate({
          _id: id,
          recruiterId: user._id,
          status: { $nin: ["rejected", "deleted", "cancelled"] }
        },
        { $set: { status: status } }
      ).then((application) => {
          if (application === null) {
            res.status(400).json({ message: "Application status cannot be updated", });
            return; }
          if (status === "finished") {
            res.json({ message: `Job ${status} successfully` });
          } else {
            res.json({ message: `Application ${status} successfully` })}
        }).catch((err) => { res.status(400).json(err); });
    }
  } else {
    if (status === "cancelled") {
      Application.findOneAndUpdate({
          _id: id, userId: user._id },
        { $set: { status: status }}
      ).then((tmp) => { 
          res.json({ message: `Application ${status} successfully`, });
        }).catch((err) => { res.status(400).json(err); });
    } else {
      res.status(401).json({ message: "You don't have permissions to update job status", });
    }
  }});

router.get("/applicants", jwtAuth, (req, res) => {
  console.log('Query Parameters:', req.query);
  const user = req.user;
  if (user.type === "recruiter") {
    let findParams = { recruiterId: user._id };
    console.log('Query Parameters:', req.query);
    if (req.query.jobId) {
      findParams = {
        ...findParams,
        jobId: new mongoose.Types.ObjectId(req.query.jobId),
      };
    }
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        findParams = {
          ...findParams,
          status: { $in: req.query.status },
        };
      } else {
        findParams = {
          ...findParams,
          status: req.query.status,
        };
      }
    }
    Application.aggregate([{
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant"
        }
      }, { $unwind: "$jobApplicant" },
      { $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job"
        }
      }, { $unwind: "$job" }, { $match: findParams }
    ]).then((applications) => {
        if (applications.length === 0) { res.status(404).json({ message: "No applicants found" });
          return; }
          
        res.json(applications);
      }).catch((err) => { res.status(400).json(err) });
  } else { res.status(400).json({ message: "You are not allowed to access applicants list" }); }
});
module.exports = router;
/*router.get("/applicants", jwtAuth, (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    let findParams = {
      recruiterId: user._id,
    };
    if (req.query.jobId) {
      findParams = {
        ...findParams,
        jobId: new mongoose.Types.ObjectId(req.query.jobId),
      };
    }
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        findParams = {
          ...findParams,
          status: { $in: req.query.status },
        };
      } else {
        findParams = {
          ...findParams,
          status: req.query.status,
        };
      }
    }
    let sortParams = {};

    if (!req.query.asc && !req.query.desc) {
      sortParams = { _id: 1 };
    }

    if (req.query.asc) {
      if (Array.isArray(req.query.asc)) {
        req.query.asc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: 1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.asc]: 1,
        };
      }
    }

    if (req.query.desc) {
      if (Array.isArray(req.query.desc)) {
        req.query.desc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: -1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.desc]: -1,
        };
      }
    }

    Application.aggregate([
      {
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant",
        },
      },
      { $unwind: "$jobApplicant" },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      { $match: findParams },
      { $sort: sortParams },
    ])
      .then((applications) => {
        if (applications.length === 0) {
          res.status(404).json({
            message: "No applicants found",
          });
          return;
        }
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    res.status(400).json({
      message: "You are not allowed to access applicants list",
    });
  }
}); */