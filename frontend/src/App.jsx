import { useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  fetchCatalogs,
  fetchUsers,
  forgotPassword,
  login,
  register,
  updateUser
} from "./api";

const authViews = {
  login: "login",
  register: "register",
  recovery: "recovery"
};

const emptyAuthForms = {
  login: { email: "", password: "" },
  register: { name: "", email: "", password: "", department: "" },
  recovery: { email: "" }
};

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  role: "Analista",
  department: "",
  status: "Activo"
};

function App() {
  const [activeView, setActiveView] = useState(authViews.login);
  const [catalogs, setCatalogs] = useState({ roles: [], statuses: [] });
  const [authForms, setAuthForms] = useState(emptyAuthForms);
  const [authFeedback, setAuthFeedback] = useState({ error: "", success: "" });
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [userFeedback, setUserFeedback] = useState({ error: "", success: "" });
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchCatalogs()
      .then((data) => {
        setCatalogs(data);
        setUserForm((current) => ({
          ...current,
          role: data.roles[1] || "Analista",
          status: data.statuses[0] || "Activo"
        }));
      })
      .catch(() => {
        setAuthFeedback({
          error: "No fue posible cargar el catalogo inicial del sistema.",
          success: ""
        });
      });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    loadUsers();
  }, [currentUser]);

  async function loadUsers() {
    setLoadingUsers(true);
    setUserFeedback({ error: "", success: "" });

    try {
      const response = await fetchUsers();
      setUsers(response.users);
    } catch (error) {
      setUserFeedback({ error: error.message, success: "" });
    } finally {
      setLoadingUsers(false);
    }
  }

  function updateAuthForm(view, field, value) {
    setAuthForms((current) => ({
      ...current,
      [view]: {
        ...current[view],
        [field]: value
      }
    }));
  }

  function handleViewChange(view) {
    setActiveView(view);
    setAuthFeedback({ error: "", success: "" });
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setAuthFeedback({ error: "", success: "" });

    try {
      const response = await login(authForms.login);
      setCurrentUser(response.user);
      setAuthForms((current) => ({
        ...current,
        login: emptyAuthForms.login
      }));
    } catch (error) {
      setAuthFeedback({ error: error.message, success: "" });
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setAuthFeedback({ error: "", success: "" });

    try {
      const response = await register(authForms.register);
      setCurrentUser(response.user);
      setAuthForms((current) => ({
        ...current,
        register: emptyAuthForms.register
      }));
      setAuthFeedback({ error: "", success: response.message });
    } catch (error) {
      setAuthFeedback({ error: error.message, success: "" });
    }
  }

  async function handleRecoverySubmit(event) {
    event.preventDefault();
    setAuthFeedback({ error: "", success: "" });

    try {
      const response = await forgotPassword(authForms.recovery);
      setAuthFeedback({ error: "", success: response.message });
      setAuthForms((current) => ({
        ...current,
        recovery: emptyAuthForms.recovery
      }));
    } catch (error) {
      setAuthFeedback({ error: error.message, success: "" });
    }
  }

  function updateManagedUser(field, value) {
    setUserForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleUserSubmit(event) {
    event.preventDefault();
    setUserFeedback({ error: "", success: "" });

    try {
      const payload = { ...userForm };

      if (!payload.password) {
        delete payload.password;
      }

      const response = editingUserId
        ? await updateUser(editingUserId, payload)
        : await createUser(payload);

      await loadUsers();
      setUserForm({
        ...emptyUserForm,
        role: catalogs.roles[1] || "Analista",
        status: catalogs.statuses[0] || "Activo"
      });
      setEditingUserId("");
      setUserFeedback({ error: "", success: response.message });
    } catch (error) {
      setUserFeedback({ error: error.message, success: "" });
    }
  }

  function handleEditUser(user) {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department: user.department,
      status: user.status
    });
    setUserFeedback({ error: "", success: "" });
  }

  async function handleDeleteUser(userId) {
    setUserFeedback({ error: "", success: "" });

    try {
      const response = await deleteUser(userId);

      if (editingUserId === userId) {
        setEditingUserId("");
        setUserForm({
          ...emptyUserForm,
          role: catalogs.roles[1] || "Analista",
          status: catalogs.statuses[0] || "Activo"
        });
      }

      await loadUsers();
      setUserFeedback({ error: "", success: response.message });
    } catch (error) {
      setUserFeedback({ error: error.message, success: "" });
    }
  }

  function handleCancelEdition() {
    setEditingUserId("");
    setUserForm({
      ...emptyUserForm,
      role: catalogs.roles[1] || "Analista",
      status: catalogs.statuses[0] || "Activo"
    });
    setUserFeedback({ error: "", success: "" });
  }

  function handleLogout() {
    setCurrentUser(null);
    setUsers([]);
    setActiveView(authViews.login);
    setAuthFeedback({ error: "", success: "" });
    handleCancelEdition();
  }

  if (!currentUser) {
    return (
      <main className="auth-layout">
        <section className="brand-panel">
          <p className="brand-kicker">SistemaUsuarios</p>
          <h1>Control de acceso y administracion centralizada</h1>
          <p className="brand-copy">
            Gestiona autenticacion, recuperacion de acceso y mantenimiento del
            catalogo de usuarios desde una experiencia clara y corporativa.
          </p>
          <div className="brand-highlights">
            <article>
              <span>01</span>
              <p>Inicio de sesion y registro listos para operar localmente.</p>
            </article>
            <article>
              <span>02</span>
              <p>Flujo de recuperacion de contrasena integrado al sistema.</p>
            </article>
            <article>
              <span>03</span>
              <p>CRUD completo de usuarios con roles, estado y area.</p>
            </article>
          </div>
          <div className="brand-note">
            <strong>Usuario demo:</strong> admin@empresa.local / Admin123*
          </div>
        </section>

        <section className="auth-panel">
          <div className="tab-strip">
            <button
              className={activeView === authViews.login ? "active" : ""}
              onClick={() => handleViewChange(authViews.login)}
              type="button"
            >
              Login
            </button>
            <button
              className={activeView === authViews.register ? "active" : ""}
              onClick={() => handleViewChange(authViews.register)}
              type="button"
            >
              Registro
            </button>
            <button
              className={activeView === authViews.recovery ? "active" : ""}
              onClick={() => handleViewChange(authViews.recovery)}
              type="button"
            >
              Recuperacion
            </button>
          </div>

          {authFeedback.error && (
            <p className="feedback feedback-error">{authFeedback.error}</p>
          )}

          {authFeedback.success && (
            <p className="feedback feedback-success">{authFeedback.success}</p>
          )}

          {activeView === authViews.login && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <h2>Acceso al sistema</h2>
              <label>
                Correo
                <input
                  type="email"
                  value={authForms.login.email}
                  onChange={(event) =>
                    updateAuthForm(authViews.login, "email", event.target.value)
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  value={authForms.login.password}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.login,
                      "password",
                      event.target.value
                    )
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                Iniciar sesion
              </button>
            </form>
          )}

          {activeView === authViews.register && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <h2>Registro de cuenta</h2>
              <label>
                Nombre completo
                <input
                  type="text"
                  value={authForms.register.name}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.register,
                      "name",
                      event.target.value
                    )
                  }
                />
              </label>
              <label>
                Correo
                <input
                  type="email"
                  value={authForms.register.email}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.register,
                      "email",
                      event.target.value
                    )
                  }
                />
              </label>
              <label>
                Departamento
                <input
                  type="text"
                  value={authForms.register.department}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.register,
                      "department",
                      event.target.value
                    )
                  }
                />
              </label>
              <label>
                Contrasena
                <input
                  type="password"
                  value={authForms.register.password}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.register,
                      "password",
                      event.target.value
                    )
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                Crear cuenta
              </button>
            </form>
          )}

          {activeView === authViews.recovery && (
            <form className="auth-form" onSubmit={handleRecoverySubmit}>
              <h2>Recuperacion de contrasena</h2>
              <label>
                Correo registrado
                <input
                  type="email"
                  value={authForms.recovery.email}
                  onChange={(event) =>
                    updateAuthForm(
                      authViews.recovery,
                      "email",
                      event.target.value
                    )
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                Solicitar recuperacion
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-layout">
      <header className="dashboard-header">
        <div>
          <p className="brand-kicker">Panel corporativo</p>
          <h1>Administracion de usuarios</h1>
          <p className="dashboard-copy">
            Bienvenido, {currentUser.name}. Administra cuentas, roles y estados
            del sistema desde un flujo unificado.
          </p>
        </div>

        <div className="header-actions">
          <div className="current-user-card">
            <span>{currentUser.role}</span>
            <strong>{currentUser.email}</strong>
          </div>
          <button className="secondary-button" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="mini-kicker">Mantenimiento</p>
              <h2>{editingUserId ? "Editar usuario" : "Nuevo usuario"}</h2>
            </div>
            {editingUserId && (
              <button
                className="ghost-button"
                onClick={handleCancelEdition}
                type="button"
              >
                Cancelar edicion
              </button>
            )}
          </div>

          {userFeedback.error && (
            <p className="feedback feedback-error">{userFeedback.error}</p>
          )}

          {userFeedback.success && (
            <p className="feedback feedback-success">{userFeedback.success}</p>
          )}

          <form className="user-form" onSubmit={handleUserSubmit}>
            <label>
              Nombre completo
              <input
                type="text"
                value={userForm.name}
                onChange={(event) =>
                  updateManagedUser("name", event.target.value)
                }
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={userForm.email}
                onChange={(event) =>
                  updateManagedUser("email", event.target.value)
                }
              />
            </label>
            <label>
              Contrasena {editingUserId ? "(opcional)" : ""}
              <input
                type="password"
                value={userForm.password}
                onChange={(event) =>
                  updateManagedUser("password", event.target.value)
                }
              />
            </label>
            <label>
              Departamento
              <input
                type="text"
                value={userForm.department}
                onChange={(event) =>
                  updateManagedUser("department", event.target.value)
                }
              />
            </label>
            <label>
              Rol
              <select
                value={userForm.role}
                onChange={(event) => updateManagedUser("role", event.target.value)}
              >
                {catalogs.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={userForm.status}
                onChange={(event) =>
                  updateManagedUser("status", event.target.value)
                }
              >
                {catalogs.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button className="primary-button" type="submit">
              {editingUserId ? "Guardar cambios" : "Crear usuario"}
            </button>
          </form>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <p className="mini-kicker">Operacion</p>
              <h2>Listado de usuarios</h2>
            </div>
            <button className="ghost-button" onClick={loadUsers} type="button">
              Actualizar
            </button>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <span>Total</span>
              <strong>{users.length}</strong>
            </div>
            <div className="stat-card">
              <span>Activos</span>
              <strong>
                {users.filter((user) => user.status === "Activo").length}
              </strong>
            </div>
            <div className="stat-card">
              <span>Administradores</span>
              <strong>
                {users.filter((user) => user.role === "Administrador").length}
              </strong>
            </div>
          </div>

          {loadingUsers ? (
            <p className="table-empty">Cargando usuarios...</p>
          ) : users.length === 0 ? (
            <p className="table-empty">No hay usuarios registrados.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Area</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.department}</td>
                      <td>
                        <span
                          className={
                            user.status === "Activo"
                              ? "status-pill active"
                              : "status-pill inactive"
                          }
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="table-button"
                          onClick={() => handleEditUser(user)}
                          type="button"
                        >
                          Editar
                        </button>
                        <button
                          className="table-button table-button-danger"
                          onClick={() => handleDeleteUser(user.id)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default App;
