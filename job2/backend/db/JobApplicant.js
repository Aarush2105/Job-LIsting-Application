const mongoose = require("mongoose");

let schema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,ref: 'User', required: true },
    name: { type: String, required: true },
    institutionName: { type: String, required: true },
    startYear: { type: Number, max: 2024, required: true, validate: Number.isInteger },
    endYear: { type: Number, max: new Date().getFullYear(),
          validate: [{ validator: Number.isInteger, msg: "Year should be an integer" },
                     {validator: function (value) { return this.startYear <= value; },
                     msg: "End year should be greater than or equal to Start year" }],
    },
    skills: [String],
    resume: { type: String },
    profile: { type: String }
  },

  { collation: { locale: "en" } }
);

module.exports = mongoose.model("JobApplicantInfo", schema);
