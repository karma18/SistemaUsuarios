import { useEffect, useState } from "react";
import {
  createCustomer,
  createSupplier,
  createUser,
  deleteCustomer,
  deleteSupplier,
  deleteUser,
  fetchCatalogs,
  fetchCustomers,
  fetchSuppliers,
  fetchUsers,
  forgotPassword,
  login,
  register,
  updateCustomer,
  updateSupplier,
  updateUser
} from "./api";

const authViews = { login: "login", register: "register", recovery: "recovery" };
const pages = {
  dashboard: "dashboard",
  users: "users",
  customers: "customers",
  suppliers: "suppliers"
};

const emptyAuth = {
  login: { email: "", password: "" },
  register: { name: "", email: "", password: "", department: "" },
  recovery: { email: "" }
};

const baseForms = {
  user: { name: "", email: "", password: "", role: "Analista", department: "", status: "Activo" },
  customer: { name: "", email: "", phone: "", city: "", segment: "Corporativo", status: "Activo" },
  supplier: { name: "", email: "", phone: "", city: "", category: "Servicios", status: "Activo" }
};

function App() {
  const [authView, setAuthView] = useState(authViews.login);
  const [page, setPage] = useState(pages.dashboard);
  const [catalogs, setCatalogs] = useState({ roles: [], statuses: [], customerSegments: [], supplierCategories: [] });
  const [authForms, setAuthForms] = useState(emptyAuth);
  const [authFeedback, setAuthFeedback] = useState({ error: "", success: "" });
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState(baseForms.user);
  const [editingUserId, setEditingUserId] = useState("");
  const [userFeedback, setUserFeedback] = useState({ error: "", success: "" });
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [customerForm, setCustomerForm] = useState(baseForms.customer);
  const [editingCustomerId, setEditingCustomerId] = useState("");
  const [customerFeedback, setCustomerFeedback] = useState({ error: "", success: "" });
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState(baseForms.supplier);
  const [editingSupplierId, setEditingSupplierId] = useState("");
  const [supplierFeedback, setSupplierFeedback] = useState({ error: "", success: "" });
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    fetchCatalogs()
      .then((data) => {
        setCatalogs(data);
        setUserForm({ ...baseForms.user, role: data.roles[1] || "Analista", status: data.statuses[0] || "Activo" });
        setCustomerForm({ ...baseForms.customer, segment: data.customerSegments[0] || "Corporativo", status: data.statuses[0] || "Activo" });
        setSupplierForm({ ...baseForms.supplier, category: data.supplierCategories[2] || "Servicios", status: data.statuses[0] || "Activo" });
      })
      .catch(() => setAuthFeedback({ error: "No fue posible cargar los catalogos del sistema.", success: "" }));
  }, []);

  useEffect(() => {
    if (currentUser) {
      Promise.all([loadUsers(), loadCustomers(), loadSuppliers()]);
    }
  }, [currentUser]);

  const resetUserForm = () =>
    setUserForm({ ...baseForms.user, role: catalogs.roles[1] || "Analista", status: catalogs.statuses[0] || "Activo" });
  const resetCustomerForm = () =>
    setCustomerForm({ ...baseForms.customer, segment: catalogs.customerSegments[0] || "Corporativo", status: catalogs.statuses[0] || "Activo" });
  const resetSupplierForm = () =>
    setSupplierForm({ ...baseForms.supplier, category: catalogs.supplierCategories[2] || "Servicios", status: catalogs.statuses[0] || "Activo" });

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const response = await fetchUsers();
      setUsers(response.users);
    } catch (error) {
      setUserFeedback({ error: error.message, success: "" });
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadCustomers() {
    setLoadingCustomers(true);
    try {
      const response = await fetchCustomers();
      setCustomers(response.customers);
    } catch (error) {
      setCustomerFeedback({ error: error.message, success: "" });
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function loadSuppliers() {
    setLoadingSuppliers(true);
    try {
      const response = await fetchSuppliers();
      setSuppliers(response.suppliers);
    } catch (error) {
      setSupplierFeedback({ error: error.message, success: "" });
    } finally {
      setLoadingSuppliers(false);
    }
  }

  function updateAuthForm(view, field, value) {
    setAuthForms((current) => ({ ...current, [view]: { ...current[view], [field]: value } }));
  }

  function updateForm(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setAuthFeedback({ error: "", success: "" });
    try {
      const response = await login(authForms.login);
      setCurrentUser(response.user);
      setPage(pages.dashboard);
      setAuthForms((current) => ({ ...current, login: emptyAuth.login }));
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
      setPage(pages.dashboard);
      setAuthForms((current) => ({ ...current, register: emptyAuth.register }));
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
      setAuthForms((current) => ({ ...current, recovery: emptyAuth.recovery }));
    } catch (error) {
      setAuthFeedback({ error: error.message, success: "" });
    }
  }

  async function saveUser(event) {
    event.preventDefault();
    setUserFeedback({ error: "", success: "" });
    try {
      const payload = { ...userForm };
      if (!payload.password) delete payload.password;
      const response = editingUserId ? await updateUser(editingUserId, payload) : await createUser(payload);
      await loadUsers();
      setEditingUserId("");
      resetUserForm();
      setUserFeedback({ error: "", success: response.message });
    } catch (error) {
      setUserFeedback({ error: error.message, success: "" });
    }
  }

  async function saveCustomer(event) {
    event.preventDefault();
    setCustomerFeedback({ error: "", success: "" });
    try {
      const response = editingCustomerId ? await updateCustomer(editingCustomerId, customerForm) : await createCustomer(customerForm);
      await loadCustomers();
      setEditingCustomerId("");
      resetCustomerForm();
      setCustomerFeedback({ error: "", success: response.message });
    } catch (error) {
      setCustomerFeedback({ error: error.message, success: "" });
    }
  }

  async function saveSupplier(event) {
    event.preventDefault();
    setSupplierFeedback({ error: "", success: "" });
    try {
      const response = editingSupplierId ? await updateSupplier(editingSupplierId, supplierForm) : await createSupplier(supplierForm);
      await loadSuppliers();
      setEditingSupplierId("");
      resetSupplierForm();
      setSupplierFeedback({ error: "", success: response.message });
    } catch (error) {
      setSupplierFeedback({ error: error.message, success: "" });
    }
  }

  async function removeEntity(remover, loader, resetEditing, setFeedback, entityId) {
    setFeedback({ error: "", success: "" });
    try {
      const response = await remover(entityId);
      await loader();
      resetEditing();
      setFeedback({ error: "", success: response.message });
    } catch (error) {
      setFeedback({ error: error.message, success: "" });
    }
  }

  function logout() {
    setCurrentUser(null);
    setUsers([]);
    setCustomers([]);
    setSuppliers([]);
    setPage(pages.dashboard);
    setAuthView(authViews.login);
    setEditingUserId("");
    setEditingCustomerId("");
    setEditingSupplierId("");
    resetUserForm();
    resetCustomerForm();
    resetSupplierForm();
  }

  if (!currentUser) {
    return (
      <main className="auth-layout">
        <section className="brand-panel">
          <p className="brand-kicker">SistemaUsuarios</p>
          <h1>Control central de operacion comercial y administrativa</h1>
          <p className="brand-copy">Ingresa al sistema para administrar usuarios, clientes y proveedores desde un dashboard corporativo con modulos separados.</p>
          <div className="brand-highlights">
            <article><span>01</span><p>Acceso seguro con login, registro y recuperacion.</p></article>
            <article><span>02</span><p>Dashboard inicial con resumen ejecutivo y accesos directos.</p></article>
            <article><span>03</span><p>CRUDs independientes para usuarios, clientes y proveedores.</p></article>
          </div>
          <div className="brand-note"><strong>Usuario demo:</strong> admin@empresa.local / Admin123*</div>
        </section>

        <section className="auth-panel">
          <div className="tab-strip">
            <button className={authView === authViews.login ? "active" : ""} onClick={() => setAuthView(authViews.login)} type="button">Login</button>
            <button className={authView === authViews.register ? "active" : ""} onClick={() => setAuthView(authViews.register)} type="button">Registro</button>
            <button className={authView === authViews.recovery ? "active" : ""} onClick={() => setAuthView(authViews.recovery)} type="button">Recuperacion</button>
          </div>
          {authFeedback.error && <p className="feedback feedback-error">{authFeedback.error}</p>}
          {authFeedback.success && <p className="feedback feedback-success">{authFeedback.success}</p>}
          {authView === authViews.login && (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <h2>Acceso al sistema</h2>
              <Field label="Correo"><input type="email" value={authForms.login.email} onChange={(event) => updateAuthForm(authViews.login, "email", event.target.value)} /></Field>
              <Field label="Contrasena"><input type="password" value={authForms.login.password} onChange={(event) => updateAuthForm(authViews.login, "password", event.target.value)} /></Field>
              <button className="primary-button" type="submit">Iniciar sesion</button>
            </form>
          )}
          {authView === authViews.register && (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <h2>Registro de cuenta</h2>
              <Field label="Nombre completo"><input type="text" value={authForms.register.name} onChange={(event) => updateAuthForm(authViews.register, "name", event.target.value)} /></Field>
              <Field label="Correo"><input type="email" value={authForms.register.email} onChange={(event) => updateAuthForm(authViews.register, "email", event.target.value)} /></Field>
              <Field label="Departamento"><input type="text" value={authForms.register.department} onChange={(event) => updateAuthForm(authViews.register, "department", event.target.value)} /></Field>
              <Field label="Contrasena"><input type="password" value={authForms.register.password} onChange={(event) => updateAuthForm(authViews.register, "password", event.target.value)} /></Field>
              <button className="primary-button" type="submit">Crear cuenta</button>
            </form>
          )}
          {authView === authViews.recovery && (
            <form className="auth-form" onSubmit={handleRecoverySubmit}>
              <h2>Recuperacion de contrasena</h2>
              <Field label="Correo registrado"><input type="email" value={authForms.recovery.email} onChange={(event) => updateAuthForm(authViews.recovery, "email", event.target.value)} /></Field>
              <button className="primary-button" type="submit">Solicitar recuperacion</button>
            </form>
          )}
        </section>
      </main>
    );
  }

  const sections = {
    [pages.users]: {
      title: "Administracion de usuarios",
      subtitle: "Gestiona cuentas, roles y estado de acceso.",
      createLabel: "Crear usuario",
      updateLabel: "Guardar cambios",
      feedback: userFeedback,
      loading: loadingUsers,
      refresh: loadUsers,
      total: users.length,
      active: users.filter((item) => item.status === "Activo").length,
      editingId: editingUserId,
      cancel: () => {
        setEditingUserId("");
        resetUserForm();
        setUserFeedback({ error: "", success: "" });
      },
      submit: saveUser,
      form: (
        <>
          <Field label="Nombre completo"><input type="text" value={userForm.name} onChange={(event) => updateForm(setUserForm, "name", event.target.value)} /></Field>
          <Field label="Correo"><input type="email" value={userForm.email} onChange={(event) => updateForm(setUserForm, "email", event.target.value)} /></Field>
          <Field label={`Contrasena ${editingUserId ? "(opcional)" : ""}`}><input type="password" value={userForm.password} onChange={(event) => updateForm(setUserForm, "password", event.target.value)} /></Field>
          <Field label="Departamento"><input type="text" value={userForm.department} onChange={(event) => updateForm(setUserForm, "department", event.target.value)} /></Field>
          <Field label="Rol"><select value={userForm.role} onChange={(event) => updateForm(setUserForm, "role", event.target.value)}>{catalogs.roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></Field>
          <Field label="Estado"><select value={userForm.status} onChange={(event) => updateForm(setUserForm, "status", event.target.value)}>{catalogs.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        </>
      ),
      headers: ["Nombre", "Correo", "Rol", "Area", "Estado", "Acciones"],
      rows: users,
      row: (item) => (<><td>{item.name}</td><td>{item.email}</td><td>{item.role}</td><td>{item.department}</td><td><StatusBadge status={item.status} /></td><td className="actions-cell"><ActionButtons onEdit={() => { setEditingUserId(item.id); setUserForm({ name: item.name, email: item.email, password: "", role: item.role, department: item.department, status: item.status }); }} onDelete={() => removeEntity(deleteUser, loadUsers, () => { if (editingUserId === item.id) { setEditingUserId(""); resetUserForm(); } }, setUserFeedback, item.id)} /></td></>)
    },
    [pages.customers]: {
      title: "Administracion de clientes",
      subtitle: "Gestiona cartera comercial y segmentacion.",
      createLabel: "Crear cliente",
      updateLabel: "Guardar cambios",
      feedback: customerFeedback,
      loading: loadingCustomers,
      refresh: loadCustomers,
      total: customers.length,
      active: customers.filter((item) => item.status === "Activo").length,
      editingId: editingCustomerId,
      cancel: () => {
        setEditingCustomerId("");
        resetCustomerForm();
        setCustomerFeedback({ error: "", success: "" });
      },
      submit: saveCustomer,
      form: (
        <>
          <Field label="Nombre del cliente"><input type="text" value={customerForm.name} onChange={(event) => updateForm(setCustomerForm, "name", event.target.value)} /></Field>
          <Field label="Correo"><input type="email" value={customerForm.email} onChange={(event) => updateForm(setCustomerForm, "email", event.target.value)} /></Field>
          <Field label="Telefono"><input type="text" value={customerForm.phone} onChange={(event) => updateForm(setCustomerForm, "phone", event.target.value)} /></Field>
          <Field label="Ciudad"><input type="text" value={customerForm.city} onChange={(event) => updateForm(setCustomerForm, "city", event.target.value)} /></Field>
          <Field label="Segmento"><select value={customerForm.segment} onChange={(event) => updateForm(setCustomerForm, "segment", event.target.value)}>{catalogs.customerSegments.map((segment) => <option key={segment} value={segment}>{segment}</option>)}</select></Field>
          <Field label="Estado"><select value={customerForm.status} onChange={(event) => updateForm(setCustomerForm, "status", event.target.value)}>{catalogs.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        </>
      ),
      headers: ["Nombre", "Correo", "Telefono", "Ciudad", "Segmento", "Estado", "Acciones"],
      rows: customers,
      row: (item) => (<><td>{item.name}</td><td>{item.email}</td><td>{item.phone}</td><td>{item.city}</td><td>{item.segment}</td><td><StatusBadge status={item.status} /></td><td className="actions-cell"><ActionButtons onEdit={() => { setEditingCustomerId(item.id); setCustomerForm({ name: item.name, email: item.email, phone: item.phone, city: item.city, segment: item.segment, status: item.status }); }} onDelete={() => removeEntity(deleteCustomer, loadCustomers, () => { if (editingCustomerId === item.id) { setEditingCustomerId(""); resetCustomerForm(); } }, setCustomerFeedback, item.id)} /></td></>)
    },
    [pages.suppliers]: {
      title: "Administracion de proveedores",
      subtitle: "Gestiona aliados operativos y categoria de servicio.",
      createLabel: "Crear proveedor",
      updateLabel: "Guardar cambios",
      feedback: supplierFeedback,
      loading: loadingSuppliers,
      refresh: loadSuppliers,
      total: suppliers.length,
      active: suppliers.filter((item) => item.status === "Activo").length,
      editingId: editingSupplierId,
      cancel: () => {
        setEditingSupplierId("");
        resetSupplierForm();
        setSupplierFeedback({ error: "", success: "" });
      },
      submit: saveSupplier,
      form: (
        <>
          <Field label="Nombre del proveedor"><input type="text" value={supplierForm.name} onChange={(event) => updateForm(setSupplierForm, "name", event.target.value)} /></Field>
          <Field label="Correo"><input type="email" value={supplierForm.email} onChange={(event) => updateForm(setSupplierForm, "email", event.target.value)} /></Field>
          <Field label="Telefono"><input type="text" value={supplierForm.phone} onChange={(event) => updateForm(setSupplierForm, "phone", event.target.value)} /></Field>
          <Field label="Ciudad"><input type="text" value={supplierForm.city} onChange={(event) => updateForm(setSupplierForm, "city", event.target.value)} /></Field>
          <Field label="Categoria"><select value={supplierForm.category} onChange={(event) => updateForm(setSupplierForm, "category", event.target.value)}>{catalogs.supplierCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></Field>
          <Field label="Estado"><select value={supplierForm.status} onChange={(event) => updateForm(setSupplierForm, "status", event.target.value)}>{catalogs.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        </>
      ),
      headers: ["Nombre", "Correo", "Telefono", "Ciudad", "Categoria", "Estado", "Acciones"],
      rows: suppliers,
      row: (item) => (<><td>{item.name}</td><td>{item.email}</td><td>{item.phone}</td><td>{item.city}</td><td>{item.category}</td><td><StatusBadge status={item.status} /></td><td className="actions-cell"><ActionButtons onEdit={() => { setEditingSupplierId(item.id); setSupplierForm({ name: item.name, email: item.email, phone: item.phone, city: item.city, category: item.category, status: item.status }); }} onDelete={() => removeEntity(deleteSupplier, loadSuppliers, () => { if (editingSupplierId === item.id) { setEditingSupplierId(""); resetSupplierForm(); } }, setSupplierFeedback, item.id)} /></td></>)
    }
  };

  const currentSection = sections[page];
  const summaryCards = [
    { key: pages.users, label: "Usuarios", value: users.length, description: "Control de acceso y perfiles del sistema" },
    { key: pages.customers, label: "Clientes", value: customers.length, description: "Relacion comercial y seguimiento operativo" },
    { key: pages.suppliers, label: "Proveedores", value: suppliers.length, description: "Red de aliados y abastecimiento" }
  ];

  return (
    <main className="workspace-layout">
      <aside className="sidebar-panel">
        <div className="sidebar-brand">
          <p className="brand-kicker">Operacion</p>
          <h1>Dashboard corporativo</h1>
          <p className="sidebar-copy">Accede a los modulos principales desde un solo menu operativo.</p>
        </div>
        <nav className="menu-list">
          {[
            [pages.dashboard, "Dashboard inicial"],
            [pages.users, "CRUD de usuarios"],
            [pages.customers, "CRUD de clientes"],
            [pages.suppliers, "CRUD de proveedores"]
          ].map(([key, label]) => (
            <button key={key} className={page === key ? "menu-item active" : "menu-item"} onClick={() => setPage(key)} type="button">{label}</button>
          ))}
        </nav>
        <div className="sidebar-user">
          <span>{currentUser.role}</span>
          <strong>{currentUser.name}</strong>
          <small>{currentUser.email}</small>
          <button className="secondary-button" onClick={logout} type="button">Cerrar sesion</button>
        </div>
      </aside>

      <section className="content-panel">
        {page === pages.dashboard ? (
          <>
            <header className="dashboard-banner">
              <p className="mini-kicker">Resumen</p>
              <h2>Bienvenido al centro de control</h2>
              <p className="dashboard-copy">Selecciona un modulo desde el menu para administrar usuarios, clientes o proveedores. Este dashboard inicial concentra los indicadores principales del sistema.</p>
            </header>
            <section className="summary-grid">
              {summaryCards.map((card) => (
                <article className="summary-card" key={card.key}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <p>{card.description}</p>
                  <button className="ghost-button" onClick={() => setPage(card.key)} type="button">Ir al modulo</button>
                </article>
              ))}
            </section>
          </>
        ) : (
          <CrudSection section={currentSection} />
        )}
      </section>
    </main>
  );
}

function CrudSection({ section }) {
  return (
    <section className="crud-grid">
      <article className="surface-card">
        <div className="section-heading">
          <div>
            <p className="mini-kicker">Mantenimiento</p>
            <h2>{section.editingId ? "Editar registro" : "Nuevo registro"}</h2>
            <p className="section-copy">{section.subtitle}</p>
          </div>
          {section.editingId && <button className="ghost-button" onClick={section.cancel} type="button">Cancelar edicion</button>}
        </div>
        {section.feedback.error && <p className="feedback feedback-error">{section.feedback.error}</p>}
        {section.feedback.success && <p className="feedback feedback-success">{section.feedback.success}</p>}
        <form className="entity-form" onSubmit={section.submit}>
          {section.form}
          <button className="primary-button" type="submit">
            {section.editingId ? section.updateLabel : section.createLabel}
          </button>
        </form>
      </article>

      <article className="surface-card">
        <div className="section-heading">
          <div>
            <p className="mini-kicker">Operacion</p>
            <h2>{section.title}</h2>
            <p className="section-copy">Consulta y administra los registros existentes.</p>
          </div>
          <button className="ghost-button" onClick={section.refresh} type="button">Actualizar</button>
        </div>
        <div className="stats-row">
          <StatCard label="Total" value={section.total} />
          <StatCard label="Activos" value={section.active} />
          <StatCard label="Inactivos" value={Math.max(section.total - section.active, 0)} />
        </div>
        {section.loading ? (
          <p className="table-empty">Cargando registros...</p>
        ) : section.rows.length === 0 ? (
          <p className="table-empty">No hay registros disponibles.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr>{section.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
              <tbody>{section.rows.map((item) => <tr key={item.id}>{section.row(item)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}

function Field({ label, children }) {
  return <label>{label}{children}</label>;
}

function StatCard({ label, value }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong></div>;
}

function StatusBadge({ status }) {
  return <span className={status === "Activo" ? "status-pill active" : "status-pill inactive"}>{status}</span>;
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <>
      <button className="table-button" onClick={onEdit} type="button">Editar</button>
      <button className="table-button table-button-danger" onClick={onDelete} type="button">Eliminar</button>
    </>
  );
}

export default App;
