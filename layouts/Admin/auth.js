import { useState } from 'react';
import supabase from 'lib/supabase';

import style from 'styles/pages/auth.module.css';
import Head from 'next/head';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(undefined);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
    } catch (error) {
      setError(error);
    }
  };

  const handleRegister = async (email, password) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Check your inbox to verify your email');
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div className={style.auth_wrapper}>
      <Head>
        <title>BarArc - Auth</title>
      </Head>
      <div className={style.auth_box}>
        <h1 className={style.header}>Accesso</h1>
        <p className={style.description}>
          Per accedere inserisci le tue credenziali
        </p>
        <input
          className={style.inputField}
          type="email"
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className={style.inputField}
          type="password"
          placeholder="La tua password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            handleLogin(email, password);
          }}
          className={style.button}
          disabled={loading}
        >
          {loading ? 'Loading' : 'Login'}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleRegister(email, password);
          }}
          className={[style.button, style.register].join(' ')}
          disabled={loading}
        >
          {loading ? 'Loading' : 'Registrati'}
        </button>
      </div>
    </div>
  );
}
