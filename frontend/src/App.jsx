import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import RoleSelect from "./components/RoleSelect";
import ApplyForm from "./components/ApplyForm";
import OfficerDashboard from "./components/OfficerDashboard";
import OfficerView from "./components/OfficerView";
import OfficerHistory from "./components/OfficerHistory";
import AdminOverview from "./components/AdminOverview";

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <AnimatedPage>
              <RoleSelect />
            </AnimatedPage>
          }
        />
        <Route
          path="/user"
          element={
            <AnimatedPage>
              <ApplyForm />
            </AnimatedPage>
          }
        />
        <Route
          path="/officer"
          element={
            <AnimatedPage>
              <OfficerDashboard />
            </AnimatedPage>
          }
        />
        <Route
          path="/officer/history"
          element={
            <AnimatedPage>
              <OfficerHistory />
            </AnimatedPage>
          }
        />
        <Route
          path="/officer/view/:id"
          element={
            <AnimatedPage>
              <OfficerView />
            </AnimatedPage>
          }
        />
        <Route
          path="/admin"
          element={
            <AnimatedPage>
              <AdminOverview />
            </AnimatedPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;