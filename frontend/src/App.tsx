import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import { useAppContext } from "./contexts/AppContext";
import AddHotels from "./pages/AddHotels";
import MyHotels from "./pages/MyHotels";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Detail from "./pages/Detail";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import ChatWidget from "./components/ChatWidget";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading } = useAppContext();
  
  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn, isLoading } = useAppContext();
  
  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <>
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/search"
        element={
          <Layout>
            <Search />
          </Layout>
        }
      />

      <Route
        path="/detail/:hotelId"
        element={
          <Layout>
            <Detail />
          </Layout>
        }
      />

      <Route
        path="/register"
        element={
          <Layout>
            <Register></Register>
          </Layout>
        }
      ></Route>

      <Route
        path="/sign-in"
        element={
          isLoggedIn ? (
            <Navigate to="/" />
          ) : (
            <Layout>
              <SignIn></SignIn>
            </Layout>
          )
        }
      ></Route>

      <Route
        path="/add-hotel"
        element={
          <ProtectedRoute>
            <Layout>
              <AddHotels />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-hotel/:hotelId"
        element={
          <ProtectedRoute>
            <Layout>
              <EditHotel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-hotels"
        element={
          <ProtectedRoute>
            <Layout>
              <MyHotels />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/:hotelId"
        element={
          <ProtectedRoute>
            <Layout>
              <Booking />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBookings />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/"></Navigate>}></Route>
    </Routes>
    {isLoggedIn && <ChatWidget />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};
export default App;
