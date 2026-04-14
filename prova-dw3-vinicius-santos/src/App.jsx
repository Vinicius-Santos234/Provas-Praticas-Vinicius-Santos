import { useState, useEffect, useRef } from "react";

const initialProducts = [
  { id: 1, name: "Fone de Ouvido Bluetooth", price: 199.9 },
  { id: 2, name: "Teclado Mecânico RGB", price: 349.9 },
  { id: 3, name: "Mouse Gamer 16000 DPI", price: 249.9 },
];

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Sistema de Produtos");
  const [errors, setErrors] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const nameRef = useRef(null);

  useEffect(() => {
    document.title = "Sistema de Produtos";
  }, []);

  useEffect(() => {
    if (products.length > initialProducts.length) {
      setStatus(`✔ Produto adicionado — ${products.length} itens no catálogo`);
      const timer = setTimeout(() => setStatus("Sistema de Produtos"), 3000);
      return () => clearTimeout(timer);
    }
  }, [products]);

  function validate() {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Informe o nome do produto.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Nome muito curto (mín. 2 caracteres).";
    }

    const parsed = parseFloat(price);
    if (!price) {
      newErrors.price = "Informe o preço.";
    } else if (isNaN(parsed) || parsed <= 0) {
      newErrors.price = "Preço deve ser maior que zero.";
    } else if (parsed > 999999) {
      newErrors.price = "Preço inválido (muito alto).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleAdd() {
    if (!validate()) return;
    setProducts((prev) => [
      ...prev,
      { id: Date.now(), name: name.trim(), price: parseFloat(price) },
    ]);
    setName("");
    setPrice("");
    setErrors({});
  }

  function handleConfirmRemove() {
    setProducts((prev) => prev.filter((p) => p.id !== confirmId));
    setConfirmId(null);
  }

  function focusForm() {
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const confirmProduct = products.find((p) => p.id === confirmId);
  const total = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      <style>{`
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

        #root {
          width: 100%;
          min-height: 100vh;
          background: var(--black);
        }

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
          transition: background 0.4s;
        }

        .hero {
          padding: 56px 24px 32px;
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
          width: 88px; height: 88px;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid var(--purple);
          margin-bottom: 20px;
          box-shadow: 0 0 32px #7c3aed66;
        }
        .hero h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 8vw, 5rem);
          letter-spacing: 0.05em;
          line-height: 1;
          color: var(--white);
        }
        .hero h1 span { color: var(--purple-light); }
        .hero p {
          color: var(--gray-text);
          margin-top: 8px;
          font-size: 0.9rem;
          font-weight: 300;
        }

        .container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 20px 40px;
        }

        .form-card {
          background: var(--gray);
          border: 1px solid var(--gray-mid);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 32px;
          animation: fadeUp 0.5s ease both;
        }
        .form-card h2 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.08em;
          color: var(--purple-light);
          margin-bottom: 20px;
        }

        .fields-row {
          display: grid;
          grid-template-columns: 1fr 140px;
          gap: 12px;
          margin-bottom: 4px;
        }
        @media (max-width: 500px) {
          .fields-row { grid-template-columns: 1fr; }
        }

        .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }

        input {
          background: var(--black);
          border: 1px solid var(--gray-mid);
          border-radius: 10px;
          color: var(--white);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 12px 16px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        input::placeholder { color: var(--gray-text); }
        input:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px #7c3aed22;
        }
        input.has-error {
          border-color: var(--red);
          box-shadow: 0 0 0 3px var(--red-dim);
        }
        .error-msg {
          font-size: 0.75rem;
          color: var(--red);
          padding-left: 4px;
          animation: fadeUp 0.2s ease both;
        }

        .btn-add {
          width: 100%;
          padding: 13px;
          background: var(--purple);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
        }
        .btn-add:hover {
          background: #6d28d9;
          box-shadow: 0 4px 20px #7c3aed55;
        }
        .btn-add:active { transform: scale(0.98); }

        .stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }
        .stat-box {
          background: var(--gray);
          border: 1px solid var(--gray-mid);
          border-radius: 12px;
          padding: 18px 20px;
        }
        .stat-box .label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--gray-text);
          margin-bottom: 4px;
        }
        .stat-box .value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: var(--purple-light);
        }

        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.08em;
          color: var(--gray-text);
          margin-bottom: 16px;
        }
        .product-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .product-item {
          background: var(--gray);
          border: 1px solid var(--gray-mid);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          animation: fadeUp 0.35s ease both;
          transition: border-color 0.2s;
        }
        .product-item:hover { border-color: var(--purple); }
        .product-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
        .product-icon {
          width: 38px; height: 38px;
          background: var(--purple-dim);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .product-name {
          font-weight: 500;
          font-size: 0.92rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-price {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.2rem;
          color: var(--purple-light);
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .btn-remove {
          background: none;
          border: 1px solid var(--gray-mid);
          color: var(--gray-text);
          width: 30px; height: 30px;
          border-radius: 7px;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          flex-shrink: 0;
        }
        .btn-remove:hover {
          color: var(--red);
          border-color: var(--red);
          background: var(--red-dim);
        }

        .empty {
          text-align: center;
          color: var(--gray-text);
          padding: 40px 0 32px;
          font-size: 0.9rem;
        }
        .empty-icon { display: block; font-size: 2.4rem; margin-bottom: 10px; }
        .empty p { margin-bottom: 16px; }
        .btn-empty {
          display: inline-block;
          padding: 10px 22px;
          border: 1px solid var(--purple);
          color: var(--purple-light);
          background: var(--purple-dim);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-empty:hover {
          background: #7c3aed22;
          box-shadow: 0 0 14px #7c3aed33;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: #00000099;
          backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.15s ease;
        }
        .modal {
          background: var(--gray);
          border: 1px solid var(--gray-mid);
          border-radius: 16px;
          padding: 32px 28px;
          max-width: 360px;
          width: 100%;
          text-align: center;
          animation: fadeUp 0.2s ease both;
        }
        .modal-icon { font-size: 2rem; margin-bottom: 12px; }
        .modal h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.06em;
          color: var(--white);
          margin-bottom: 8px;
        }
        .modal p {
          font-size: 0.85rem;
          color: var(--gray-text);
          margin-bottom: 24px;
          line-height: 1.6;
        }
        .modal p strong { color: var(--white); }
        .modal-actions { display: flex; gap: 10px; }
        .btn-cancel {
          flex: 1;
          padding: 11px;
          background: none;
          border: 1px solid var(--gray-mid);
          color: var(--gray-text);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-cancel:hover { border-color: var(--white); color: var(--white); }
        .btn-confirm-remove {
          flex: 1;
          padding: 11px;
          background: var(--red-dim);
          border: 1px solid var(--red);
          color: var(--red);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-confirm-remove:hover { background: #f8717130; }

        footer {
          border-top: 1px solid var(--gray-mid);
          text-align: center;
          padding: 24px 16px;
          color: var(--gray-text);
          font-size: 0.8rem;
          font-weight: 300;
        }
        footer strong { color: var(--purple-light); font-weight: 600; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {confirmId && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-icon">🗑️</div>
            <h3>Remover Produto</h3>
            <p>
              Tem certeza que deseja remover{" "}
              <strong>{confirmProduct?.name}</strong>?<br />
              Essa ação não pode ser desfeita.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmId(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-remove" onClick={handleConfirmRemove}>
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="statusbar">{status}</div>

      <div className="hero">
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop&auto=format"
          alt="E-commerce tema"
        />
        <h1>CATÁLOGO <span>PRO</span></h1>
        <p>Cadastro e listagem de produtos</p>
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
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
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
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors((prev) => ({ ...prev, price: null }));
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              {errors.price && <span className="error-msg">⚠ {errors.price}</span>}
            </div>
          </div>
          <button className="btn-add" onClick={handleAdd}>
            + Adicionar Produto
          </button>
        </div>

        <div className="section-title">Produtos Cadastrados</div>
        <div className="product-list">
          {products.length === 0 ? (
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
                  <div className="product-name">{p.name}</div>
                </div>
                <div className="product-price">R$ {p.price.toFixed(2)}</div>
                <button
                  className="btn-remove"
                  title="Remover produto"
                  onClick={() => setConfirmId(p.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer>
        <strong>Vinicius Gonçalves Oliveira Santos</strong> &nbsp;·&nbsp;{" "}
        {new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </footer>
    </>
  );
}