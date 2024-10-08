const mongoose = require("mongoose");

let schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String,
      enum: ["applied", "shortlisted", "accepted", "rejected", "deleted", "cancelled", "finished" ],
      default: "applied", required: true
    },
    dateOfApplication: { type: Date , default: Date.now },
    dateOfJoining: { type: Date,
      validate: [{
          validator: function (value) { return this.dateOfApplication <= value;},
          msg: "dateOfJoining should be greater than dateOfApplication"},
    ]},
    sop: {type: String}
  },
  { collation: { locale: "en" } }
);
module.exports = mongoose.model("applications", schema);