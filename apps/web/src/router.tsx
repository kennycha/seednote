import { createHashRouter } from "react-router-dom";
import ProtectedRoute from "./components/protected-route";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";

const router = createHashRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export default router;
