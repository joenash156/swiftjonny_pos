import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className="flex items-center flex-col justify-center h-screen">
      <h1>Homepage</h1>

      <Link to={"/login"} className="text-lg text-lime-500" >
        Login
      </Link>
    </div>
  );
}

export default Homepage