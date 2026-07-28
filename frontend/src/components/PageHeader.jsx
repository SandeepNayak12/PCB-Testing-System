import { Typography, IconButton, Box, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

function PageHeader({ title, onRefresh }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
      }}
    >
      <Typography variant="h4" fontWeight="bold">
        {title}
      </Typography>

      {onRefresh && (
        <Tooltip title="Refresh">
          <IconButton color="primary" onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

export default PageHeader;
