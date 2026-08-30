import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../store/slices/authSlice.js';

import Icon from '../components/Icon.jsx';

const BADGES = [
  { icon: 'schedule', label: 'Tasa en vivo' },
  { icon: 'star', label: '4.9' },
  { icon: 'verified_user', label: 'Intercambio seguro' },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const authStatus = useSelector((s) => s.auth.status);
  const [isLogin, setIsLogin] = useState(params.get('mode') !== 'register');
  const [showPwd, setShowPwd] = useState(false);
  const [wantSell, setWantSell] = useState(false);
  const [shake, setShake] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bank, setBank] = useState('');
  const [card, setCard] = useState('');
  const [error, setError] = useState('');

  const goBack = () => {
    const from = params.get('next');
    if (from) return navigate(from);
    if (window.history.length > 2) return navigate(-1);
    navigate('/');
  };

  const setMode = (login) => {
    if (login === isLogin) return;
    setIsLogin(login);
    setError('');
    setShake(false);
  };

  const toggleMode = () => setMode(!isLogin);

  const fail = (m) => {
    setShake(true);
    setError(m);
    window.setTimeout(() => setShake(false), 500);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return fail('Completa todos los campos.');
    const r = isLogin
      ? await dispatch(login({ email: email.trim(), password }))
      : await dispatch(
          register({
            email: email.trim(),
            password,
            full_name: fullName.trim() || email.trim(),
            nickname: email.trim().split('@')[0] || null,
            account_holder: fullName.trim() || email.trim(),
            account_number: wantSell ? card.trim() : null,
          })
        );
    if (r.meta?.requestStatus === 'rejected') {
      fail(r.payload || 'Error de conexión.');
      return;
    }
    navigate(params.get('next') || '/billetera');
  };

  return (
    <main className="auth-wrap">
      <div className="auth-aurora">
        <div className="auth-blob a1" />
        <div className="auth-blob a2" />
        <div className="auth-blob a3" />
      </div>
      <div className="auth-dots" />

      <button className="auth-back" onClick={goBack} aria-label="Volver atrás">
        <Icon name="arrow_back" />
      </button>

      <div className="auth-inner">
        <header className="auth-hero">
          <div className="auth-logo">
            <div className="auth-logo-tile">
              <Icon name="currency_exchange" filled />
            </div>
          </div>

          <h1 className="auth-title grad-title" id="screen-title">
            {isLogin ? '¡Entra a lo tuyo!' : '¡Crea tu cuenta asere!'}
          </h1>
          <p className="auth-sub" id="screen-subtitle">
            {isLogin ? 'Accede para continuar tus cambios seguros.' : 'Únete y empieza a operar al instante.'}
          </p>

          <div className="auth-badges">
            {BADGES.map((b) => (
              <span className="auth-badge" key={b.label}>
                <Icon name={b.icon} />
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        </header>

        <div className={`auth-card${shake ? ' auth-shake' : ''}`}>
          <div className="auth-seg" role="tablist" aria-label="Modo de acceso">
            <button
              className={`auth-seg-btn${isLogin ? ' on' : ''}`}
              onClick={() => setMode(true)}
              disabled={authStatus === 'loading'}
            >
              Entrar
            </button>
            <button
              className={`auth-seg-btn${!isLogin ? ' on' : ''}`}
              onClick={() => setMode(false)}
              disabled={authStatus === 'loading'}
            >
              Registrarme
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-field">
              <span className="field-label">Usuario o Correo</span>
              <div className="auth-input-wrap">
                <Icon name="person" />
                <input
                  type="text"
                  placeholder="ej. asere_cuba"
                  autoCapitalize="none"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="auth-field">
                <span className="field-label">Nombre completo</span>
                <div className="auth-input-wrap">
                  <Icon name="badge" />
                  <input type="text" placeholder="Tu nombre real" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="auth-field">
              <span className="field-label">Contraseña</span>
              <div className="auth-input-wrap">
                <Icon name="lock" />
                <input
                  className="pad-r"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="pwd-eye" onClick={() => setShowPwd(!showPwd)} aria-label="Mostrar contraseña">
                  <Icon name={showPwd ? 'visibility' : 'visibility_off'} />
                </button>
              </div>
              {isLogin && (
                <div className="forgot">
                  <a href="#">¿Se te olvidó la clave?</a>
                </div>
              )}
            </div>

            {!isLogin && (
              <div className="auth-extra">
                <div className="auth-divider" />

                <label className="vendor-toggle">
                  <div className="vendor-toggle-label">
                    <span>Registrarme para vender</span>
                    <span>Requiero añadir método de pago</span>
                  </div>
                  <div className="switch">
                    <input type="checkbox" checked={wantSell} onChange={(e) => setWantSell(e.target.checked)} />
                    <span className="slider" />
                  </div>
                </label>

                {wantSell && (
                  <div className="bank-details">
                    <div className="bank-title">
                      <Icon name="account_balance" filled />
                      <span>Datos Bancarios</span>
                    </div>
                    <input className="bank-input" placeholder="Banco (ej. BPA, BANDEC)" value={bank} onChange={(e) => setBank(e.target.value)} />
                    <input
                      className="bank-input"
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                      placeholder="Número de Tarjeta (CUP)"
                      inputMode="numeric"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary btn-block auth-submit" type="submit" disabled={authStatus === 'loading'}>
              <span>{isLogin ? 'Entrar' : 'Registrarme'}</span>
              <Icon name={authStatus === 'loading' ? 'sync' : 'arrow_forward'} />
            </button>
          </form>
        </div>

        <p className="auth-help">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya eres de los nuestros?'}{' '}
          <button className="mode-link" onClick={toggleMode} disabled={authStatus === 'loading'}>
            {isLogin ? 'Crea tu cuenta asere' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </main>
  );
}