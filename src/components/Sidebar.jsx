import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
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
  HiOutlineChartBar,
} from "react-icons/hi";
import { HiOutlineArchiveBox } from "react-icons/hi2";

export default function Sidebar({ isOpen, onClose }) {
  const { user, userData, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    let isFirstLoad = true;
    const q = query(collection(db, "orders"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingOrdersCount(snapshot.docs.length);

      if (!isFirstLoad) {
        const hasNew = snapshot.docChanges().some((change) => change.type === "added");
        if (hasNew) {
          toast("يوجد طلب جديد بانتظار موافقتك!", {
            icon: "🔔",
            style: { background: "#4f46e5", color: "#fff" },
          });
        }
      }
      isFirstLoad = false;
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Observer for Engineer: Notify when their order is approved or rejected
  useEffect(() => {
    // Wait until `user` is available
    if (isAdmin || !user?.uid) return;

    let isFirstLoad = true;
    const q = query(
      collection(db, "orders"),
      where("engineerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isFirstLoad) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data();
            const orderNum = change.doc.id.slice(-6).toUpperCase();
            
            if (data.status === "approved") {
              toast.success(`تمت الموافقة على طلبك رقم #${orderNum} 🎉`);
            } else if (data.status === "rejected") {
              toast.error(`تم رفض طلبك رقم #${orderNum} ❌`);
            }
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
    {
      to: "/dashboard",
      icon: <HiOutlineHome size={21} />,
      label: "لوحة التحكم",
    },
    { to: "/products", icon: <HiOutlineCube size={21} />, label: "المنتجات" },
    {
      to: "/purchases",
      icon: <HiOutlineShoppingCart size={21} />,
      label: "المشتريات",
    },
    {
      to: "/inventory",
      icon: <HiOutlineArchiveBox size={21} />,
      label: "المخزون",
    },
    {
      to: "/orders",
      icon: <HiOutlineClipboardList size={21} />,
      label: "الطلبات",
    },
    {
      to: "/receipts",
      icon: <HiOutlineDocumentText size={21} />,
      label: "الفواتير",
    },
    {
      to: "/users",
      icon: <HiOutlineUserGroup size={21} />,
      label: "المستخدمين",
    },
  ];

  const engineerLinks = [
    { to: "/dashboard", icon: <HiOutlineHome size={21} />, label: "الرئيسية" },
    { to: "/categories", icon: <HiOutlineCube size={21} />, label: "الأقسام" },
    {
      to: "/cart",
      icon: <HiOutlineShoppingCart size={21} />,
      label: "السلة",
    },
    {
      to: "/my-orders",
      icon: <HiOutlineClipboardList size={21} />,
      label: "طلباتي",
    },
  ];

  const links = isAdmin ? adminLinks : engineerLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`h-screen sticky top-0 flex flex-col z-[70] transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          fixed lg:relative right-0 shrink-0
        `}
        style={{
          width: "250px",
          background:
            "linear-gradient(180deg, #0f172a 0%, #0c1324 50%, #080e1c 100%)",
          borderLeft: "1px solid rgba(99, 102, 241, 0.12)",
          padding:7
        }}
      >
        {/* Logo */}
        <div className="px-7 py-8 border-b border-indigo-500/10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.35)",
                margin: 6,
                marginBottom:7
              }}
            >
              <HiOutlineChartBar size={26} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-white truncate">المخزون</h1>
              <p className="text-xs text-slate-500 mt-1 truncate">
                نظام إدارة المخزون
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-5 py-6 flex-1 overflow-y-auto" style={{marginTop:10}}>
          <p className="text-[11px] font-bold text-slate-600 tracking-widest mb-6 px-2" style={{ fontSize: 16, marginBottom:20}}>
            القائمة الرئيسية
          </p>

          <nav className="flex flex-col gap-15">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: isActive
                      ? "rgba(99,102,241,0.15)"
                      : "transparent",
                    color: isActive ? "#c7d2fe" : "#94a3b8",
                    border: isActive
                      ? "3px solid rgba(99,102,241,0.2)"
                      : "3px solid transparent",
                      padding:5
                  }}
                >
                  <span className="shrink-0 text-xl">{link.icon}</span>
                  <span className="text-[15px] whitespace-nowrap">
                    {link.label}
                  </span>
                  {link.to === '/cart' && cartCount > 0 && (
                    <span className="text-white text-bold text-lg font-bold rounded-full bg-indigo-700/35" style={{padding: "5px 10px"}}>
                      {cartCount}
                    </span>
                  )}
                  {isAdmin && link.to === '/orders' && pendingOrdersCount > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{padding: "5px 12px"}}>
                      {pendingOrdersCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="px-5 py-6 border-t border-indigo-500/10" style={{marginBottom:20}}>
          <div className="flex items-center gap-3 p-4 rounded-2xl mb-4 bg-slate-800/40 border border-slate-700/30">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
              style={{
                background: isAdmin
                  ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
              }}
            >
              {userData?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userData?.name || "مستخدم"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {isAdmin ? "مدير النظام" : "مهندس"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-red-400/90 transition-all cursor-pointer hover:bg-red-500/10"
          >
            <HiOutlineLogout size={20} style={{marginTop:20}} />
            <span style={{fontSize:15, marginTop:20}}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
