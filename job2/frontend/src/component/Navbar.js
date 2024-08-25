import { AppBar, Toolbar, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import isAuth, { userType } from "../lib/isAuth";

const Navbar = (props) => {
  let history = useHistory();
  const handleClick = (location) => { history.push(location) };
  return (
    <AppBar position="fixed">
      <Toolbar style={{background:"blue"}}>
        <h3 style={{flexGrow:1}}><b><i>Career Gate</i></b></h3>
        {isAuth() ? ( userType() === "recruiter" ? (
            <>
              <Button color="inherit" onClick={() => handleClick("/home")}>
                <b>Home</b> </Button>
              <Button color="inherit" onClick={() => handleClick("/addjob")}>
              <b>Add Jobs</b> </Button>
              <Button color="inherit" onClick={() => handleClick("/myjobs")}>
              <b>My Jobs </b></Button>
              <Button color="inherit" onClick={() => handleClick("/employees")}>
              <b>Employees</b> </Button>
              <Button color="inherit" onClick={() => handleClick("/profile")}>
              <b>Profile</b> </Button>
              <Button color="inherit" onClick={() => handleClick("/logout")}>
              <b>Logout</b> </Button>
            </>) : (
            <>
              <Button color="inherit" onClick={() => handleClick("/home")}>
                Home </Button>
              <Button color="inherit" onClick={() => handleClick("/applications")}>
                Application </Button>
              <Button color="inherit" onClick={() => handleClick("/profile")}>
                Profile </Button>
              <Button color="inherit" onClick={() => handleClick("/logout")}>
                Logout </Button>
            </>)) : (
          <>
            <Button color="inherit" onClick={() => handleClick("/login")}>
              Login </Button>
            <Button color="inherit" onClick={() => handleClick("/signup")}>
              Signup </Button>
          </>)}
      </Toolbar>
    </AppBar>
  );
};
export default Navbar;
