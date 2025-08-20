import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeList from "../components/RecipeList";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <strong>Welcome{user?.email ? `, ${user.email}` : ""}</strong>
        </div>
        <nav>
          <Link to="/">Home</Link> &nbsp;|&nbsp; <Link to="/favorites">Favorites</Link> &nbsp;|&nbsp;
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>Logout</button>
        </nav>
      </header>

      <h2>Recipes</h2>
      <RecipeList />
    </div>
  );
};

export default Home;
