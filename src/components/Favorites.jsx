import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Favorites = () => {
  const { user, logout } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({}); 
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
      const d = {};
      (data || []).forEach(f => {
        d[f.id] = { note: f.note || "", rating: typeof f.rating === "number" ? f.rating : 0 };
      });
      setDrafts(d);
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
      setFavorites(prev => prev.filter(f => f.id !== favoriteRowId));
      setDrafts(prev => {
        const { [favoriteRowId]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error("Failed to delete favorite", err);
    }
  };

  const saveFavorite = async (favId) => {
    const patch = drafts[favId] || { note: "", rating: 0 };
    try {
      setSaving(prev => ({ ...prev, [favId]: true }));
      await fetch(`http://localhost:3000/favorites/${favId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      setFavorites(list => list.map(f => (f.id === favId ? { ...f, ...patch } : f)));
    } catch (err) {
      console.error("Failed to update favorite", err);
      alert("Could not save changes.");
    } finally {
      setSaving(prev => ({ ...prev, [favId]: false }));
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  if (!user?.id) return <p>Please log in to see favorites.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>

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

      {favorites.map((fav) => {
        const draft = drafts[fav.id] || { note: "", rating: 0 };
        const unchanged =
          (fav.note || "") === (draft.note || "") &&
          (typeof fav.rating === "number" ? fav.rating : 0) === (typeof draft.rating === "number" ? draft.rating : 0);

        return (
          <div
            key={fav.id}
            style={{
              padding: "12px",
              marginBottom: "14px",
              maxWidth: "520px",
              margin: "0 auto",
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              <Link to={`/recipe/${fav.recipeId}`}>{fav.name}</Link>
            </h3>

            <Link to={`/recipe/${fav.recipeId}`}>
              <img src={fav.image} alt={fav.name} style={{ width: "100%", borderRadius: 6 }} />
            </Link>

            <div style={{ marginTop: 10 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                <span style={{ display: "inline-block", width: 80 }}>Rating:</span>
                <select
                  value={draft.rating}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [fav.id]: { ...draft, rating: Number(e.target.value) } }))
                  }
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} ⭐
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "block", marginBottom: 6 }}>
                <span style={{ display: "inline-block", width: 80 }}>Note:</span>
                <input
                  style={{ width: "100%", boxSizing: "border-box" }}
                  placeholder="Add a note…"
                  value={draft.note}
                  onChange={(e) =>
                    setDrafts((d) => ({ ...d, [fav.id]: { ...draft, note: e.target.value } }))
                  }
                />
              </label>

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => saveFavorite(fav.id)}
                  disabled={saving[fav.id] || unchanged}
                  title={unchanged ? "No changes to save" : "Save changes"}
                >
                  {saving[fav.id] ? "Saving..." : "Save"}
                </button>
                <button onClick={() => removeFavorite(fav.id)} style={{ marginLeft: "auto" }}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Favorites;
