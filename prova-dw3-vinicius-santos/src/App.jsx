import { useState, useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

function StatusBar({ message }) {
  return <div className="statusbar">{message}</div>;
}

function AuthScreen({ onStatus }) {
  const [mode, setMode] = useState("login"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Informe o e-mail.";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido.";
    if (!password) e.password = "Informe a senha.";
    else if (password.length < 6) e.password = "Senha deve ter mín. 6 caracteres.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
        onStatus("✔ Conta criada com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        onStatus("✔ Login realizado!");
      }
    } catch (err) {
      const msg = {
        "auth/email-already-in-use": "E-mail já cadastrado.",
        "auth/user-not-found": "Usuário não encontrado.",
        "auth/wrong-password": "Senha incorreta.",
        "auth/invalid-credential": "E-mail ou senha incorretos.",
        "auth/too-many-requests": "Muitas tentativas. Tente mais tarde.",
      }[err.code] || "Erro: " + err.message;
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🛍️</div>
        <h2 className="auth-title">
          CATÁLOGO <span>PRO</span>
        </h2>
        <p className="auth-sub">
          {mode === "login" ? "Entre na sua conta" : "Crie uma nova conta"}
        </p>

        <div className="tab-row">
          <button
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setErrors({}); }}
          >
            Login
          </button>
          <button
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setErrors({}); }}
          >
            Cadastrar
          </button>
        </div>

        {errors.general && <div className="auth-error">{errors.general}</div>}

        <div className="field">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            className={errors.email ? "has-error" : ""}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: null })); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
        </div>

        <div className="field">
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            className={errors.password ? "has-error" : ""}
            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: null })); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
        </div>

        <button className="btn-add" onClick={handleSubmit} disabled={loading}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [statusMsg, setStatusMsg] = useState("Sistema de Produtos");
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const nameRef = useRef(null);

  useEffect(() => {
    document.title = "Sistema de Produtos";
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setProducts([]); return; }
    const q = query(
      collection(db, "users", user.uid, "produtos"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingProducts(false);
    });
    return unsub;
  }, [user]);

  function showStatus(msg) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg("Sistema de Produtos"), 3000);
  }

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Informe o nome do produto.";
    else if (name.trim().length < 2) e.name = "Nome muito curto (mín. 2 caracteres).";
    const parsed = parseFloat(price);
    if (!price) e.price = "Informe o preço.";
    else if (isNaN(parsed) || parsed <= 0) e.price = "Preço deve ser maior que zero.";
    else if (parsed > 999999) e.price = "Preço inválido (muito alto).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleAdd() {
    if (!validate()) return;
    try {
      await addDoc(collection(db, "users", user.uid, "produtos"), {
        nome: name.trim(),
        preco: parseFloat(price),
        criadoEm: serverTimestamp(),
      });
      setName("");
      setPrice("");
      setErrors({});
      showStatus("✔ Produto salvo no Firestore!");
    } catch (err) {
      showStatus("❌ Erro ao salvar: " + err.message);
    }
  }

  async function handleConfirmRemove() {
    try {
      await deleteDoc(doc(db, "users", user.uid, "produtos", confirmId));
      setConfirmId(null);
      showStatus("🗑 Produto removido.");
    } catch (err) {
      showStatus("❌ Erro ao remover: " + err.message);
    }
  }

  async function handleLogout() {
    await signOut(auth);
    showStatus("Sistema de Produtos");
  }

  function focusForm() {
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const confirmProduct = products.find((p) => p.id === confirmId);
  const total = products.reduce((sum, p) => sum + (p.preco || 0), 0);

  if (user === undefined) {
    return (
      <>
        <style>{baseStyles}</style>
        <StatusBar message="Sistema de Produtos" />
        <div className="loading-screen">
          <div className="spinner" />
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <style>{baseStyles}</style>
        <StatusBar message="Sistema de Produtos" />
        <AuthScreen onStatus={showStatus} />
        <footer>
          <strong>Vinicius Gonçalves Oliveira Santos</strong> &nbsp;·&nbsp;{" "}
          {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
        </footer>
      </>
    );
  }

  return (
    <>
      <style>{baseStyles}</style>

      {confirmId && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-icon">🗑️</div>
            <h3>Remover Produto</h3>
            <p>
              Tem certeza que deseja remover <strong>{confirmProduct?.nome}</strong>?<br />
              Essa ação não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="btn-confirm-remove" onClick={handleConfirmRemove}>Remover</button>
            </div>
          </div>
        </div>
      )}

      <StatusBar message={statusMsg} />

      <div className="hero">
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&auto=format"
          alt="E-commerce tema"
        />
        <h1>CATÁLOGO <span>PRO</span></h1>
        <p>Cadastro e listagem de produtos</p>

        <div className="user-bar">
          <span className="user-email">👤 {user.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      <div className="container">

        <div className="stats">
          <div className="stat-box">
            <div className="label">Produtos</div>
            <div className="value">{products.length}</div>
          </div>
          <div className="stat-box">
            <div className="label">Total em Estoque</div>
            <div className="value">R$ {total.toFixed(2)}</div>
          </div>
        </div>

        <div className="form-card">
          <h2>Adicionar Produto</h2>
          <div className="fields-row">
            <div className="field">
              <input
                ref={nameRef}
                type="text"
                placeholder="Nome do produto"
                value={name}
                className={errors.name ? "has-error" : ""}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: null })); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              {errors.name && <span className="error-msg">⚠ {errors.name}</span>}
            </div>
            <div className="field">
              <input
                type="number"
                placeholder="Preço (R$)"
                value={price}
                min="0.01"
                step="0.01"
                className={errors.price ? "has-error" : ""}
                onChange={(e) => { setPrice(e.target.value); if (errors.price) setErrors((p) => ({ ...p, price: null })); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              {errors.price && <span className="error-msg">⚠ {errors.price}</span>}
            </div>
          </div>
          <button className="btn-add" onClick={handleAdd}>
            + Salvar no Firestore
          </button>
        </div>

        <div className="section-title">Produtos Cadastrados</div>
        <div className="product-list">
          {loadingProducts ? (
            <div className="empty"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">📦</span>
              <p>Nenhum produto cadastrado ainda.</p>
              <button className="btn-empty" onClick={focusForm}>
                + Adicionar primeiro produto
              </button>
            </div>
          ) : (
            products.map((p) => (
              <div className="product-item" key={p.id}>
                <div className="product-left">
                  <div className="product-icon">🛍️</div>
                  <div className="product-name">{p.nome}</div>
                </div>
                <div className="product-price">R$ {(p.preco || 0).toFixed(2)}</div>
                <button
                  className="btn-remove"
                  title="Remover produto"
                  onClick={() => setConfirmId(p.id)}
                >✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer>
        <strong>Vinicius Gonçalves Oliveira Santos</strong> &nbsp;·&nbsp;{" "}
        {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
      </footer>
    </>
  );
}

const baseStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { width: 100%; min-height: 100%; }

  :root {
    --black: #0a0a0a;
    --white: #f5f5f5;
    --purple: #7c3aed;
    --purple-light: #a78bfa;
    --purple-dim: #3b1f6e22;
    --gray: #1c1c1c;
    --gray-mid: #2e2e2e;
    --gray-text: #888;
    --red: #f87171;
    --red-dim: #f8717118;
  }

  body {
    background: var(--black);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
  }
  #root { width: 100%; min-height: 100vh; background: var(--black); }

  .statusbar {
    background: var(--purple);
    color: #fff;
    text-align: center;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 8px 16px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .loading-screen {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 80vh; gap: 16px; color: var(--gray-text);
  }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid var(--gray-mid);
    border-top-color: var(--purple);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-wrapper {
    display: flex; align-items: center; justify-content: center;
    min-height: calc(100vh - 100px);
    padding: 24px;
  }
  .auth-card {
    background: var(--gray);
    border: 1px solid var(--gray-mid);
    border-radius: 20px;
    padding: 40px 32px;
    width: 100%; max-width: 400px;
    animation: fadeUp 0.4s ease both;
  }
  .auth-logo { font-size: 2.4rem; text-align: center; margin-bottom: 12px; }
  .auth-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 2.2rem;
    letter-spacing: 0.06em;
    text-align: center;
    color: var(--white);
    margin-bottom: 4px;
  }
  .auth-title span { color: var(--purple-light); }
  .auth-sub {
    text-align: center; color: var(--gray-text);
    font-size: 0.85rem; margin-bottom: 24px;
  }
  .tab-row {
    display: flex; gap: 8px; margin-bottom: 20px;
    background: var(--black); border-radius: 10px; padding: 4px;
  }
  .tab-btn {
    flex: 1; padding: 9px;
    border: none; border-radius: 7px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; font-weight: 600;
    cursor: pointer;
    background: none; color: var(--gray-text);
    transition: background 0.2s, color 0.2s;
  }
  .tab-btn.active { background: var(--purple); color: #fff; }
  .auth-error {
    background: var(--red-dim);
    border: 1px solid var(--red);
    color: var(--red);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.82rem;
    margin-bottom: 14px;
    text-align: center;
  }

  .hero {
    padding: 48px 24px 28px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -60px; left: 50%;
    transform: translateX(-50%);
    width: 520px; height: 320px;
    background: radial-gradient(ellipse at center, #7c3aed44 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-img {
    width: 80px; height: 80px;
    object-fit: cover; border-radius: 50%;
    border: 3px solid var(--purple);
    margin-bottom: 16px;
    box-shadow: 0 0 32px #7c3aed66;
  }
  .hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(2.4rem, 7vw, 4.5rem);
    letter-spacing: 0.05em; line-height: 1;
    color: var(--white);
  }
  .hero h1 span { color: var(--purple-light); }
  .hero > p { color: var(--gray-text); margin-top: 6px; font-size: 0.88rem; }

  .user-bar {
    display: inline-flex; align-items: center; gap: 12px;
    margin-top: 16px;
    background: var(--gray);
    border: 1px solid var(--gray-mid);
    border-radius: 50px;
    padding: 7px 7px 7px 16px;
  }
  .user-email { font-size: 0.8rem; color: var(--gray-text); }
  .btn-logout {
    background: var(--red-dim);
    border: 1px solid var(--red);
    color: var(--red);
    border-radius: 50px;
    padding: 5px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-logout:hover { background: #f8717130; }

  .container { max-width: 680px; margin: 0 auto; padding: 0 20px 40px; }

  .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 28px; }
  .stat-box {
    background: var(--gray); border: 1px solid var(--gray-mid);
    border-radius: 12px; padding: 18px 20px;
  }
  .stat-box .label {
    font-size: 0.72rem; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--gray-text); margin-bottom: 4px;
  }
  .stat-box .value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem; color: var(--purple-light);
  }

  .form-card {
    background: var(--gray); border: 1px solid var(--gray-mid);
    border-radius: 16px; padding: 28px; margin-bottom: 32px;
    animation: fadeUp 0.5s ease both;
  }
  .form-card h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem; letter-spacing: 0.08em;
    color: var(--purple-light); margin-bottom: 20px;
  }
  .fields-row {
    display: grid; grid-template-columns: 1fr 140px; gap: 12px;
  }
  @media (max-width: 500px) { .fields-row { grid-template-columns: 1fr; } }
  .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }

  input {
    background: var(--black); border: 1px solid var(--gray-mid);
    border-radius: 10px; color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; padding: 12px 16px;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
  }
  input::placeholder { color: var(--gray-text); }
  input:focus { border-color: var(--purple); box-shadow: 0 0 0 3px #7c3aed22; }
  input.has-error { border-color: var(--red); box-shadow: 0 0 0 3px var(--red-dim); }
  .error-msg { font-size: 0.75rem; color: var(--red); padding-left: 4px; animation: fadeUp 0.2s ease both; }

  .btn-add {
    width: 100%; padding: 13px;
    background: var(--purple); color: #fff; border: none;
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 0.9rem; letter-spacing: 0.04em;
    cursor: pointer; transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  }
  .btn-add:hover { background: #6d28d9; box-shadow: 0 4px 20px #7c3aed55; }
  .btn-add:active { transform: scale(0.98); }
  .btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.3rem; letter-spacing: 0.08em;
    color: var(--gray-text); margin-bottom: 16px;
  }
  .product-list { display: flex; flex-direction: column; gap: 10px; }
  .product-item {
    background: var(--gray); border: 1px solid var(--gray-mid);
    border-radius: 12px; padding: 16px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    animation: fadeUp 0.35s ease both; transition: border-color 0.2s;
  }
  .product-item:hover { border-color: var(--purple); }
  .product-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
  .product-icon {
    width: 38px; height: 38px; background: var(--purple-dim);
    border-radius: 9px; display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .product-name {
    font-weight: 500; font-size: 0.92rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .product-price {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem;
    color: var(--purple-light); letter-spacing: 0.04em; flex-shrink: 0;
  }
  .btn-remove {
    background: none; border: 1px solid var(--gray-mid); color: var(--gray-text);
    width: 30px; height: 30px; border-radius: 7px; font-size: 0.85rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: color 0.2s, border-color 0.2s, background 0.2s; flex-shrink: 0;
  }
  .btn-remove:hover { color: var(--red); border-color: var(--red); background: var(--red-dim); }

  .empty { text-align: center; color: var(--gray-text); padding: 40px 0 32px; font-size: 0.9rem; }
  .empty-icon { display: block; font-size: 2.4rem; margin-bottom: 10px; }
  .empty p { margin-bottom: 16px; }
  .btn-empty {
    display: inline-block; padding: 10px 22px;
    border: 1px solid var(--purple); color: var(--purple-light);
    background: var(--purple-dim); border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; transition: background 0.2s, box-shadow 0.2s;
  }
  .btn-empty:hover { background: #7c3aed22; box-shadow: 0 0 14px #7c3aed33; }

  .overlay {
    position: fixed; inset: 0; background: #00000099;
    backdrop-filter: blur(4px); z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: fadeIn 0.15s ease;
  }
  .modal {
    background: var(--gray); border: 1px solid var(--gray-mid);
    border-radius: 16px; padding: 32px 28px;
    max-width: 360px; width: 100%; text-align: center;
    animation: fadeUp 0.2s ease both;
  }
  .modal-icon { font-size: 2rem; margin-bottom: 12px; }
  .modal h3 {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem;
    letter-spacing: 0.06em; color: var(--white); margin-bottom: 8px;
  }
  .modal p { font-size: 0.85rem; color: var(--gray-text); margin-bottom: 24px; line-height: 1.6; }
  .modal p strong { color: var(--white); }
  .modal-actions { display: flex; gap: 10px; }
  .btn-cancel {
    flex: 1; padding: 11px; background: none;
    border: 1px solid var(--gray-mid); color: var(--gray-text);
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 0.88rem; cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-cancel:hover { border-color: var(--white); color: var(--white); }
  .btn-confirm-remove {
    flex: 1; padding: 11px; background: var(--red-dim);
    border: 1px solid var(--red); color: var(--red);
    border-radius: 10px; font-family: 'DM Sans', sans-serif;
    font-weight: 600; font-size: 0.88rem; cursor: pointer;
    transition: background 0.2s;
  }
  .btn-confirm-remove:hover { background: #f8717130; }

  footer {
    border-top: 1px solid var(--gray-mid); text-align: center;
    padding: 24px 16px; color: var(--gray-text); font-size: 0.8rem; font-weight: 300;
  }
  footer strong { color: var(--purple-light); font-weight: 600; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
`;