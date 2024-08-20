import { useContext, useEffect, useState } from "react";
import { Button, Grid } from "@material-ui/core";
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
      <div>
        <h2>Profile</h2>
          <Card>
            <Grid container direction="column" alignItems="stretch" spacing={3}>
                <textarea placeholder="Name" value={profileDetails.name}
                  onChange={(event) => handleInput("name", event.target.value)}>
                </textarea>
                <textarea placeholder="Bio (upto 250 words)" multiline rows={8} style={{ width: "300px" }} value={profileDetails.bio}
                  onChange={(event) => {
                    if (
                      event.target.value.split(" ").filter(function (n) {
                        return n != "";
                      }).length <= 250
                    ) { handleInput("bio", event.target.value);}
                  }}
                ></textarea>
                <PhoneInput country={"in"} value={phone} onChange={(phone) => setPhone(phone)} style={{ width: "auto" }} />
            </Grid>
            <Button color="primary" style={{ padding: "10px 50px", marginTop: "30px" }} onClick={() => handleUpdate()} >
              Update Details</Button>
          </Card>
      </div>
  );
};
export default Profile;
