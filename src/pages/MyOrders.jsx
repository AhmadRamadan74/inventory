import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineClipboardList, HiOutlineX } from 'react-icons/hi';

export default function MyOrders() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchMyOrders(); }, [user]);

  const fetchMyOrders = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const myOrders = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (o) =>
            o.engineerId === user.uid ||
            o.userId === user.uid ||
            (o.engineerName && o.engineerName === user.email) ||
            (userData?.name && o.engineerName === userData.name)
        )
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      setOrders(myOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':  return <span className="badge badge-success">تمت الموافقة ✓</span>;
      case 'rejected':  return <span className="badge badge-danger">مرفوض ✗</span>;
      case 'completed': return <span className="badge badge-info">مكتمل</span>;
      default:          return <span className="badge badge-pending">قيد الانتظار ⏳</span>;
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Calculate order total from salePrice (engineer view)
  const getOrderTotal = (order) =>
    (order.items || []).reduce((s, i) => s + (i.salePrice || 0) * i.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton h-12 w-64 rounded-xl" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="page-stack animate-fade-in">
      <div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 24, fontWeight: 800 }}>طلباتي</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{orders.length} طلب</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineClipboardList size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>لا توجد طلبات بعد</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, opacity: 0.7 }}>اذهب إلى الأقسام لطلب المنتجات</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => {
            const total = getOrderTotal(order);
            return (
              <div
                key={order.id}
                className="glass-card"
                style={{ padding: '18px 20px', cursor: 'pointer', transition: 'all .2s' }}
                onClick={() => setSelectedOrder(order)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 9, borderRadius: 12, background: 'rgba(201,168,76,0.1)', color: 'var(--gold-primary)' }}>
                      <HiOutlineClipboardList size={20} />
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>
                        طلب #{order.id?.slice(-6).toUpperCase()}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{order.items?.length || 0} منتج</span>
                    {order.note && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>• {order.note}</span>}
                  </div>
                  {/* Show total to engineer */}
                  {total > 0 && (
                    <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: 15 }}>
                      {total.toLocaleString()} ر.س
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 20 }}>
                طلب #{selectedOrder.id?.slice(-6).toUpperCase()}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: 8, borderRadius: 10, border: 'none', background: 'var(--bg-surface-2)', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <HiOutlineX size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>الحالة:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              {/* Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)' }}>التاريخ:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatDate(selectedOrder.createdAt)}</span>
              </div>
              {/* Note */}
              {selectedOrder.note && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>ملاحظات:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{selectedOrder.note}</span>
                </div>
              )}

              {/* Items — show salePrice to engineer, never purchasePrice */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
                <h3 style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>المنتجات المطلوبة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '10px 14px', borderRadius: 12,
                      background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)',
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, display: 'block' }}>
                          {item.productName || item.name}
                        </span>
                        {/* Sale price per unit × qty */}
                        {item.salePrice > 0 && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2, display: 'block' }}>
                            {item.salePrice.toLocaleString()} × {item.quantity} = {(item.salePrice * item.quantity).toLocaleString()} ر.س
                          </span>
                        )}
                      </div>
                      <span className="badge badge-gold">الكمية: {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                {getOrderTotal(selectedOrder) > 0 && (
                  <div style={{
                    marginTop: 12, padding: '12px 16px',
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>إجمالي الطلب</span>
                    <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: 16 }}>
                      {getOrderTotal(selectedOrder).toLocaleString()} ر.س
                    </span>
                  </div>
                )}
              </div>

              {/* Status alert */}
              {selectedOrder.status === 'approved' && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ color: '#16a34a', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>✓ تمت الموافقة على طلبك</p>
                </div>
              )}
              {selectedOrder.status === 'rejected' && (
                <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ color: '#dc2626', fontSize: 14, textAlign: 'center', fontWeight: 600 }}>✗ تم رفض طلبك</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
