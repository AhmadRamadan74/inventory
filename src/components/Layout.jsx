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
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', transition: 'background 0.3s ease' }}
      className="lg:flex lg:min-h-dvh lg:items-start lg:gap-5 lg:p-4 xl:p-6"
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: '100vh' }}
        className="lg:min-h-[calc(100dvh-2rem)]"
      >
        {/* Mobile header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
        }} className="lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              padding: 8, borderRadius: 10, border: 'none',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <HiOutlineMenu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, background: 'linear-gradient(135deg,#C9A84C,#9d7d2e)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
                <rect x="10" y="7" width="6" height="14" rx="0.8" fill="white"/>
                <rect x="4" y="11" width="5" height="10" rx="0.8" fill="white" opacity="0.85"/>
                <rect x="17" y="10" width="5" height="11" rx="0.8" fill="white" opacity="0.85"/>
                <polygon points="13,2 9,7 17,7" fill="white"/>
              </svg>
            </div>
            <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: 15 }}>سعود العقارية</span>
          </div>

          {!isAdmin ? (
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: 8, borderRadius: 10, border: 'none',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <HiOutlineShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          ) : (
            <div style={{ width: 40 }} />
          )}
        </header>

        {/* Main content */}
        <main style={{ flex: 1, padding: '20px 16px 28px' }}
          className="sm:px-5 sm:pb-8 sm:pt-6 lg:px-0 lg:pb-0 lg:pt-0"
        >
          <div className="content-shell w-full lg:pt-4 xl:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
