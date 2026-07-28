import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  Typography,
  Button,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Box,
  Alert,
  Skeleton,
  Tooltip,
  Fab,
} from "@mui/material";

const MotionBox = motion.create(Box);

function Models() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelCode, setModelCode] = useState("");
  const [modelName, setModelName] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(null);
  const [barcodePrefix, setBarcodePrefix] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteModelId, setDeleteModelId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("model_code");

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await api.get("/models/");
      setModels(response.data);
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        openAddDialog();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        document.querySelector('[label="Search Models"]')?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        setDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const sortComparator = (a, b) => {
    const valA = (a[orderBy] || "").toLowerCase();
    const valB = (b[orderBy] || "").toLowerCase();
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  };

  const openAddDialog = () => {
    setEditMode(false);
    setSelectedModelId(null);
    setModelCode("");
    setModelName("");
    setBarcodePrefix("");
    setDuplicateError("");
    setOpen(true);
  };

  // Duplicate validation
  const handleModelCodeChange = (value) => {
    setModelCode(value);
    if (!editMode) {
      const exists = models.some(
        (m) => m.model_code?.toLowerCase() === value.toLowerCase()
      );
      setDuplicateError(exists ? "Model already exists" : "");
    }
  };

  const saveModel = async () => {
    if (!modelCode || !modelName || !barcodePrefix) {
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "warning",
      });
      return;
    }

    if (duplicateError) {
      setSnackbar({
        open: true,
        message: "Model code already exists!",
        severity: "error",
      });
      return;
    }

    setSaving(true);
    try {
      if (editMode) {
        await api.put(`/models/${selectedModelId}`, {
          model_code: modelCode,
          model_name: modelName,
          barcode_prefix: barcodePrefix,
        });
        setSnackbar({
          open: true,
          message: "Model updated successfully!",
          severity: "success",
        });
      } else {
        await api.post("/models/", {
          model_code: modelCode,
          model_name: modelName,
          barcode_prefix: barcodePrefix,
        });
        setSnackbar({
          open: true,
          message: "Model added successfully!",
          severity: "success",
        });
      }

      setModelCode("");
      setModelName("");
      setBarcodePrefix("");
      setOpen(false);
      setEditMode(false);
      setSelectedModelId(null);
      fetchModels();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: editMode ? "Failed to update model." : "Failed to add model.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteModel = async () => {
    try {
      await api.delete(`/models/${deleteModelId}`);
      setSnackbar({
        open: true,
        message: "Model deleted successfully!",
        severity: "success",
      });
      setDeleteOpen(false);
      setDeleteModelId(null);
      fetchModels();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to delete model.",
        severity: "error",
      });
      setDeleteOpen(false);
    }
  };

  const editModel = (model) => {
    setEditMode(true);
    setSelectedModelId(model.model_id);
    setModelCode(model.model_code);
    setModelName(model.model_name);
    setBarcodePrefix(model.barcode_prefix);
    setDuplicateError("");
    setOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeleteModelId(id);
    setDeleteOpen(true);
  };

  const clearForm = () => {
    setModelCode("");
    setModelName("");
    setBarcodePrefix("");
    setDuplicateError("");
  };

  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text?.split(regex);
    return parts?.map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: "#fff176", fontWeight: "bold" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredModels = models
    .filter(
      (model) =>
        model.model_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.barcode_prefix?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortComparator);

  const headerStyle = {
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "white",
  };

  const sortLabelStyle = {
    color: "white !important",
    "&.Mui-active": { color: "white !important" },
    "& .MuiTableSortLabel-icon": { color: "white !important" },
  };

  return (
    <>
      <PageHeader title="Models" onRefresh={fetchModels} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          label="Search Models"
          variant="outlined"
          size="small"
          sx={{ width: 300 }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
        />
        <Button variant="contained" onClick={openAddDialog}>
          Add Model
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={50} />
        </Box>
      ) : filteredModels.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{ textAlign: "center", p: 5 }}
        >
          <Typography variant="h6">No Data Available</Typography>
          <Typography color="text.secondary">
            Add a new record to get started.
          </Typography>
        </MotionBox>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "model_code"}
                      direction={orderBy === "model_code" ? order : "asc"}
                      onClick={() => handleSort("model_code")}
                      sx={sortLabelStyle}
                    >
                      Model Code
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "model_name"}
                      direction={orderBy === "model_name" ? order : "asc"}
                      onClick={() => handleSort("model_name")}
                      sx={sortLabelStyle}
                    >
                      Model Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "barcode_prefix"}
                      direction={orderBy === "barcode_prefix" ? order : "asc"}
                      onClick={() => handleSort("barcode_prefix")}
                      sx={sortLabelStyle}
                    >
                      Barcode Prefix
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <AnimatePresence>
                  {filteredModels
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((model) => (
                      <TableRow
                        key={model.model_id}
                        hover
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        sx={{
                          "&:nth-of-type(even)": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight={500}>
                            {highlightMatch(model.model_code)}
                          </Typography>
                        </TableCell>
                        <TableCell>{highlightMatch(model.model_name)}</TableCell>
                        <TableCell>{highlightMatch(model.barcode_prefix)}</TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => editModel(model)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => openDeleteDialog(model.model_id)}
                              size="small"
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
            count={filteredModels.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 20]}
          />
        </Paper>
      )}

      {/* Floating Action Button */}
      <Tooltip title="Add Model (Ctrl+N)">
        <Fab
          color="primary"
          onClick={openAddDialog}
          sx={{ position: "fixed", bottom: 32, right: 32 }}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? "Edit PCB Model" : "Add PCB Model"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Model Code *"
            fullWidth
            margin="normal"
            value={modelCode}
            onChange={(e) => handleModelCodeChange(e.target.value)}
            error={!!duplicateError}
            helperText={duplicateError}
          />
          <TextField
            label="Model Name *"
            fullWidth
            margin="normal"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
          <TextField
            label="Barcode Prefix *"
            fullWidth
            margin="normal"
            value={barcodePrefix}
            onChange={(e) => setBarcodePrefix(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={clearForm} color="secondary">
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={saveModel}
            disabled={saving || !modelCode || !modelName || !barcodePrefix || !!duplicateError}
          >
            {saving ? "Saving..." : editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle color="error">Delete Model</DialogTitle>
        <DialogContent>
          <Typography>
            This action cannot be undone.
          </Typography>
          <br />
          <Typography>
            Are you sure you want to delete this model?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteModel}>
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

export default Models;
