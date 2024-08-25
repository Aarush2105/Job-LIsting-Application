import { useState, useEffect, useContext } from "react";
import { Button, Grid, TextField,Modal} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Card from "../Card";
import axios from "axios";
import { SetPopupContext } from "../../App";
import apiList from "../../lib/apiList";

const JobTile = (props) => {
  let history = useHistory();
  const { job, getData } = props;
  const setPopup = useContext(SetPopupContext);

  const [open, setOpen] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [jobDetails, setJobDetails] = useState(job);

  const handleInput = (key, value) => {
    setJobDetails({...jobDetails, [key]: value,});
  };
  const handleClick = (location) => { history.push(location); };
  const handleClose = () => { setOpen(false); };
  const handleCloseUpdate = () => { setOpenUpdate(false); };

  const handleDelete = () => {
    axios.delete(`${apiList.jobs}/${job._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        getData();
        handleClose();
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        handleClose();
      });
  };
  const handleJobUpdate = () => {
    axios.put(`${apiList.jobs}/${job._id}`, jobDetails, {
        headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
      }).then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        getData();
        handleCloseUpdate();
      }).catch((err) => {
        console.log(err.response);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        handleCloseUpdate();
      });
  };
  const postedOn = new Date(job.dateOfPosting);

  return (
    <Card>
      <Grid container>
        <Grid container xs={9} spacing={1} direction="column">
          <div> <h3>{job.title}</h3></div>
          <div>Role : {job.jobType}</div>
          <div>Salary : &#8377; {job.salary} per month</div>
          <div>
            Duration :{" "}
            {job.duration !== 0 ? `${job.duration} month` : `Flexible`}
          </div>
          <div>Date Of Posting: {postedOn.toLocaleDateString()}</div>
        </Grid>
        <Grid container direction="column" xs={3}>
            <Button color="primary" onClick={() => handleClick(`/job/applications/${job._id}`)}>
                View Applications</Button>
            <Button  onClick={() => {setOpenUpdate(true); }}>
              Update Details </Button>
            <Button color="secondary" onClick={() => { handleDelete();}}>
              Delete Job </Button>
        </Grid>
      </Grid>
      <Modal open={openUpdate} onClose={handleCloseUpdate}>
        <Card>
          <h3 style={{ marginBottom: "30px", textAlign:"center" }}> Update Details </h3>
          <Grid container direction="column" spacing={3}>
              <TextField label="Application Deadline" type="datetime-local"
                value={jobDetails.deadline.substr(0, 16)}
                onChange={(event) => { handleInput("deadline", event.target.value);}}
                InputLabelProps={{ shrink: true,}}
                variant="outlined" />
          </Grid>
          <Grid container justify="center" spacing={5}>
            <Grid item>
              <Button color="secondary" style={{ padding: "10px 50px" }}
                onClick={() => handleJobUpdate()}>
                Update
              </Button>
            </Grid>
            <Grid item>
              <Button color="primary" style={{ padding: "10px 50px" }}
                onClick={() => handleCloseUpdate()}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Modal>
    </Card>
  );
};
const MyJobs = (props) => {
  const [jobs, setJobs] = useState([]);
  const [searchOptions, setSearchOptions] = useState({ query: "" });
  const setPopup = useContext(SetPopupContext);
  useEffect(() => { getData(); }, []);

  const getData = () => {
    let searchParams = [`myjobs=1`];
    if (searchOptions.query !== "") {
      searchParams = [...searchParams, `q=${searchOptions.query}`];
    }
    const queryString = searchParams.join("&");
    let address = apiList.jobs;
    if (queryString !== "") {
      address = `${address}?${queryString}`;
    }
    axios.get(address, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((response) => {
        setJobs(response.data);
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: "Error"
        });
      });
  };
  return (
      <Grid container direction="column" style={{ padding: "30px", minHeight: "93vh" }}>
        <h1 style={{textAlign:"center"}}>My Jobs</h1>
        <TextField label="Search Jobs" value={searchOptions.query} onChange={(event) => setSearchOptions({ ...searchOptions, query: event.target.value })}
              onKeyPress={(ev) => { if (ev.key === "Enter") { getData() } }} style={{ width: "100%" }} variant="outlined" />
        <Grid container direction="column">
          {jobs.length > 0 ? (
            jobs.map((job) => {return <JobTile job={job} getData={getData} />;})
          ) : ( <h4 style={{ textAlign: "center" }}> No jobs found </h4> )}
        </Grid>
      </Grid>
  );
};
export default MyJobs;
