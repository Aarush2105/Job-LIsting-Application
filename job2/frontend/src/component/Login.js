import { useContext, useState } from "react";
import {Button} from "@material-ui/core";
import axios from "axios";
import { Redirect,useHistory } from "react-router-dom";
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

  const [loginDetails, setLoginDetails] = useState({ email: "",password: "" });
  const [inputErrorHandler, setInputErrorHandler] = useState({
    email: { error: false, message: "" },password: { error: false, message: ""}
  });
  const handleInput = (key, value) => {
    setLoginDetails({ ...loginDetails, [key]: value});
  };
  const handleInputError = (key, status, message) => {
    setInputErrorHandler({ ...inputErrorHandler,
      [key]: { error: status, message: message } 
    });
  };
  const handleLogin = () => {
    const verified = !Object.keys(inputErrorHandler).some((obj) => {
      return inputErrorHandler[obj].error;
    });
    if (verified) {
      axios.post(apiList.login, loginDetails)
        .then((response) => {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("type", response.data.type);
          setLoggedin(isAuth());
          setPopup({ open: true, severity: "success", message: "Logged in successfully" });
          history.push("/home");
        })
        .catch((err) => {
          setPopup({ open: true, severity: "error", message: err.response.data.message });
        });
    } else {
      setPopup({ open: true, severity: "error", message: "Incorrect Input" });
    }
  };
  return loggedin ? (<Redirect to="/home" />) : 
  (<Card>
      <h1 style={{textAlign:"center"}}>Login</h1>
      <EmailInput label="Email" value={loginDetails.email}
        onChange={(event) => handleInput("email", event.target.value)}
        inputErrorHandler={inputErrorHandler} handleInputError={handleInputError} />
        <div>
          <PasswordInput label="Password" value={loginDetails.password} onChange={(event) => handleInput("password", event.target.value)} />
        </div>
        <Button color="primary" onClick={() => handleLogin()} style={{width: "400px"}} > Login </Button>
    </Card>
  );
};

export default Login;
