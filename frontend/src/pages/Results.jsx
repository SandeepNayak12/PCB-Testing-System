import { useEffect, useState } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Stack,
  TextField,
  Box,
  Skeleton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

const MotionBox = motion.create(Box);

function Results() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete single unit
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  // Delete all results for model
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch models on mount
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await api.get("/models");
      setModels(res.data);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const fetchResults = async (modelCode) => {
    setLoading(true);
    try {
      const res = await api.get("/results", {
        params: { model_code: modelCode },
      });
      setColumns(res.data.columns || []);
      setRows(res.data.rows || []);
    } catch (error) {
      console.error("Error fetching results:", error);
      setColumns([]);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setSelectedModel(value);
    setSearch("");
    setStatusFilter("All");
    setPage(0);
    if (value) {
      fetchResults(value);
    } else {
      setColumns([]);
      setRows([]);
    }
  };

  // Delete handlers
  const handleDeleteClick = (unitId) => {
    setSelectedUnitId(unitId);
    setDeleteOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setSelectedUnitId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/results/unit/${selectedUnitId}`);
      setRows((prev) => prev.filter((row) => row.unit_id !== selectedUnitId));
      setSnackbar({
        open: true,
        message: "Test result deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to delete test result.",
        severity: "error",
      });
    }
    setDeleteOpen(false);
    setSelectedUnitId(null);
  };

  // Delete All Results for selected model
  const handleDeleteAllClick = () => {
    setDeleteAllOpen(true);
  };

  const handleDeleteAllCancel = () => {
    setDeleteAllOpen(false);
  };

  const handleDeleteAllConfirm = async () => {
    try {
      const model = models.find((m) => m.model_code === selectedModel);
      await api.delete(`/results/model/${model.model_id}`);
      fetchResults(selectedModel); // Refresh results after deletion
      setSnackbar({
        open: true,
        message: "All results deleted successfully.",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to delete results.",
        severity: "error",
      });
    }
    setDeleteAllOpen(false);
  };

  // Filter rows by barcode search and result chip
  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !search || row.barcode?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || row.result === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Export Excel — uses all dynamic columns
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "test_results.xlsx");
  };

  // Export PDF — uses all dynamic columns
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("PCB Test Results", 14, 15);

    autoTable(doc, {
      head: [columns.map((col) => col.replaceAll("_", " ").toUpperCase())],
      body: filteredRows.map((row) => columns.map((col) => row[col] ?? "")),
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
    });

    doc.save("test_results.pdf");
  };

  const headerStyle = {
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "white",
    whiteSpace: "nowrap",
  };

  return (
    <>
      <PageHeader
        title="Results"
        onRefresh={selectedModel ? () => fetchResults(selectedModel) : undefined}
      />

      {/* Model Dropdown + Search Row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Select Model</InputLabel>
          <Select
            value={selectedModel}
            label="Select Model"
            onChange={handleModelChange}
          >
            <MenuItem value="">— Select —</MenuItem>
            {models.map((model) => (
              <MenuItem key={model.model_code} value={model.model_code}>
                {model.model_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedModel && (
          <TextField
            label="Search Barcode"
            size="small"
            sx={{ width: 250 }}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        )}

        {selectedModel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAllClick}
          >
            Delete All Results
          </Button>
        )}

        {selectedModel && filteredRows.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={exportExcel}
              size="small"
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<PictureAsPdfIcon />}
              onClick={exportPDF}
              size="small"
              color="error"
            >
              Export PDF
            </Button>
          </Box>
        )}
      </Box>

      {/* Filter Chips */}
      {selectedModel && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label="All"
            clickable
            variant={statusFilter === "All" ? "filled" : "outlined"}
            color="primary"
            onClick={() => {
              setStatusFilter("All");
              setPage(0);
            }}
          />
          <Chip
            label="PASS"
            clickable
            variant={statusFilter === "PASS" ? "filled" : "outlined"}
            color="success"
            onClick={() => {
              setStatusFilter("PASS");
              setPage(0);
            }}
          />
          <Chip
            label="FAIL"
            clickable
            variant={statusFilter === "FAIL" ? "filled" : "outlined"}
            color="error"
            onClick={() => {
              setStatusFilter("FAIL");
              setPage(0);
            }}
          />
        </Stack>
      )}

      {/* Content */}
      {!selectedModel ? (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{ textAlign: "center", p: 5 }}
        >
          <Typography variant="h6">Select a Model</Typography>
          <Typography color="text.secondary">
            Choose a model from the dropdown to view test results.
          </Typography>
        </MotionBox>
      ) : loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} />
        </Box>
      ) : filteredRows.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{ textAlign: "center", p: 5 }}
        >
          <Typography variant="h6">No Data Available</Typography>
          <Typography color="text.secondary">
            No test results match your filters.
          </Typography>
        </MotionBox>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              {/* Dynamic Header */}
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} sx={headerStyle}>
                      {col.replaceAll("_", " ").toUpperCase()}
                    </TableCell>
                  ))}
                  <TableCell sx={headerStyle}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>

              {/* Dynamic Body */}
              <TableBody>
                <AnimatePresence>
                  {filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, idx) => (
                      <TableRow
                        key={row.barcode || idx}
                        hover
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        sx={{
                          backgroundColor:
                            row.result === "PASS"
                              ? "rgba(46, 125, 50, 0.05)"
                              : row.result === "FAIL"
                                ? "rgba(211, 47, 47, 0.05)"
                                : "transparent",
                          "&:hover": {
                            backgroundColor:
                              row.result === "PASS"
                                ? "rgba(46, 125, 50, 0.12)"
                                : row.result === "FAIL"
                                  ? "rgba(211, 47, 47, 0.12)"
                                  : "action.hover",
                          },
                        }}
                      >
                        {columns.map((col) => (
                          <TableCell key={col}>
                            {col === "result" ? (
                              <Chip
                                label={row[col]}
                                color={row[col] === "PASS" ? "success" : "error"}
                                size="small"
                              />
                            ) : col === "barcode" ? (
                              <Typography fontWeight={500}>
                                {row[col]}
                              </Typography>
                            ) : (
                              row[col] ?? "—"
                            )}
                          </TableCell>
                        ))}
                        {/* Actions Column */}
                        <TableCell>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteClick(row.unit_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle color="error">Delete Test Result</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this test result?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Results Dialog */}
      <Dialog open={deleteAllOpen} onClose={handleDeleteAllCancel}>
        <DialogTitle color="error">Delete All Results</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete all uploaded results?
            <br /><br />
            <strong>
              Model: {models.find((m) => m.model_code === selectedModel)?.model_name || selectedModel}
            </strong>
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteAllCancel}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteAllConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Results;
