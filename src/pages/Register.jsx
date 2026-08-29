import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/slices/authSlice.js';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [localError, setLocalError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }
    const res = await dispatch(register({ email, password, full_name: fullName }));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div className="auth">
      <form className="card" onSubmit={submit}>
        <h1>Crear cuenta</h1>
        <label>
          Nombre completo
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Contraseña (mín. 8)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Repetir contraseña
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </label>
        {(error || localError) && <p className="error">{error || localError}</p>}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creando...' : 'Registrarme'}
        </button>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Entra</Link>
        </p>
      </form>
    </div>
  );
}
