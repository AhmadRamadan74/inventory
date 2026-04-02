import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineShoppingCart,
  HiOutlineX,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCurrencyDollar,
} from "react-icons/hi";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    price: "",
    supplier: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  async function fetchData() {
    const [purchasesSnap, productsSnap, ordersSnap] = await Promise.all([
      getDocs(collection(db, "purchases")),
      getDocs(collection(db, "products")),
      getDocs(collection(db, "orders")),
    ]);
    return {
      purchases: purchasesSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.date || b.createdAt || "").localeCompare(a.date || a.createdAt || "")),
      products: productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      orders: ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  }

  async function refreshData() {
    try {
      const data = await fetchData();
      setPurchases(data.purchases);
      setProducts(data.products);
      setOrders(data.orders);
    } catch {
      toast.error("حدث خطأ في جلب البيانات");
    }
    setLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchData();
        if (!isMounted) return;
        setPurchases(data.purchases);
        setProducts(data.products);
        setOrders(data.orders);
      } catch {
        toast.error("حدث خطأ في جلب البيانات");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  /* ── Financial calculations ── */
  // إجمالي المصروفات = مجموع مشتريات الصين
  const totalExpenses = purchases.reduce((sum, p) => sum + (p.totalPrice || p.quantity * p.price || 0), 0);

  // إجمالي الإيرادات = سعر البيع × الكمية من الطلبات المكتملة أو المعتمدة
  const completedOrders = orders.filter((o) => o.status === "completed" || o.status === "approved");
  const totalRevenue = completedOrders.reduce((sum, order) => {
    const orderRevenue = (order.items || []).reduce((s, item) => {
      const product = products.find((p) => p.id === item.productId);
      const salePrice = item.salePrice ?? product?.salePrice ?? 0;
      return s + salePrice * item.quantity;
    }, 0);
    return sum + orderRevenue;
  }, 0);

  const netBalance = totalRevenue - totalExpenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || !formData.price || !formData.supplier) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const selectedProduct = products.find((p) => p.id === formData.productId);

    try {
      await addDoc(collection(db, "purchases"), {
        productId:    formData.productId,
        productName:  selectedProduct?.name || "",
        quantity:     Number(formData.quantity),
        price:        Number(formData.price),
        totalPrice:   Number(formData.quantity) * Number(formData.price),
        supplier:     formData.supplier,
        date:         formData.date,
        notes:        formData.notes,
        createdAt:    new Date().toISOString(),
      });

      await updateDoc(doc(db, "products", formData.productId), {
        quantity:      increment(Number(formData.quantity)),
        purchasePrice: Number(formData.price),
      });

      toast.success("تم تسجيل المشتريات بنجاح");
      setShowModal(false);
      setFormData({
        productId: "", quantity: "", price: "", supplier: "",
        date: new Date().toISOString().split("T")[0], notes: "",
      });
      await refreshData();
    } catch {
      toast.error("حدث خطأ في تسجيل المشتريات");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-12 w-64 rounded-xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="page-header">
          <h1 style={{ color: "var(--text-primary)", fontSize: 24, fontWeight: 800 }}>إدارة المشتريات (الصين)</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{purchases.length} عملية شراء</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary justify-center" id="add-purchase-btn">
          <HiOutlinePlus size={18} />
          تسجيل مشتريات
        </button>
      </div>

      {/* ── Financial Summary ── */}
      <div className="finance-summary">
        {/* إجمالي الإيرادات */}
        <div className="finance-card stat-card-revenue">
          <div className="finance-card-accent" style={{ background: "var(--gold-primary)" }} />
          <div className="finance-card-label" style={{ paddingRight: 8 }}>
            <div className="flex items-center gap-2">
              <HiOutlineTrendingUp size={16} style={{ color: "var(--gold-primary)" }} />
              إجمالي الإيرادات
            </div>
          </div>
          <div className="finance-card-value" style={{ color: "var(--gold-primary)", paddingRight: 8 }}>
            {totalRevenue.toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 600, marginRight: 4 }}>ر.س</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", paddingRight: 8, marginTop: 4 }}>
            سعر البيع للمهندسين ({completedOrders.length} طلب مكتمل)
          </p>
        </div>

        {/* إجمالي المصروفات */}
        <div className="finance-card stat-card-expense">
          <div className="finance-card-accent" style={{ background: "#ef4444" }} />
          <div className="finance-card-label" style={{ paddingRight: 8 }}>
            <div className="flex items-center gap-2">
              <HiOutlineTrendingDown size={16} style={{ color: "#ef4444" }} />
              إجمالي المصروفات
            </div>
          </div>
          <div className="finance-card-value" style={{ color: "#ef4444", paddingRight: 8 }}>
            {totalExpenses.toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 600, marginRight: 4 }}>ر.س</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", paddingRight: 8, marginTop: 4 }}>
            تكلفة الشراء من الصين ({purchases.length} عملية)
          </p>
        </div>

        {/* الرصيد النهائي */}
        <div className={`finance-card ${netBalance >= 0 ? "stat-card-balance-positive" : "stat-card-balance-negative"}`}>
          <div className="finance-card-accent" style={{ background: netBalance >= 0 ? "#22c55e" : "#ef4444" }} />
          <div className="finance-card-label" style={{ paddingRight: 8 }}>
            <div className="flex items-center gap-2">
              <HiOutlineCurrencyDollar size={16} style={{ color: netBalance >= 0 ? "#22c55e" : "#ef4444" }} />
              الرصيد النهائي
            </div>
          </div>
          <div className="finance-card-value" style={{ color: netBalance >= 0 ? "#16a34a" : "#dc2626", paddingRight: 8 }}>
            {netBalance >= 0 ? "+" : ""}{netBalance.toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 600, marginRight: 4 }}>ر.س</span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", paddingRight: 8, marginTop: 4 }}>
            {netBalance >= 0 ? "✅ إيرادات - مصروفات" : "⚠️ الإيرادات أقل من المصروفات"}
          </p>
        </div>
      </div>

      {/* Purchases Table */}
      {purchases.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineShoppingCart size={48} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 16 }}>لا توجد مشتريات</p>
        </div>
      ) : (
        <div className="table-container glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
                <th>المورد</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{purchase.productName}</td>
                  <td>{purchase.quantity}</td>
                  <td style={{ color: "var(--text-muted)" }}>{purchase.price?.toLocaleString()} ر.س</td>
                  <td style={{ fontWeight: 700, color: "var(--gold-primary)" }}>
                    {(purchase.totalPrice || purchase.quantity * purchase.price)?.toLocaleString()} ر.س
                  </td>
                  <td>{purchase.supplier}</td>
                  <td style={{ color: "var(--text-muted)" }}>{purchase.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content mt-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 20 }}>تسجيل مشتريات جديدة</h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 7, borderRadius: 9, border: "none", background: "var(--bg-surface-2)", cursor: "pointer", color: "var(--text-muted)" }}>
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>المنتج *</label>
                <select value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="input-field" id="purchase-product">
                  <option value="">اختر المنتج</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>الكمية *</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="input-field" placeholder="0" min="1" id="purchase-quantity" />
                </div>
                <div>
                  <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>سعر الشراء (الصين) *</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="input-field" placeholder="0" min="0" step="0.01" id="purchase-price" />
                </div>
              </div>

              {/* Total preview */}
              {formData.quantity && formData.price && (
                <div style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>الإجمالي</span>
                  <span style={{ color: "var(--gold-primary)", fontWeight: 800 }}>
                    {(Number(formData.quantity) * Number(formData.price)).toLocaleString()} ر.س
                  </span>
                </div>
              )}

              <div>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>اسم المورد *</label>
                <input type="text" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="input-field" placeholder="اسم المورد" id="purchase-supplier" />
              </div>

              <div>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>تاريخ الشراء</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" id="purchase-date" />
              </div>

              <div>
                <label style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>ملاحظات</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input-field resize-none" rows="2" placeholder="ملاحظات اختيارية" id="purchase-notes" />
              </div>

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row">
                <button type="submit" className="btn-primary flex-1 justify-center">تسجيل المشتريات</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary justify-center">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
