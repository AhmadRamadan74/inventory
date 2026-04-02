import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  HiOutlineSearch,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { HiOutlineArchiveBox } from "react-icons/hi2";

const CATEGORIES = [
  { id: "plumbing", name: "سباكة", textClass: "text-sky-400" },
  { id: "electrical", name: "كهرباء", textClass: "text-amber-400" },
  { id: "smart", name: "أنظمة ذكية", textClass: "text-violet-400" },
];

const FALLBACK_CATEGORY = {
  name: "عام",
  textClass: "text-indigo-400",
};

const PROGRESS_WIDTH_CLASSES = [
  "w-0",
  "w-[5%]",
  "w-[10%]",
  "w-[15%]",
  "w-[20%]",
  "w-[25%]",
  "w-[30%]",
  "w-[35%]",
  "w-[40%]",
  "w-[45%]",
  "w-[50%]",
  "w-[55%]",
  "w-[60%]",
  "w-[65%]",
  "w-[70%]",
  "w-[75%]",
  "w-[80%]",
  "w-[85%]",
  "w-[90%]",
  "w-[95%]",
  "w-full",
];

const getProgressWidthClass = (percentage) => {
  const index = Math.max(0, Math.min(20, Math.round(percentage / 5)));
  return PROGRESS_WIDTH_CLASSES[index];
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (!isMounted) return;
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryMeta = (catId) =>
    CATEGORIES.find((c) => c.id === catId) || FALLBACK_CATEGORY;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = products.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.purchasePrice || 0),
    0,
  );
  const totalItems = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const lowStockCount = products.filter(
    (p) => (p.quantity || 0) <= (p.minStock || 5),
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      <div className="page-header">
        <h1 style={{ color: 'var(--text-primary)', fontSize: 24, fontWeight: 800 }}>المخزون</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
          عرض الكميات الحالية لجميع المنتجات
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 text-center md:grid-cols-3">
        <div className="stat-card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>إجمالي العناصر</p>
          <p style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 800 }}>{totalItems}</p>
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full blur-xl" style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.15) 0%,transparent 70%)' }} />
        </div>
        <div className="stat-card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>قيمة المخزون (تكلفة)</p>
          <p style={{ color: 'var(--gold-primary)', fontSize: 22, fontWeight: 800 }}>
            {totalValue.toLocaleString()} ر.س
          </p>
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full blur-xl" style={{ background: 'radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)' }} />
        </div>
        <div className="stat-card">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 4 }}>منخفض المخزون</p>
          <p style={{ color: '#b45309', fontSize: 28, fontWeight: 800 }}>{lowStockCount}</p>
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full blur-xl" style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)' }} />
        </div>
      </div>

      <div className="surface-panel flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <HiOutlineSearch
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pr-10"
            placeholder="ابحث عن منتج..."
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field w-full lg:w-56"
        >
          <option value="all" className="text-center">
            جميع الفئات
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const isLow = (product.quantity || 0) <= (product.minStock || 5);
          const percentage = Math.min(
            ((product.quantity || 0) / Math.max(product.minStock || 5, 1)) * 100,
            100,
          );
          const category = getCategoryMeta(product.category);
          const progressBg = isLow
            ? "linear-gradient(90deg,#ef4444,#f59e0b)"
            : "linear-gradient(90deg,#C9A84C,#9d7d2e)";

          return (
            <div key={product.id} className="glass-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{product.name}</h3>
                  <span style={{ color: 'var(--gold-primary)', fontSize: 12 }}>{category.name}</span>
                </div>
                {isLow && <HiOutlineExclamationCircle style={{ color: '#b45309', flexShrink: 0 }} size={20} />}
              </div>

              <div style={{ margin: '14px 0 10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: 30, fontWeight: 800 }}>
                    {product.quantity || 0}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>حد أدنى: {product.minStock || 5}</span>
                </div>
                <div style={{ height: 8, width: '100%', borderRadius: 99, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                  <div
                    className={getProgressWidthClass(percentage)}
                    style={{ height: '100%', borderRadius: 99, background: progressBg, transition: 'all 0.5s ease' }}
                  />
                </div>
              </div>

              {/* Both prices — admin only page */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>سعر الشراء (الصين)</span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{(product.purchasePrice || 0).toLocaleString()} ر.س</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>سعر البيع (المهندسين)</span>
                <span style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{(product.salePrice || 0).toLocaleString()} ر.س</span>
              </div>

              {isLow && (
                <div style={{ marginTop: 12, borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.08)', padding: '8px 12px' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#b45309' }}>
                    <HiOutlineExclamationCircle size={14} />
                    المخزون منخفض - يرجى إعادة التوريد
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <HiOutlineArchiveBox size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)' }}>لا توجد منتجات مطابقة</p>
        </div>
      )}
    </div>
  );
}
