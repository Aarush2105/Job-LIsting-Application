import { AppBar, Toolbar, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import isAuth, { userType } from "../lib/isAuth";

const Navbar = (props) => {
  let history = useHistory();
  const handleClick = (location) => { history.push(location) };
  return (
    <AppBar position="fixed">
      <Toolbar style={{background:"blue"}}>
        <h4 style={{flexGrow:1}}> Job Portal </h4>
        {isAuth() ? ( userType() === "recruiter" ? (
            <>
              <Button color="inherit" onClick={() => handleClick("/home")}>
                Home </Button>
              <Button color="inherit" onClick={() => handleClick("/addjob")}>
                Add Jobs </Button>
              <Button color="inherit" onClick={() => handleClick("/myjobs")}>
                My Jobs </Button>
              <Button color="inherit" onClick={() => handleClick("/employees")}>
                Employees </Button>
              <Button color="inherit" onClick={() => handleClick("/profile")}>
                Profile </Button>
              <Button color="inherit" onClick={() => handleClick("/logout")}>
                Logout </Button>
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
