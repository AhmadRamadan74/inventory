import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

function SaudLogo({ size = 60, color = '#C9A84C' }) {
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

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const { theme }               = useTheme();
  const navigate                = useNavigate();

  const logoColor = '#C9A84C';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('يرجى ملء جميع الحقول'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'auth/user-not-found')      toast.error('المستخدم غير موجود');
      else if (error.code === 'auth/wrong-password') toast.error('كلمة المرور غير صحيحة');
      else if (error.code === 'auth/invalid-credential') toast.error('بيانات الدخول غير صحيحة');
      else toast.error('حدث خطأ في تسجيل الدخول');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -100,
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80,
            background: theme === 'light'
              ? 'rgba(201,168,76,0.08)'
              : 'rgba(201,168,76,0.12)',
            borderRadius: 22,
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(201,168,76,0.25)',
            boxShadow: '0 8px 32px rgba(201,168,76,0.18)',
          }}>
            <SaudLogo size={52} color={logoColor} />
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 800, margin: 0 }}>
            سعود العقارية
          </h1>
          <p style={{ color: 'var(--gold-primary)', fontSize: 13, marginTop: 4, fontWeight: 600 }}>
            SAUD REAL ESTATE
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            قم بتسجيل الدخول للمتابعة
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 22,
          padding: '28px 28px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7 }}>
                البريد الإلكتروني
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineMail
                  size={17}
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="أدخل البريد الإلكتروني"
                  id="login-email"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 7 }}>
                كلمة المرور
              </label>
              <div style={{ position: 'relative' }}>
                <HiOutlineLockClosed
                  size={17}
                  style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="أدخل كلمة المرور"
                  id="login-password"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center"
              id="login-submit"
              style={{ width: '100%', padding: '13px 0', fontSize: 15, marginTop: 6 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <svg style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              ليس لديك حساب؟{' '}
              <Link to="/register" style={{ color: 'var(--gold-primary)', fontWeight: 700, textDecoration: 'none' }}>
                سجل كمهندس
              </Link>
            </p>
          </div>
        </div>

        {/* Tagline */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 20, opacity: 0.7 }}>
          نبني ثقة ونحقق طموح
        </p>
      </div>
    </div>
  );
}