import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

function Header({ darkMode, setDarkMode }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }} noWrap>
          PCB Testing Management System
        </Typography>

        <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
