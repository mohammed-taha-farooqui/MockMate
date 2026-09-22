import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { InterviewProvider } from "./context/InterviewContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Setup from "./pages/Setup";
import MatchResult from "./pages/MatchResult";
import InterviewLobby from "./pages/InterviewLobby";
import Interview from "./pages/Interview";
import Feedback from "./pages/Feedback";
import FinalReport from "./pages/FinalReport";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InterviewProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
            <Navbar />
            <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected candidate interview routes */}
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute>
                      <Setup />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/match-result"
                  element={
                    <ProtectedRoute>
                      <MatchResult />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview-lobby"
                  element={
                    <ProtectedRoute>
                      <InterviewLobby />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <Interview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feedback"
                  element={
                    <ProtectedRoute>
                      <Feedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/final-report"
                  element={
                    <ProtectedRoute>
                      <FinalReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProtectedRoute>
                      <Progress />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
