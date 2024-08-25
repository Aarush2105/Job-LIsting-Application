import { useContext, useEffect, useState } from "react";
import { Button, Grid, TextField } from "@material-ui/core";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

import { SetPopupContext } from "../../App";
import Card from '../Card';
import apiList from "../../lib/apiList";

const Profile = (props) => {
  const setPopup = useContext(SetPopupContext);
  const [profileDetails, setProfileDetails] = useState({
    name: "",
    bio: "",
    contactNumber: "",
  });

  const [phone, setPhone] = useState("");
  const handleInput = (key, value) => {
    setProfileDetails({
      ...profileDetails,
      [key]: value,
    });
  };
  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios.get(apiList.user, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }).then((response) => {
        setProfileDetails(response.data);
        setPhone(response.data.contactNumber);
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: "Error",
        });
      });
  };
  const handleUpdate = () => {
    let updatedDetails = { ...profileDetails };
    if (phone !== "") {
      updatedDetails = { ...profileDetails, contactNumber: `+${phone}` };
    } else {
      updatedDetails = { ...profileDetails, contactNumber: "" };
    }

    axios.put(apiList.user, updatedDetails, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
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
        console.log(err.response);
      });
  };
  return (
      <div style={{ width: "80%" }}>
        <h2 style={{textAlign:"center"}}>Profile</h2>
          <Card >
            <Grid container direction="column" alignItems="stretch" spacing={3} >
                <TextField label="Name" value={profileDetails.name} variant="outlined"
                  onChange={(event) => handleInput("name", event.target.value)}>
                </TextField>
                <TextField label="Bio (upto 250 words)" multiline rows={8} style={{ width: "100%" }} value={profileDetails.bio}
                  variant="outlined" onChange={(event) => {
                    if ( event.target.value.split(" ").filter(function (n) {
                        return n != "";
                      }).length <= 250
                    ) { handleInput("bio", event.target.value);}
                  }}
                ></TextField>
                <PhoneInput country={"in"} value={phone} onChange={(phone) => setPhone(phone)} style={{width: "100%" }} />
            </Grid>
            <Button color="primary" style={{ padding: "10px 50px", marginTop: "30px",textAlign:"center",width: "100%" }} onClick={() => handleUpdate()} >
              Update Details</Button>
          </Card>
      </div>
  );
};
export default Profile;
