import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineShoppingCart } from "react-icons/hi";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen lg:min-h-dvh lg:flex lg:items-start lg:gap-6 lg:p-4 xl:p-6"
      style={{ background: "var(--color-dark-950)", }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 min-w-0 flex-col lg:min-h-[calc(100vh-2rem)]">
        <header
          className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 px-4 py-3 lg:hidden"
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(20px)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <HiOutlineMenu size={24} />
          </button>

          <h1 className="text-lg font-bold gradient-text">المخزون</h1>

          {!isAdmin && (
            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 relative"
            >
              <HiOutlineShoppingCart size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
          {isAdmin && <div className="w-10" />}
        </header>

        <main className="flex-1 px-4 pb-6 pt-5 sm:px-5 sm:pb-8 sm:pt-6 lg:px-0 lg:pb-0 lg:pt-0">
          <div className="content-shell" style={{ padding: '100px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
