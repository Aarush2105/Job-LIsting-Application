import { useContext , useState } from "react";
import { Button, Grid, TextField,MenuItem } from "@material-ui/core";
import axios from "axios";
import Card from "../Card";
import { SetPopupContext } from "../../App";
import apiList from "../../lib/apiList";
const CreateJobs = (props) => {
  const setPopup = useContext(SetPopupContext);

  const [jobDetails, setJobDetails] = useState({
    title: "",
    deadline: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .substr(0, 16),
    jobType: "Full Time",
    duration: 0,
    salary: 0,
  });

  const handleInput = (key, value) => {
    setJobDetails({ ...jobDetails, [key]: value,});
  };

  const handleUpdate = () => {
    console.log(jobDetails);
    axios.post(apiList.jobs, jobDetails, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        setJobDetails({
          title: "",
          deadline: new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000)
            .toISOString()
            .substr(0, 16),
          jobType: "Full Time",
          duration: 0,
          salary: 0,
        });
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };
  return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '93vh', alignItems: 'center', width: '100%'}}>
        <h1>Add Job</h1>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <Card>
              <Grid container direction="column" alignItems="stretch" spacing={3}>
                <Grid item>
                  <TextField label="Title" value={jobDetails.title}
                    onChange={(event) => handleInput("title", event.target.value)}
                    variant="outlined" fullWidth
                  />
                </Grid>
                <Grid item>
                  <TextField select label="Job Type" variant="outlined" value={jobDetails.jobType}
                    onChange={(event) => { handleInput("jobType", event.target.value);}} fullWidth >
                    <MenuItem value="Full Time">Full Time</MenuItem>
                    <MenuItem value="Part Time">Part Time</MenuItem>
                    <MenuItem value="Work From Home">Work From Home</MenuItem>
                  </TextField>
                </Grid>
                <Grid item>
                  <TextField select label="Duration" variant="outlined" value={jobDetails.duration}
                    onChange={(event) => { handleInput("duration", event.target.value); }} fullWidth >
                    <MenuItem value={0}>Flexible</MenuItem>
                    <MenuItem value={2}>2 Months</MenuItem>
                    <MenuItem value={4}>4 Months</MenuItem>
                    <MenuItem value={6}>6 Months</MenuItem>
                  </TextField>
                </Grid>
                <Grid item>
                  <TextField label="Salary" type="number" variant="outlined" value={jobDetails.salary}
                    onChange={(event) => { handleInput("salary", event.target.value);}}
                    InputProps={{ inputProps: { min: 0 } }} fullWidth
                  />
                </Grid>
                <Grid item>
                  <TextField label="Deadline" type="datetime-local" value={jobDetails.deadline}
                    onChange={(event) => { handleInput("deadline", event.target.value);}}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    fullWidth/>
                </Grid>
              </Grid>
              <Button color="primary" style={{ padding: "10px 200px", marginTop: "30px"}} onClick={() => handleUpdate()} >
                Create Job</Button>
            </Card>
        </div>
      </div>
  );
};

export default CreateJobs;
