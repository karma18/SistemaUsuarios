import { useEffect, useState } from "react";

const initialState = {
  loading: true,
  error: "",
  data: null
};

function App() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    async function loadHealth() {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("No fue posible consultar el backend.");
        }

        const data = await response.json();

        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            data
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message,
            data: null
          });
        }
      }
    }

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">SistemaUsuarios</p>
        <h1>Aplicacion React con Vite y backend Node.js</h1>
        <p className="description">
          Base inicial del proyecto con frontend y backend separados para
          desarrollo local.
        </p>

        {state.loading && <p className="status">Consultando backend...</p>}

        {state.error && (
          <p className="status error">Error de conexion: {state.error}</p>
        )}

        {state.data && (
          <div className="status-panel">
            <p>
              <strong>Estado:</strong> {state.data.status}
            </p>
            <p>
              <strong>Servicio:</strong> {state.data.service}
            </p>
            <p>
              <strong>Mensaje:</strong> {state.data.message}
            </p>
            <p>
              <strong>Timestamp:</strong> {state.data.timestamp}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;

