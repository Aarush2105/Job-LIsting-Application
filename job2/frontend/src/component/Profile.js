import { useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import axios from "axios";
import Card from "./Card";
import { SetPopupContext } from "../App";
import DescriptionIcon from "@material-ui/icons/Description";
import apiList from "../lib/apiList";
import FileUploadInput from "../lib/FileUploadInput";
const Profile = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [open, setOpen] = useState(false);
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    education: {
      institutionName: "",
      startYear: "",
      endYear: "",
      resume: "",
    },
    profile: ""
  });
  const handleInput = (key, value) => {
    setProfileDetails({ ...profileDetails, [key]: value });
  };
  useEffect(() => { getData() }, []);
  const getData = () => {
    axios.get(apiList.user, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        setProfileDetails({
          ...response.data,
          education: response.data.education || {
            institutionName: "",
            startYear: "",
            endYear: "",
          }
        });
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: "Error fetching data"
        });
      });
  };
  const handleUpdate = () => {
    const updatedEducation = profileDetails.education?.institutionName?.trim() ? profileDetails.education: {};
    const updatedDetails = { ...profileDetails, education: updatedEducation };
    axios.put(apiList.user, updatedDetails, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then((response) => {
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
        getData();
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.response.data.message,
        });
      });
    setOpen(false);
  };
  return (
      <>
          <h1>Profile</h1>
          <Card>
            <Grid container direction="column" alignItems="stretch">
                <TextField label="Name" value={profileDetails.name}
                  onChange={(event) => handleInput("name", event.target.value)}
                  variant="outlined" fullWidth />
                <TextField label="Institution Name"
                  value={profileDetails.education?.institutionName || ""}
                  onChange={(event) =>
                    handleInput("education", { ...profileDetails.education, institutionName: event.target.value })
                  }
                  variant="outlined" fullWidth/>
                <TextField label="Start Year" value={profileDetails.education?.startYear || ""}
                  onChange={(event) =>
                    handleInput("education", { ...profileDetails.education, startYear: event.target.value })
                  }
                  variant="outlined" type="number" fullWidth/>
                <TextField label="End Year" value={profileDetails.education?.endYear || ""}
                  onChange={(event) =>
                    handleInput("education", { ...profileDetails.education, endYear: event.target.value })
                  }
                  variant="outlined" type="number" fullWidth />
                  <FileUploadInput label="Resume (.pdf)" icon={<DescriptionIcon />} uploadTo={apiList.uploadResume} handleInput={handleInput}
                  identifier={"resume"}/>
            </Grid>
            <Button color="primary" style={{ padding: "10px 50px", marginTop: "30px" }} onClick={() => handleUpdate()} >
              Update Details </Button>
          </Card>
      </>
  );
};
export default Profile;