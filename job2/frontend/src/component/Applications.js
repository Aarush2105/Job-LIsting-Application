import { useState, useEffect, useContext } from "react";
import { Grid,makeStyles,Paper} from "@material-ui/core";
import axios from "axios";
import Card from "./Card"
import { SetPopupContext } from "../App";
import apiList from "../lib/apiList";

const useStyles = makeStyles((theme) => ({
  statusBlock: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "uppercase",
  },
  jobTileOuter: {},
  popupDialog: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
}));

const ApplicationTile = (props) => {
  const classes = useStyles();
  const { application } = props;
  const appliedOn = new Date(application.dateOfApplication);
  const joinedOn = new Date(application.dateOfJoining);

  const colorSet = {
    applied: "#3454D1",
    shortlisted: "#DC851F",
    accepted: "#09BC8A",
    rejected: "#D1345B",
    deleted: "#B49A67",
    cancelled: "#FF8484",
    finished: "#4EA5D9",
  };

  return (
    <Card >
      <Grid container>
        <Grid xs={9} direction="column">
            <h4>{application.job.title}</h4>
          <div>Posted By: {application.recruiter.name}</div>
          <div>Role : {application.job.jobType}</div>
          <div>Salary : &#8377; {application.job.salary} per month</div>
          <div>
            Duration :{" "}
            {application.job.duration !== 0? `${application.job.duration} month`: `Flexible`}
          </div>
          <div >Applied On: {appliedOn.toLocaleDateString()}</div>
          {application.status === "accepted" || application.status === "finished" ? (
            <div>Joined On: {joinedOn.toLocaleDateString()}</div>
          ) : null}
        </Grid>
        <Grid xs={3}>
          <Paper className={classes.statusBlock} style={{ background: colorSet[application.status], color: "#ffffff"}}>
            {application.status}
          </Paper>
        </Grid>
      </Grid>
    </Card>
  );
};

const Applications = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [applications, setApplications] = useState([]);
  useEffect(() => {getData();}, []);

  const getData = () => {
    axios.get(apiList.applications, {
        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`,},
      }).then((response) => {
        setApplications(response.data);
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: "Error",
        });
      });
  };
  return (
    <div alignItems="center" style={{ padding: "40px", minHeight: "93vh" }}>
      <h1>Applications</h1>
      <div style={{ width: "500px", paddingTop:"10px" }} justify="center" >
        {applications.length > 0 ? (
          applications.map((obj) => ( <ApplicationTile application={obj} />))
        ) : (<h4 style={{ textAlign: "center" }}> No Applications Found </h4>)}
      </div>
    </div>
  );
};

export default Applications;
