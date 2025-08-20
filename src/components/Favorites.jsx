import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Favorites = () => {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchFavorites = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/favorites?userId=${user.id}`);
      const data = await res.json();
      setFavorites(data || []);
    } catch (err) {
      console.error("Error loading favorites", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteRowId) => {
    try {
      await fetch(`http://localhost:3000/favorites/${favoriteRowId}`, {
        method: "DELETE",
      });
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteRowId));
    } catch (err) {
      console.error("Failed to delete favorite", err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  if (!user?.id) return <p>Please log in to see favorites.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      {/* Top nav */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <strong>Welcome{user?.email ? `, ${user.email}` : ""}</strong>
        </div>
        <nav>
          <Link to="/">Home</Link> &nbsp;|&nbsp;
          <Link to="/favorites">Favorites</Link> &nbsp;|&nbsp;
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </nav>
      </header>

      <h2>My Favourited Recipes</h2>

      {favorites.length === 0 && <p>Your list is empty</p>}

      {favorites.map((fav) => (
        <div
          key={fav.id}
          style={{
            padding: "10px",
            marginBottom: "10px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          <h3>
            <Link to={`/recipe/${fav.recipeId}`}>{fav.name}</Link>
          </h3>
          <Link to={`/recipe/${fav.recipeId}`}>
            <img src={fav.image} alt={fav.name} style={{ width: "100%" }} />
          </Link>
          <br />
          <button onClick={() => removeFavorite(fav.id)}>Remove from list</button>
        </div>
      ))}
    </div>
  );
};

export default Favorites;
