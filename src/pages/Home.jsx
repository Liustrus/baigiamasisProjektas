import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Welcome</h1>
      <p>
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Home;
