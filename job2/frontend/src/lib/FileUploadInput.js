import { useState, useContext } from "react";
import { Grid, Button, TextField, LinearProgress } from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import Axios from "axios";
import { SetPopupContext } from "../App";

const FileUploadInput = (props) => {
  const setPopup = useContext(SetPopupContext);
  const { uploadTo, identifier, handleInput } = props;
  const [file, setFile] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const handleUpload = () => {
    const data = new FormData();
    data.append("file", file);
    Axios.post(uploadTo, data, { headers: { "Content-Type": "multipart/form-data" }})
    .then((response) => {
        handleInput(identifier, response.data.url);
        setPopup({
          open: true,
          severity: "success",
          message: response.data.message,
        });
      }).catch((err) => {
        setPopup({
          open: true,
          severity: "error",
          message: err.message,
        });
      });
  };
  return (
    <Grid container item xs={12} direction="column" style={props.style}>
      <Grid container item xs={12} spacing={0}>
        <Grid item xs={3}>
          <Button variant="contained" backgroundColor="blue" component="label"
            style={{ width: "100%", height: "100%" }}>
            {props.icon}
            <input type="file" style={{ display: "none" }}
              onChange={(event) => { setUploadPercentage(0);
                                     setFile(event.target.files[0]);}} />
          </Button>
        </Grid>
        <Grid item xs={6}>
          <TextField label={props.label} value={file ? file.name || "" : ""}
            InputProps={{ readOnly: true }} variant="outlined" style={{ width: "100%" }} />
        </Grid>
        <Grid item xs={3}>
          <Button variant="contained" color="secondary" style={{ width: "100%", height: "100%" }}
            onClick={() => handleUpload()} disabled={file ? false : true}>
            <CloudUpload />
          </Button>
        </Grid>
      </Grid>
      {uploadPercentage !== 0 ? (
        <Grid item xs={12} style={{ marginTop: "10px" }}>
          <LinearProgress variant="determinate" value={uploadPercentage} />
        </Grid>
      ) : null}
    </Grid>
  );
};

export default FileUploadInput;
