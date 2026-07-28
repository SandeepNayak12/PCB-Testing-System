import { Typography, Box } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        mt: 5,
        py: 2,
        textAlign: "center",
      }}
    >
      <Typography color="text.secondary">
        PCB Testing Management System &copy; 2026
      </Typography>
    </Box>
  );
}

export default Footer;
