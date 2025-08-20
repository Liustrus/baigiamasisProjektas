import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error("Error fetching recipe details", err);
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
      {/* simple nav + back */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><strong>Welcome{user?.email ? `, ${user.email}` : ""}</strong></div>
        <nav>
          <button onClick={() => navigate(-1)} style={{ marginRight: 12 }}>← Back</button>
          <Link to="/">Home</Link> &nbsp;|&nbsp;
          <Link to="/favorites">Favorites</Link> &nbsp;|&nbsp;
          <button onClick={() => { logout(); navigate("/login"); }} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </nav>
      </header>

      <h2>{recipe.name}</h2>
      <img src={recipe.image} alt={recipe.name} style={{ width: "300px" }} />
      <p><strong>Cuisine:</strong> {recipe.cuisine}</p>
      <p><strong>Meal type:</strong> {Array.isArray(recipe.mealType) ? recipe.mealType.join(", ") : recipe.mealType}</p>

      <p><strong>Ingredients:</strong></p>
      <ul>
        {recipe.ingredients?.map((ing, index) => <li key={index}>{ing}</li>)}
      </ul>

      <p><strong>Instructions:</strong></p>
      <ol>
        {recipe.instructions?.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </div>
  );
};

export default RecipeDetail;
