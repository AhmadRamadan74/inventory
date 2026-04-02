import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import {
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineShoppingCart,
} from 'react-icons/hi';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartCount } = useCart();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Total price based on salePrice (what engineer sees)
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + (item.salePrice || 0) * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) { toast.error('السلة فارغة'); return; }
    setSubmitting(true);
    try {
      const orderData = {
        engineerId:   user.uid,
        engineerName: userData?.name || user.email,
        // Store salePrice in each item so receipts/revenues are correctly calculated
        items: cartItems.map((item) => ({
          productId:    item.id,
          productName:  item.name,
          quantity:     item.quantity,
          salePrice:    item.salePrice    || 0,
          purchasePrice:item.purchasePrice|| 0,
          imageUrl:     item.imageUrl     || '',
        })),
        note:      note,
        status:    'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setNote('');
      toast.success('تم إرسال الطلب بنجاح! سيتم مراجعته من قبل المدير');
      navigate('/my-orders');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('حدث خطأ في إرسال الطلب');
    }
    setSubmitting(false);
  };

  return (
    <div className="page-stack mx-auto max-w-3xl animate-fade-in">
      <div>
        <h1 style={{ color: 'var(--text-primary)', fontSize: 24, fontWeight: 800 }}>سلة الطلبات</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>{cartCount} عنصر في السلة</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineShoppingCart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 16 }}>السلة فارغة</p>
          <button onClick={() => navigate('/categories')} className="btn-primary">
            تصفح المنتجات
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="glass-card"
                style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}
              >
                {/* Product image / icon */}
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border-color)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: 10, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', flexShrink: 0 }}>
                    <HiOutlineShoppingCart size={22} />
                  </div>
                )}

                {/* Product info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 15 }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{item.category || ''}</p>
                  {/* Show sale price to engineer */}
                  {item.salePrice > 0 && (
                    <p style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                      {(item.salePrice * item.quantity).toLocaleString()} ر.س
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 12 }}> ({item.salePrice.toLocaleString()} × {item.quantity})</span>
                    </p>
                  )}
                </div>

                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface-2)', borderRadius: 12, padding: '4px 6px', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '4px 8px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <HiOutlineMinus size={14} />
                    </button>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '4px 8px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <HiOutlinePlus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{ padding: 8, borderRadius: 10, border: 'none', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          {grandTotal > 0 && (
            <div style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 16,
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>إجمالي الطلب</span>
              <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: 20 }}>
                {grandTotal.toLocaleString()} ر.س
              </span>
            </div>
          )}

          {/* Note */}
          <div>
            <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7 }}>
              ملاحظات (اختياري)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input-field resize-none"
              rows="2"
              placeholder="أضف ملاحظات للطلب..."
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }} className="flex-col sm:flex-row">
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="btn-primary flex-1 justify-center"
              style={{ padding: '13px 0', fontSize: 15 }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الإرسال...
                </span>
              ) : 'إرسال الطلب'}
            </button>
            <button onClick={clearCart} className="btn-danger">إفراغ السلة</button>
          </div>
        </>
      )}
    </div>
  );
}
