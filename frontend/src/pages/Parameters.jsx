import { useState, useEffect } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
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
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Box,
  Alert,
  Chip,
  Skeleton,
  Tooltip,
  Fab,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const MotionBox = motion.create(Box);

function Parameters() {
  // Models
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");

  // Parameters
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedParamId, setSelectedParamId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [parameterCode, setParameterCode] = useState("");
  const [parameterName, setParameterName] = useState("");
  const [parameterType, setParameterType] = useState("");
  const [unit, setUnit] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [expectedText, setExpectedText] = useState("");
  const [isMandatory, setIsMandatory] = useState(true);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteParamId, setDeleteParamId] = useState(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("param_name");

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load models on mount, auto-select first
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await api.get("/models");
      setModels(res.data);
      if (res.data.length > 0) {
        setSelectedModel(res.data[0].model_id);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  // Load parameters when model changes
  useEffect(() => {
    if (!selectedModel) {
      setParameters([]);
      return;
    }
    fetchParameters();
  }, [selectedModel]);

  const fetchParameters = async () => {
    setLoading(true);
    try {
      const res = await api.get("/parameters", {
        params: { model_id: selectedModel },
      });
      setParameters(res.data);
    } catch (error) {
      console.error(error);
      setParameters([]);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        if (selectedModel) {
          resetForm();
          setOpen(true);
        }
      }
      if (e.key === "Escape") {
        setOpen(false);
        setDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedModel]);

  const handleSort = (column) => {
    const isAsc = orderBy === column && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(column);
  };

  const sortComparator = (a, b) => {
    const valA = (a[orderBy] || "").toString().toLowerCase();
    const valB = (b[orderBy] || "").toString().toLowerCase();
    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  };

  const resetForm = () => {
    setParameterCode("");
    setParameterName("");
    setParameterType("");
    setUnit("");
    setMinValue("");
    setMaxValue("");
    setExpectedText("");
    setIsMandatory(true);
    setEditMode(false);
    setSelectedParamId(null);
  };

  const saveParameter = async () => {
    if (!parameterCode || !parameterName || !parameterType) {
      setSnackbar({
        open: true,
        message: "Parameter Code, Name, and Type are required.",
        severity: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        model_id: Number(selectedModel),
        param_code: parameterCode,
        param_name: parameterName,
        data_type: parameterType.toLowerCase(),
        unit: unit || null,
        min_value: minValue ? Number(minValue) : null,
        max_value: maxValue ? Number(maxValue) : null,
        expected_text: expectedText || null,
        is_mandatory: isMandatory,
      };

      if (editMode) {
        await api.put(`/parameters/${selectedParamId}`, payload);
        setSnackbar({
          open: true,
          message: "Parameter updated successfully!",
          severity: "success",
        });
      } else {
        await api.post("/parameters/", payload);
        setSnackbar({
          open: true,
          message: "Parameter added successfully!",
          severity: "success",
        });
      }

      resetForm();
      setOpen(false);
      fetchParameters();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: editMode
          ? "Failed to update parameter."
          : "Failed to add parameter.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const editParameter = (param) => {
    setEditMode(true);
    setSelectedParamId(param.parameter_id);
    setParameterCode(param.param_code);
    setParameterName(param.param_name);
    setParameterType(param.data_type);
    setUnit(param.unit || "");
    setMinValue(param.min_value || "");
    setMaxValue(param.max_value || "");
    setExpectedText(param.expected_text || "");
    setIsMandatory(param.is_mandatory);
    setOpen(true);
  };

  const copyParameter = (param) => {
    setEditMode(false);
    setSelectedParamId(null);
    setParameterCode(param.param_code + "_copy");
    setParameterName(param.param_name + " (Copy)");
    setParameterType(param.data_type);
    setUnit(param.unit || "");
    setMinValue(param.min_value || "");
    setMaxValue(param.max_value || "");
    setExpectedText(param.expected_text || "");
    setIsMandatory(param.is_mandatory);
    setOpen(true);
  };

  const openDeleteDialog = (id) => {
    setDeleteParamId(id);
    setDeleteOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setDeleteParamId(null);
  };

  const deleteParameter = async () => {
    try {
      await api.delete(`/parameters/${deleteParamId}`);
      setSnackbar({
        open: true,
        message: "Parameter deleted successfully!",
        severity: "success",
      });
      setDeleteOpen(false);
      setDeleteParamId(null);
      fetchParameters();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: "Failed to delete parameter.",
        severity: "error",
      });
      setDeleteOpen(false);
    }
  };

  const filteredParameters = parameters
    .filter(
      (p) =>
        p.param_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.param_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.data_type?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort(sortComparator);

  const typeColor = (type) => {
    if (!type) return "default";
    const t = type.toLowerCase();
    if (t === "numeric") return "primary";
    if (t === "text") return "secondary";
    if (t === "boolean") return "success";
    return "default";
  };

  const headerStyle = {
    fontWeight: "bold",
    backgroundColor: "#1976d2",
    color: "white",
    whiteSpace: "nowrap",
  };

  const sortLabelStyle = {
    color: "white !important",
    "&.Mui-active": { color: "white !important" },
    "& .MuiTableSortLabel-icon": { color: "white !important" },
  };

  return (
    <>
      <PageHeader title="Parameters" onRefresh={selectedModel ? fetchParameters : undefined} />

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
            onChange={(e) => {
              setSelectedModel(e.target.value);
              setPage(0);
              setSearchTerm("");
            }}
          >
            {models.map((model) => (
              <MenuItem key={model.model_id} value={model.model_id}>
                {model.model_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedModel && (
          <TextField
            label="Search by Name or Code"
            size="small"
            sx={{ width: 250 }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        )}

        {selectedModel && (
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="contained"
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
            >
              Add Parameter
            </Button>
          </Box>
        )}
      </Box>

      {/* Content */}
      {!selectedModel ? (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{ textAlign: "center", p: 5 }}
        >
          <Typography variant="h6">Select a Model</Typography>
          <Typography color="text.secondary">
            Choose a model from the dropdown to manage its parameters.
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
      ) : filteredParameters.length === 0 ? (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{ textAlign: "center", p: 5 }}
        >
          <Typography variant="h6">No Data Available</Typography>
          <Typography color="text.secondary">
            Add a new parameter to get started.
          </Typography>
        </MotionBox>
      ) : (
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "param_code"}
                      direction={orderBy === "param_code" ? order : "asc"}
                      onClick={() => handleSort("param_code")}
                      sx={sortLabelStyle}
                    >
                      CODE
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "param_name"}
                      direction={orderBy === "param_name" ? order : "asc"}
                      onClick={() => handleSort("param_name")}
                      sx={sortLabelStyle}
                    >
                      NAME
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>
                    <TableSortLabel
                      active={orderBy === "data_type"}
                      direction={orderBy === "data_type" ? order : "asc"}
                      onClick={() => handleSort("data_type")}
                      sx={sortLabelStyle}
                    >
                      TYPE
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={headerStyle}>UNIT</TableCell>
                  <TableCell sx={headerStyle}>MIN</TableCell>
                  <TableCell sx={headerStyle}>MAX</TableCell>
                  <TableCell sx={headerStyle}>EXPECTED</TableCell>
                  <TableCell sx={headerStyle}>MANDATORY</TableCell>
                  <TableCell sx={headerStyle}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <AnimatePresence>
                  {filteredParameters
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((param) => (
                      <TableRow
                        key={param.parameter_id}
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
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontWeight: 500 }}
                          >
                            {param.param_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {param.param_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={param.data_type}
                            color={typeColor(param.data_type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{param.unit || "—"}</TableCell>
                        <TableCell>{param.min_value ?? "—"}</TableCell>
                        <TableCell>{param.max_value ?? "—"}</TableCell>
                        <TableCell>{param.expected_text || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={param.is_mandatory ? "Yes" : "No"}
                            color={param.is_mandatory ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => editParameter(param)}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Copy">
                            <IconButton
                              color="info"
                              onClick={() => copyParameter(param)}
                              size="small"
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => openDeleteDialog(param.parameter_id)}
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
            count={filteredParameters.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Floating Action Button */}
      {selectedModel && (
        <Tooltip title="Add Parameter (Ctrl+N)">
          <Fab
            color="primary"
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            sx={{ position: "fixed", bottom: 32, right: 32 }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Parameter" : "Add Parameter"}
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Parameter Code *"
            fullWidth
            margin="normal"
            value={parameterCode}
            onChange={(e) => setParameterCode(e.target.value)}
            placeholder="e.g. no_load_24v, battery_voltage"
            required
          />

          <TextField
            label="Parameter Name *"
            fullWidth
            margin="normal"
            value={parameterName}
            onChange={(e) => setParameterName(e.target.value)}
            placeholder="e.g. No Load 24V"
            required
          />

          <TextField
            select
            label="Type *"
            fullWidth
            margin="normal"
            value={parameterType}
            onChange={(e) => setParameterType(e.target.value)}
            required
          >
            <MenuItem value="numeric">Numeric</MenuItem>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="boolean">Boolean</MenuItem>
          </TextField>

          <TextField
            label="Unit"
            fullWidth
            margin="normal"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. V, A, °C (leave blank if N/A)"
          />

          <TextField
            label="Min Value"
            fullWidth
            margin="normal"
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            disabled={parameterType === "text" || parameterType === "boolean"}
          />

          <TextField
            label="Max Value"
            fullWidth
            margin="normal"
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            disabled={parameterType === "text" || parameterType === "boolean"}
          />

          <TextField
            label="Expected Text"
            fullWidth
            margin="normal"
            value={expectedText}
            onChange={(e) => setExpectedText(e.target.value)}
            disabled={parameterType !== "text"}
            placeholder="e.g. TESTED_OK"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                color="primary"
              />
            }
            label="Mandatory"
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={resetForm} color="secondary">
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={saveParameter}
            disabled={saving || !parameterCode || !parameterName || !parameterType}
          >
            {saving ? "Saving..." : editMode ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteCancel}>
        <DialogTitle color="error">Delete Parameter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this parameter?
            <br /><br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteParameter}>
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

export default Parameters;
