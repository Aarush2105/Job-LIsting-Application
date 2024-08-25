import { useState, useEffect, useContext } from "react";
import { Button, Grid, TextField, Modal } from "@material-ui/core";
import axios from "axios";
import Card from "./Card";
import { SetPopupContext } from "../App";
import apiList from "../lib/apiList";
import { userType } from "../lib/isAuth";

const JobTile = (props) => {
  const { job } = props;
  const setPopup = useContext(SetPopupContext);
  const [open, setOpen] = useState(false);
  const [sop, setSop] = useState("");

  const handleClose = () => {
    setOpen(false);
    setSop("");
  };
  const handleApply = () => {
    axios.post(
        `${apiList.jobs}/${job._id}/applications`,
        {sop: sop },
        {headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}}
      ).then((response) => {
        setPopup({ open: true, severity: "success", message: response.data.message });
        handleClose();
      }).catch((err) => {
        setPopup({ open: true, severity: "error", message: err.response.data.message });
        handleClose();
      });
  };
  const deadline = new Date(job.deadline).toLocaleDateString();
  return (
    <Card style={{width:"100%"}}>
      <Grid container>
        <Grid container item xs={9} spacing={1} direction="column">
          <h2>{job.title}</h2>
          <div>Role : {job.jobType}</div>
          <div>Salary : &#8377; {job.salary} per month</div>
          <div> Duration :{" "}
            {job.duration !== 0 ? `${job.duration} month` : `Flexible`}
          </div>
          <div>Posted By : {job.recruiter.name}</div>
          <div>Application Deadline : {deadline}</div>
        </Grid>
        <Grid xs={3}>
          <Button variant="contained" color="primary" style={{width: "100%", height: "100%"}} onClick={() => { setOpen(true);}}
            disabled={userType() === "recruiter"}> Apply</Button>
        </Grid>
      </Grid>
      <Modal open={open} onClose={handleClose} style={{display: "flex",alignItems: "center", justifyContent: "center"}}>
         <Card> 
          <TextField label="Write SOP" multiline rows={8} style={{ width: "100%", marginBottom: "30px" }} variant="outlined" value={sop}
            onChange={(event) => { setSop(event.target.value) }}/>
          <Button color="primary" style={{ padding: "10px 50px" }} onClick={() => handleApply()} >
            Submit </Button>
         </Card>
      </Modal>
    </Card>
  );
};
const Home = (props) => {
  const [jobs, setJobs] = useState([]);
  const [searchOptions, setSearchOptions] = useState({ query: "" });
  const setPopup = useContext(SetPopupContext);
  useEffect(() => { getData() }, []);

  const getData = () => {
    let searchParams = [];
    if (searchOptions.query !== "") {
      searchParams = [...searchParams, `q=${searchOptions.query}`];
    }
    const queryString = searchParams.join("&");
    let address = apiList.jobs;
    if (queryString !== "") {
      address = `${address}?${queryString}`;
    }
    axios.get(address ,{
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}}).then((response) => {
        setJobs(
          response.data.filter((obj) => {
            const today = new Date();
            const deadline = new Date(obj.deadline);
            return deadline > today;
          })
        );
      }).catch((err) => { 
        setPopup({ open: true, severity: "error", message: "Error pata nhi" }) });
  };
  return (
      <Grid style={{ padding: "30px", minHeight: "93vh",width: "80%"}}>
          <h1 style= {{textAlign:"center"}}> Jobs </h1>
          <TextField label="Search Jobs" value={searchOptions.query} onChange={(event) => setSearchOptions({ ...searchOptions, query: event.target.value })}
              onKeyPress={(ev) => { if (ev.key === "Enter") { getData() } }} style={{ width: "100%" }} variant="outlined" />
        <Grid container item xs direction="column" alignItems="stretch" justify="center" >
          {jobs.length > 0 ? (
            jobs.map((job) => { return <JobTile job={job} />; })
          ) : (<h5 style={{ textAlign: "center" }}><b><i> No jobs found </i></b></h5>)}
        </Grid>
      </Grid>
  );
};
export default Home;