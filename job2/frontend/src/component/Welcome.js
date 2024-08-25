import { Grid, Typography } from "@material-ui/core";
export const ErrorPage = (props) => {
  return (
    <Grid container item direction="column" alignItems="center"
      justify="center" style={{ padding: "30px", minHeight: "93vh" }}>
      <Grid item>
        <Typography variant="h2">Welcome user</Typography>
      </Grid>
    </Grid>
  );
};
