import { useEffect, useState } from "react";
import RecipeCard from "./RecipeCard";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 5;

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("https://dummyjson.com/recipes");
        const data = await res.json();
        setRecipes(data.recipes || []);
      } catch (err) {
        console.error("Failed to fetch recipes", err);
      }
    };

    fetchRecipes();
  }, []);

  const indexOfLast = currentPage * recipesPerPage;
  const indexOfFirst = indexOfLast - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirst, indexOfLast);

  const nextPage = () => {
    if (indexOfLast < recipes.length) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div>
      <h2>Recipe List</h2>
      {currentRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}

      <div style={{ marginTop: "20px" }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Atgal
        </button>
        <button onClick={nextPage} disabled={indexOfLast >= recipes.length}>
          Kitas
        </button>
      </div>
    </div>
  );
};

export default RecipeList;
