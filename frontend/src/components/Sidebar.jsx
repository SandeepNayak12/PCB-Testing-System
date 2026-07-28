import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TuneIcon from "@mui/icons-material/Tune";

const drawerWidth = 240;

function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <List>
        <ListItemButton component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton component={Link} to="/models">
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Models" />
        </ListItemButton>

        <ListItemButton component={Link} to="/parameters">
          <ListItemIcon>
            <TuneIcon />
          </ListItemIcon>
          <ListItemText primary="Parameters" />
        </ListItemButton>

        <ListItemButton component={Link} to="/results">
          <ListItemIcon>
            <AssessmentIcon />
          </ListItemIcon>
          <ListItemText primary="Results" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}

export default Sidebar;
