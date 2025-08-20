import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:4000";

const RecipeCard = ({ recipe }) => {
  const { isAuthenticated } = useAuth();

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to favorite recipes.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipe_id: recipe.id,
          name: recipe.name,
          image: recipe.image,
          cuisine: recipe.cuisine,
        }),
      });

      if (res.status === 409) {
        alert("Already in your favorites.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add favorite");
      }
      alert("Added to favorites");
    } catch (err) {
      console.error("Error adding to favorites:", err);
      alert(err.message || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        marginBottom: "10px",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h3>
        <Link to={`/recipe/${recipe.id}`}>{recipe.name}</Link>
      </h3>
      <p><strong>Cuisine:</strong> {recipe.cuisine}</p>
      <Link to={`/recipe/${recipe.id}`}>
        <img src={recipe.image} alt={recipe.name} style={{ width: "100%" }} />
      </Link>
      <br />
      <button onClick={handleFavorite}>❤️</button>
    </div>
  );
};

export default RecipeCard;
