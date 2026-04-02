import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { HiOutlineCube, HiOutlineShoppingCart } from "react-icons/hi";
import { useCart } from "../contexts/CartContext";

const CATEGORIES = [
  {
    id: "plumbing",
    name: "سباكة",
    description: "جميع مواد ومعدات السباكة",
    emoji: "🔧",
    gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)",
    glow: "rgba(14,165,233,0.3)",
    delayClass: "[animation-delay:0ms]",
  },
  {
    id: "electrical",
    name: "كهرباء",
    description: "المعدات والمواد الكهربائية",
    emoji: "⚡",
    gradient: "linear-gradient(135deg,#f59e0b,#d97706)",
    glow: "rgba(245,158,11,0.3)",
    delayClass: "[animation-delay:100ms]",
  },
  {
    id: "smart",
    name: "أنظمة ذكية",
    description: "الأنظمة الذكية والتحكم الآلي",
    emoji: "🏠",
    gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
    glow: "rgba(139,92,246,0.3)",
    delayClass: "[animation-delay:200ms]",
  },
  {
    id: "general",
    name: "عام",
    description: "منتجات ومواد متنوعة",
    emoji: "📦",
    gradient: "linear-gradient(135deg,#C9A84C,#9d7d2e)",
    glow: "rgba(201,168,76,0.3)",
    delayClass: "[animation-delay:300ms]",
  },
];

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      const allProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Show all products if "general" selected, else filter by category
      const filtered = category.id === "general"
        ? allProducts.filter((p) => !["plumbing","electrical","smart"].includes(p.category))
        : allProducts.filter((p) => p.category === category.id);
      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  return (
    <div className="page-stack animate-fade-in">
      <div className="page-header">
        <h1 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800 }}>أقسام المنتجات</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>اختر القسم لطلب المنتجات</p>
      </div>

      {!selectedCategory ? (
        /* ── Category cards ── */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`animate-fade-in ${cat.delayClass}`}
              style={{
                background: cat.gradient,
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                border: "none",
                position: "relative",
                height: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "20px 22px",
                transition: "all 0.35s ease",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.boxShadow = `0 16px 40px ${cat.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)";
              }}
            >
              {/* Light circle decoration */}
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.25) 0%,transparent 70%)" }} />
              <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 12, textAlign: "right" }}>{cat.emoji}</div>
              <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: 0 }}>{cat.name}</h2>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 }}>{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* ── Products in category ── */
        <div className="page-stack">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button onClick={() => setSelectedCategory(null)} className="btn-secondary">
              ← العودة للأقسام
            </button>
            <div>
              <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 20 }}>
                {selectedCategory.emoji} {selectedCategory.name}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>{products.length} منتج</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiOutlineCube size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text-muted)" }}>لا توجد منتجات في هذا القسم</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => {
                const isUnavailable = (product.quantity || 0) <= 0;
                // Engineer sees salePrice ONLY — purchasePrice never shown
                const displayPrice = product.salePrice || 0;

                return (
                  <div key={product.id} className="glass-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Product image */}
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, border: "1px solid var(--border-color)" }}
                      />
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <h3 style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>{product.name}</h3>
                          {product.description && (
                            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>{product.description}</p>
                          )}
                        </div>
                        <div style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", flexShrink: 0 }}>
                          <HiOutlineCube size={16} style={{ color: "var(--gold-primary)" }} />
                        </div>
                      </div>

                      {/* Sale Price — engineer facing */}
                      {displayPrice > 0 && (
                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "var(--gold-primary)", fontWeight: 800, fontSize: 18 }}>
                            {displayPrice.toLocaleString()} ر.س
                          </span>
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>/ للوحدة</span>
                        </div>
                      )}

                      {/* Availability badge */}
                      <div style={{ marginTop: 8 }}>
                        {isUnavailable ? (
                          <span className="badge badge-danger">غير متوفر</span>
                        ) : (
                          <span className="badge badge-success">متوفر</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={isUnavailable}
                      className={isUnavailable ? "btn-secondary" : "btn-primary"}
                      style={{ width: "100%", justifyContent: "center", opacity: isUnavailable ? 0.5 : 1, cursor: isUnavailable ? "not-allowed" : "pointer" }}
                    >
                      <HiOutlineShoppingCart size={16} />
                      {isUnavailable ? "غير متوفر" : "إضافة للسلة"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
