import { useState, useEffect, useContext } from "react";
import { Button, Grid} from "@material-ui/core";
import { useParams } from "react-router-dom";
import axios from "axios";
import Card from "../Card"
import { SetPopupContext } from "../../App";
import apiList from "../../lib/apiList";

const ApplicationTile = (props) => {
  const { application, getData } = props;
  const setPopup = useContext(SetPopupContext);

  const appliedOn = new Date(application.dateOfApplication);
  const colorSet = {
    applied: "#3454D1",
    shortlisted: "#DC851F",
    accepted: "#09BC8A",
    rejected: "#D1345B",
    deleted: "#B49A67",
    finished: "#4EA5D9",
  };
  const updateStatus = (status) => {
    const address = `${apiList.applications}/${application._id}`;
    const statusData = {
      status: status, dateOfJoining: new Date().toISOString(),
    };
    axios.put(address, statusData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        getData();
      })
      .catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };
  const buttonSet = {
    applied: (
      <Card style={{padding:"0"}}>
          <Button style={{background: colorSet["shortlisted"],color: "#ffffff",width: "100%",height:"70%" }}
            onClick={() => updateStatus("shortlisted")}>
            Shortlist </Button>
          <Button style={{background: colorSet["rejected"], color: "#ffffff",width: "100%",height:"70%"  }}
            onClick={() => updateStatus("rejected")}>
            Reject </Button>
      </Card>),
      shortlisted: (
      <Card style={{padding:"0"}}>
          <Button
            style={{ background: colorSet["accepted"], color: "#ffffff",width: "100%" ,height:"70%" }}
            onClick={() => updateStatus("accepted")} >
            Accept </Button> 
          <Button
            style={{ background: colorSet["rejected"], color: "#ffffff",width: "100%" ,height:"70%"}}
            onClick={() => updateStatus("rejected")} >
            Reject </Button>
      </Card>),
    rejected: (
          <Card style={{ background: colorSet["rejected"], color: "#ffffff" }}>
            Rejected </Card>
    ),
    accepted: (
          <Card style={{ background: colorSet["accepted"],color: "#ffffff"}}>
            Accepted</Card>
    ),
    finished: (
          <Card style={{ background: colorSet["finished"], color: "#ffffff" }}>
            Finished</Card>
    ),
  };
  return (
    <Card>
      <Grid container>
        <Grid item xs={7} >
          <h4>{application.jobApplicant.name} </h4>
          <div>Applied On: {appliedOn.toLocaleDateString()}</div>
          <div>
            Education:{" "}
            {application.jobApplicant.education
              .map((edu) => {
                return `${edu.institutionName} (${edu.startYear}-${
                  edu.endYear ? edu.endYear : "Ongoing"
                })`;
              })
              .join(", ")}
          </div>
          <div> SOP: {application.sop !== "" ? application.sop : "Not Submitted"} </div>
        </Grid>
         {buttonSet[application.status]}
      </Grid>
    </Card>
  );
};
const JobApplications = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [applications, setApplications] = useState([]);
  const { jobId } = useParams();
  const [searchOptions, setSearchOptions] = useState({
    status: {
      all: false,
      applied: false,
      shortlisted: false 
    },
    sort: {
      "jobApplicant.name": {
        status: false,
        desc: false
      },
      dateOfApplication: {
        status: true,
        desc: true
      }
    }
  });
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    let searchParams = [];

    if (searchOptions.status.rejected) {
      searchParams = [...searchParams, `status=rejected`];
    }
    if (searchOptions.status.applied) {
      searchParams = [...searchParams, `status=applied`];
    }
    if (searchOptions.status.shortlisted) {
      searchParams = [...searchParams, `status=shortlisted`];
    }
    let asc = [],
      desc = [];
    Object.keys(searchOptions.sort).forEach((obj) => {
      const item = searchOptions.sort[obj];
      if (item.status) {
        if (item.desc) {
          desc = [...desc, `desc=${obj}`];
        } else {
          asc = [...asc, `asc=${obj}`];
        }
      }
    });
    searchParams = [...searchParams, ...asc, ...desc];
    const queryString = searchParams.join("&");
    console.log(queryString);
    let address = `${apiList.applicants}?jobId=${jobId}`;
    if (queryString !== "") {
      address = `${address}&${queryString}`;
    }
    axios.get(address, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        setApplications(response.data);
      }).catch((err) => {
        setApplications([]);
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
  };
  return (
      <Grid container style={{ padding: "30px" }} >
        <h1 style= {{textAlign:"center"}}>Applications</h1>
        <Grid style={{ width: "100%" }}>
          {applications.length > 0 ? ( applications.map((obj) => (
                <ApplicationTile application={obj} getData={getData} />
            ))
          ) : ( <h4 style={{ textAlign: "center" }}> No Applications Found </h4> )}
        </Grid>
      </Grid>
  );
};
export default JobApplications;
