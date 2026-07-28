import { useEffect, useState } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { motion } from "framer-motion";
import InventoryIcon from "@mui/icons-material/Inventory";
import TuneIcon from "@mui/icons-material/Tune";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MotionCard = motion.create(Card);

function Dashboard() {
  const [stats, setStats] = useState({
    total_models: 0,
    total_parameters: 0,
    tests_today: 0,
    pass_count: 0,
    fail_count: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard");
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Models",
      value: stats.total_models,
      icon: <InventoryIcon sx={{ fontSize: 36 }} />,
      borderColor: "#1976d2",
      iconBg: "#1976d2",
    },
    {
      title: "Parameters",
      value: stats.total_parameters,
      icon: <TuneIcon sx={{ fontSize: 36 }} />,
      borderColor: "#ed6c02",
      iconBg: "#ed6c02",
    },
    {
      title: "Tests Today",
      value: stats.tests_today,
      icon: <FactCheckIcon sx={{ fontSize: 36 }} />,
      borderColor: "#7b1fa2",
      iconBg: "#7b1fa2",
    },
    {
      title: "PASS",
      value: stats.pass_count,
      icon: <CheckCircleIcon sx={{ fontSize: 36 }} />,
      borderColor: "#2e7d32",
      iconBg: "#2e7d32",
    },
    {
      title: "FAIL",
      value: stats.fail_count,
      icon: <CancelIcon sx={{ fontSize: 36 }} />,
      borderColor: "#d32f2f",
      iconBg: "#d32f2f",
    },
  ];

  // Chart data
  const pieData = [
    { name: "PASS", value: stats.pass_count },
    { name: "FAIL", value: stats.fail_count },
  ];
  const PIE_COLORS = ["#2e7d32", "#d32f2f"];

  const barData = [
    { name: "Models", count: stats.total_models },
    { name: "Parameters", count: stats.total_parameters },
    { name: "Tests Today", count: stats.tests_today },
    { name: "PASS", count: stats.pass_count },
    { name: "FAIL", count: stats.fail_count },
  ];

  const recentActivity = [
    { text: "Model A325 Added", icon: <InventoryIcon color="primary" /> },
    { text: "JSON Uploaded", icon: <UploadFileIcon color="secondary" /> },
    { text: "Parameter Updated", icon: <TuneIcon sx={{ color: "#ed6c02" }} /> },
    { text: "Test Completed", icon: <CheckCircleIcon color="success" /> },
  ];

  return (
    <>
      <PageHeader title="Dashboard" onRefresh={fetchDashboard} />

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, mt: -2 }}>
        Welcome to PCB Testing Management System
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.title}>
            {loading ? (
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
            ) : (
              <MotionCard
                elevation={3}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{
                  borderRadius: 3,
                  borderLeft: `6px solid ${item.borderColor}`,
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" fontWeight="bold">
                        {item.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: item.iconBg,
                        borderRadius: 2,
                        p: 1.2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Box>
                </CardContent>
              </MotionCard>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* PASS vs FAIL Pie Chart */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              PASS vs FAIL
            </Typography>
            {loading ? (
              <Skeleton variant="circular" width={200} height={200} sx={{ mx: "auto" }} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Overview Bar Chart */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Overview
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row: Recent Activity + System Status */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <List dense>
              {recentActivity.map((activity, idx) => (
                <Box key={idx}>
                  <ListItem>
                    <ListItemIcon>{activity.icon}</ListItemIcon>
                    <ListItemText
                      primary={activity.text}
                      secondary="Just now"
                    />
                  </ListItem>
                  {idx < recentActivity.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Status
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Database" secondary="Connected" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="API Server" secondary="Running" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="Last Upload" secondary="Today" />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <FactCheckIcon sx={{ color: "#7b1fa2" }} />
                </ListItemIcon>
                <ListItemText primary="Avg Test Time" secondary="~2.5s" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

export default Dashboard;
