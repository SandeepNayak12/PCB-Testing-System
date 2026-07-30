import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Models from "./pages/Models";
import Parameters from "./pages/Parameters";
import Results from "./pages/Results";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <div
          style={{
            minHeight: "100vh",
          }}
        >
          <Header darkMode={darkMode} setDarkMode={setDarkMode} />
          <Sidebar />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              marginLeft: "240px",
              marginTop: "64px",
            }}
          >
            <Routes>
              <Route path="/" element={<Models />} />
              <Route path="/models" element={<Models />} />
              <Route path="/parameters" element={<Parameters />} />
              <Route path="/results" element={<Results />} />
            </Routes>

            <Footer />
          </Box>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
