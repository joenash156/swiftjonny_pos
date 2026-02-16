import { Outlet } from "react-router-dom";

function AuthPagesLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthPagesLayout