import { useState, useEffect, useContext } from "react";
import { Button, Grid} from "@material-ui/core";
import axios from "axios";
import Card from "../Card"
import { SetPopupContext } from "../../App";

import apiList from "../../lib/apiList";

const ApplicationTile = (props) => {
  const { application, getData } = props;
  const setPopup = useContext(SetPopupContext);
  const [openEndJob, setOpenEndJob] = useState(false);

  const appliedOn = new Date(application.dateOfApplication);
  const handleCloseEndJob = () => {
    setOpenEndJob(false);
  };
  const updateStatus = (status) => {
    const address = `${apiList.applications}/${application._id}`;
    const statusData = {
      status: status,dateOfJoining: new Date().toISOString()
    };
    console.log('Request URL:', address);
    console.log('Request Data:', statusData);
    axios.put(address, statusData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}
      })
      .then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        handleCloseEndJob();
        getData();
      })
      .catch((err) => {
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
        handleCloseEndJob();
      });
  };
  return (
    <Card>
      <Grid container style={{justifyContent:"space-between"}}>
        <Grid xs={7} direction="column">
            <h4> {application.jobApplicant.name}</h4>
          <Grid item>Job Title: {application.job.title}</Grid>
          <Grid item>Role: {application.job.jobType}</Grid>
          <Grid item>Applied On: {appliedOn.toLocaleDateString()}</Grid>
          <Grid item>
            SOP: {application.sop !== "" ? application.sop : "Not Submitted"}
          </Grid>
        </Grid>
        <Grid  container direction="column" xs={3}>
          <Grid xs>
            <Button variant="contained" color="primary" style={{ background: "#09BC8A",width: "100%",height: "100%" }}
              onClick={() => { updateStatus("finished")}}>
              End Job</Button>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};
const AcceptedApplicants = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [applications, setApplications] = useState([]);
  useEffect(() => {getData();
  }, []);
  const getData = () => {
    let searchParams = [];
    searchParams = [...searchParams, `status=accepted`];
    const queryString = searchParams.join("&");
    console.log(queryString);
    let address = `${apiList.applicants}`;
    if (queryString !== "") {
      address = `${address}?${queryString}`;
    }
    
    axios.get(address, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`}})
      .then((response) => { 
        console.log('API Response:', response.data);
        setApplications(response.data);})
      .catch((err) => {
        setApplications([]);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };
  return (
    <>
    <h2 style={{paddingBottom:""}}>Employees</h2>
    <>
      <div style={{ width: "90%" }}>
        {applications.length > 0 ? (applications.map((obj) => (
          <ApplicationTile application={obj} getData={getData} />))
          ) : (<h4 style={{ textAlign: "center" }}> No Applications Found </h4>)}
      </div>
      </>
    </>);
};

export default AcceptedApplicants;
