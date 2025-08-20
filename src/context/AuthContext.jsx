import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const res = await fetch(`http://localhost:3000/users?email=${userData.email}`);
      const users = await res.json();

      if (users.length === 0) {
        alert("User not found");
        return;
      }

      const matchedUser = users.find((u) => u.password === userData.password);

      if (!matchedUser) {
        alert("Incorrect password");
        return;
      }

      setUser(matchedUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(matchedUser));
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong while logging in.");
    }
  };

  const register = async (userData) => {
    try {
      const res = await fetch(`http://localhost:3000/users?email=${userData.email}`);
      const existingUsers = await res.json();

      if (existingUsers.length > 0) {
        alert("User already exists");
        return;
      }

      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const newUser = await response.json();
      login(newUser);
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
