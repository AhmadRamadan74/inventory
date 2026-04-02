import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineClipboardList,
  HiOutlineDocumentText,
  HiOutlineLogout,
  HiOutlineUserGroup,
  HiOutlineSun,
  HiOutlineMoon,
} from "react-icons/hi";
import { HiOutlineArchiveBox } from "react-icons/hi2";

function SaudLogo({ size = 36, color = '#C9A84C' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Building 1 – tallest, leftmost */}
      <polygon points="6,78 6,28 13,14 20,28 20,78" fill={color} />
      {/* Building 2 */}
      <polygon points="23,78 23,34 30,20 37,34 37,78" fill={color} />
      {/* Building 3 – center */}
      <polygon points="40,78 40,40 47,26 54,40 54,78" fill={color} />
      {/* Building 4 */}
      <polygon points="57,78 57,46 63,34 69,46 69,78" fill={color} />
      {/* Arch element – و shape */}
      <path
        d="M72,78 L72,56 Q72,44 80,42 Q88,40 88,52 Q88,62 80,65 L76,67 L76,78 Z"
        fill={color}
      />
      {/* د element – angular/step */}
      <path
        d="M91,78 L91,62 L100,55 L104,60 L96,66 L96,78 Z"
        fill={color}
      />
      {/* Base line */}
      <rect x="5" y="78" width="100" height="4" rx="2" fill={color} />
    </svg>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, userData, logout, isAdmin } = useAuth();
  const { cartCount }                       = useCart();
  const { theme, toggleTheme }             = useTheme();
  const navigate                            = useNavigate();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let isFirstLoad = true;
    const q = query(collection(db, "orders"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingOrdersCount(snapshot.docs.length);
      if (!isFirstLoad) {
        const hasNew = snapshot.docChanges().some((c) => c.type === "added");
        if (hasNew) {
          toast("يوجد طلب جديد بانتظار موافقتك!", {
            icon: "🔔",
            style: { background: "#C9A84C", color: "#fff", fontFamily: "Tajawal" },
          });
        }
      }
      isFirstLoad = false;
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !user?.uid) return;
    let isFirstLoad = true;
    const q = query(collection(db, "orders"), where("engineerId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isFirstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data();
            const num = change.doc.id.slice(-6).toUpperCase();
            if (data.status === "approved") toast.success(`تمت الموافقة على طلبك رقم #${num} 🎉`);
            else if (data.status === "rejected") toast.error(`تم رفض طلبك رقم #${num} ❌`);
          }
        });
      }
      isFirstLoad = false;
    });
    return () => unsubscribe();
  }, [isAdmin, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const adminLinks = [
    { to: "/dashboard", icon: <HiOutlineHome size={20} />,          label: "لوحة التحكم" },
    { to: "/products",  icon: <HiOutlineCube size={20} />,           label: "المنتجات" },
    { to: "/purchases", icon: <HiOutlineShoppingCart size={20} />,   label: "المشتريات" },
    { to: "/inventory", icon: <HiOutlineArchiveBox size={20} />,     label: "المخزون" },
    { to: "/orders",    icon: <HiOutlineClipboardList size={20} />,  label: "الطلبات" },
    { to: "/receipts",  icon: <HiOutlineDocumentText size={20} />,   label: "الفواتير" },
    { to: "/users",     icon: <HiOutlineUserGroup size={20} />,      label: "المستخدمين" },
  ];

  const engineerLinks = [
    { to: "/dashboard",  icon: <HiOutlineHome size={20} />,         label: "الرئيسية" },
    { to: "/categories", icon: <HiOutlineCube size={20} />,          label: "الأقسام" },
    { to: "/cart",       icon: <HiOutlineShoppingCart size={20} />,  label: "السلة" },
    { to: "/my-orders",  icon: <HiOutlineClipboardList size={20} />, label: "طلباتي" },
  ];

  const links = isAdmin ? adminLinks : engineerLinks;

  // Logo color: always gold. On light bg it's slightly darker for contrast.
  const logoColor = theme === 'light' ? '#9d7d2e' : '#C9A84C';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          background: "var(--sidebar-bg)",
          borderLeft: "1px solid var(--sidebar-border)",
          transition: "transform 0.3s ease, background 0.3s ease",
        }}
        className={`fixed inset-y-0 right-0 z-[70] flex h-dvh w-[calc(100vw-1rem)] max-w-[255px] flex-col p-2 lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)] lg:rounded-[26px]
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}
      >
        {/* ── Logo ── */}
        <div style={{ borderBottom: "1px solid var(--sidebar-border)", padding: "20px 18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Logo mark */}
            <div style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: theme === 'light'
                ? 'rgba(201,168,76,0.10)'
                : 'rgba(201,168,76,0.12)',
              border: '1.5px solid rgba(201,168,76,0.22)',
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: '0 2px 10px rgba(201,168,76,0.15)',
            }}>
              <SaudLogo size={32} color={logoColor} />
            </div>

            <div style={{ overflow: "hidden", flex: 1 }}>
              <h1 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>
                سعود العقارية
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
                نظام إدارة المخزون
              </p>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              title={theme === "light" ? "الوضع الداكن" : "الوضع الفاتح"}
            >
              {theme === "light"
                ? <HiOutlineMoon size={17} />
                : <HiOutlineSun size={17} />}
            </button>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <p style={{
            color: "var(--text-placeholder)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 10,
            paddingRight: 6,
          }}>
            القائمة الرئيسية
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive ? "sidebar-link active" : "sidebar-link"
                  }`
                }
              >
                <span style={{ flexShrink: 0 }}>{link.icon}</span>
                <span style={{ fontSize: 14, whiteSpace: "nowrap" }}>{link.label}</span>

                {link.to === "/cart" && cartCount > 0 && (
                  <span style={{
                    marginRight: "auto",
                    background: "linear-gradient(135deg,#C9A84C,#9d7d2e)",
                    color: "white",
                    borderRadius: 99,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 800,
                  }}>
                    {cartCount}
                  </span>
                )}
                {isAdmin && link.to === "/orders" && pendingOrdersCount > 0 && (
                  <span style={{
                    marginRight: "auto",
                    background: "#ef4444",
                    color: "white",
                    borderRadius: 99,
                    padding: "2px 9px",
                    fontSize: 11,
                    fontWeight: 800,
                    boxShadow: "0 0 8px rgba(239,68,68,0.5)",
                  }}>
                    {pendingOrdersCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ── User Profile ── */}
        <div style={{ borderTop: "1px solid var(--sidebar-border)", padding: "14px 12px 12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 14,
            background: "var(--bg-surface-2)",
            border: "1px solid var(--border-color)",
            marginBottom: 10,
          }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: isAdmin
                ? "linear-gradient(135deg,#C9A84C,#9d7d2e)"
                : "linear-gradient(135deg,#22c55e,#16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 800, fontSize: 16,
              flexShrink: 0,
            }}>
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{
                color: "var(--text-primary)", fontWeight: 700, fontSize: 14,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {userData?.name || "مستخدم"}
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
                {isAdmin ? "مدير النظام" : "مهندس"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              background: "transparent",
              color: "#ef4444",
              fontFamily: "Tajawal, sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <HiOutlineLogout size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}