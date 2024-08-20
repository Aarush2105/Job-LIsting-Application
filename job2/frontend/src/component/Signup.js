import { useState, useContext } from "react";
import { Grid, TextField, Button, MenuItem } from "@material-ui/core";
import axios from "axios";
import { Redirect, useHistory } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import Card from "./Card";
import PasswordInput from "../lib/PasswordInput";
import EmailInput from "../lib/EmailInput";
import { SetPopupContext } from "../App";

import apiList from "../lib/apiList";
import isAuth from "../lib/isAuth";

const Login = (props) => {
  const setPopup = useContext(SetPopupContext);
  const history = useHistory();
  const [loggedin, setLoggedin] = useState(isAuth());
  const [signupDetails, setSignupDetails] = useState({
    type: "applicant",
    email: "",
    password: "",
    name: "",
    institutionName: "",
    startYear: "",
    endYear: "",
    profile: "",
    bio: "",
    contactNumber: "",
  });
  const [phone, setPhone] = useState("");

  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: { untouched: true, required: true, error: false, message: "" },
    password: { untouched: true, required: true, error: false, message: "" },
    name: { untouched: true, required: true, error: false, message: "" },
  });
  const handleInput = (key, value) => {
    setSignupDetails({ ...signupDetails, [key]: value });
  };
  const handleInputError = (key, status, message) => {
    setInputErrorHandler({...inputErrorHandler,
      [key]: { required: true, untouched: false, error: status, message: message },
    });
  };
  const handleLogin = () => {
    const tmpErrorHandler = {};
    Object.keys(inputErrorHandler).forEach((obj) => {
      if (inputErrorHandler[obj].required && inputErrorHandler[obj].untouched) {
        tmpErrorHandler[obj] = {
          required: true,
          untouched: false,
          error: true,
          message: `${obj[0].toUpperCase() + obj.substr(1)} is required`,
        };
      } else {
        tmpErrorHandler[obj] = inputErrorHandler[obj];
      }
    });
    const updatedDetails = { ...signupDetails, institutionName: signupDetails.institutionName.trim(),
      startYear: signupDetails.startYear.trim(), endYear: signupDetails.endYear.trim() };
    const verified = !Object.keys(tmpErrorHandler).some((obj) => {
      return tmpErrorHandler[obj].error;
    });
    if (verified) {
      axios.post(apiList.signup, updatedDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({ open: true, severity: "success", message: "Logged in successfully" });
          history.push("/home");
        }).catch((err) => {
          setPopup({ open: true, severity: "error", message: err.response.data.message });
        });
    } else {
      setInputErrorHandler(tmpErrorHandler);
      setPopup({ open: true, severity: "error", message: "Incorrect Input" });
    }
  };
  const handleLoginRecruiter = () => {
    const tmpErrorHandler = {};
    Object.keys(inputErrorHandler).forEach((obj) => {
      if (inputErrorHandler[obj].required && inputErrorHandler[obj].untouched) {
        tmpErrorHandler[obj] = {
          required: true,
          untouched: false,
          error: true,
          message: `${obj[0].toUpperCase() + obj.substr(1)} is required`,
        };
      } else {
        tmpErrorHandler[obj] = inputErrorHandler[obj];
      }
    });
    let updatedDetails = { ...signupDetails };
    if (phone !== "") {
      updatedDetails = { ...signupDetails, contactNumber: `+${phone}` };
    } else {
      updatedDetails = { ...signupDetails, contactNumber: "" };
    }
    setSignupDetails(updatedDetails);

    const verified = !Object.keys(tmpErrorHandler).some((obj) => {
      return tmpErrorHandler[obj].error;
    });
    if (verified) {
      axios.post(apiList.signup, updatedDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({ open: true, severity: "success", message: "Logged in successfully" });
        }).catch((err) => {
          setPopup({ open: true, severity: "error", message: err.response.data.message });
        });
    } else {
      setInputErrorHandler(tmpErrorHandler);
      setPopup({ open: true, severity: "error", message: "Incorrect Input" });
    }
  };
  return loggedin ? ( <Redirect to="/home" /> ) : (
    <Card>
      <Grid container direction="column" spacing={4} alignItems="center">
        <h1>Signup</h1>
          <TextField select label="Category" variant="outlined" style={{width: "400px"}} value={signupDetails.type}
            onChange={(event) => handleInput("type", event.target.value)} >
            <MenuItem value="applicant"> Applicant </MenuItem>
            <MenuItem value="recruiter"> Recruiter </MenuItem>
          </TextField>
          <TextField label="Name" value={signupDetails.name} style={{width: "400px"}}
            onChange={(event) => handleInput("name", event.target.value)}
            error={inputErrorHandler.name.error} helperText={inputErrorHandler.name.message}
            onBlur={(event) => {
              if (event.target.value === "") {
                handleInputError("name", true, "Name is required");
              } else {
                handleInputError("name", false, "");
              }
            }}
            variant="outlined"/>
          <EmailInput label="Email" value={signupDetails.email}
            onChange={(event) => handleInput("email", event.target.value)}
            inputErrorHandler={inputErrorHandler} handleInputError={handleInputError}
            required={true}/>
          <PasswordInput label="Password" style={{width: "400px"}} value={signupDetails.password}
            onChange={(event) => handleInput("password", event.target.value)}
            error={inputErrorHandler.password.error}
            helperText={inputErrorHandler.password.message}
            onBlur={(event) => {
              if (event.target.value === "") {
                handleInputError("password", true, "Password is required");
              } else {
                handleInputError("password", false, "");
              }
            }}/>
        {signupDetails.type === "applicant" ? (
          <>
              <TextField label="Institution Name" value={signupDetails.institutionName} style={{width: "400px"}}
                onChange={(event) => handleInput("institutionName", event.target.value) }
                variant="outlined" />
              <TextField label="Start Year" value={signupDetails.startYear} style={{width: "400px"}}
                onChange={(event) => handleInput("startYear", event.target.value) }
                variant="outlined" type="number" />
              <TextField label="End Year" value={signupDetails.endYear} style={{width: "400px"}}
                onChange={(event) => handleInput("endYear", event.target.value)}
                variant="outlined" type="number" />
          </>
        ) : (
          <>
              <TextField label="Bio (upto 250 words)" multiline rows={8} variant="outlined" style={{width: "400px"}} value={signupDetails.bio}
                onChange={(event) => handleInput("bio", event.target.value)}/>
              <PhoneInput country={"in"} value={phone} onChange={(phone) => setPhone(phone)}
                inputProps={{ name: "phone", required: true}}/>
          </>
        )}
          <Button variant="contained" color="primary" style={{width: "400px"}}
            onClick={signupDetails.type === "applicant" ? handleLogin : handleLoginRecruiter}>
            Signup </Button>
      </Grid>
    </Card>
  );
};
export default Login;
