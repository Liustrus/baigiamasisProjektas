import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RecipeCard = ({ recipe }) => {
  const { user } = useAuth();

  const handleFavorite = async () => {
    try {
      if (!user?.id) {
        return alert("You must be logged in to favorite recipes.");
      }

      const existsRes = await fetch(
        `http://localhost:3000/favorites?userId=${user.id}&recipeId=${recipe.id}`
      );
      const exists = await existsRes.json();
      if (exists.length > 0) {
        return alert("Already in your favorites.");
      }

      const favoriteData = {
        userId: user.id,
        recipeId: recipe.id,
        name: recipe.name,
        cuisine: recipe.cuisine,
        image: recipe.image,
      };

      await fetch("http://localhost:3000/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(favoriteData),
      });

      alert("Added to favorites");
    } catch (err) {
      console.error("Error adding to favorites:", err);
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
