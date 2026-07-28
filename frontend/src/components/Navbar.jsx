import { AppBar, Toolbar, Typography } from "@mui/material";

function Navbar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6">
          PCB Testing Management System
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;