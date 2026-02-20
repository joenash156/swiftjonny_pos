import { Outlet } from "react-router-dom";

function AuthPagesLayout() {
  return (
    <div className="font-kumbh">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AuthPagesLayout