# SistemaUsuarios

Aplicacion web local con frontend en React + Vite y backend en Node.js, separados en carpetas independientes.

## Funcionalidades

- Login de usuarios
- Registro de cuentas
- Recuperacion de contrasena
- Dashboard inicial posterior al login
- CRUD de usuarios
- CRUD de clientes
- CRUD de proveedores
- Catalogos de rol y estado

## Usuario demo

- Correo: `admin@empresa.local`
- Contrasena: `Admin123*`

## Estructura

```text
frontend/  -> interfaz React con Vite
backend/   -> API HTTP en Node.js con autenticacion y usuarios
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalacion

### 1. Backend

```bash
cd backend
npm install
```

Configura la conexion local en `backend/.env`.

### 2. Migracion MySQL

Con el servidor MySQL local encendido, ejecuta:

```bash
cd backend
npm run migrate
```

Si recibes `ECONNREFUSED 127.0.0.1:3306`, primero inicia tu servicio local de MySQL o ajusta `backend/.env` con el host y puerto correctos.

### 3. Frontend

```bash
cd frontend
npm install
```

## Ejecucion local

Usa dos terminales separadas.

### Terminal 1: backend

```bash
cd backend
npm run dev
```

El backend inicia en `http://localhost:3001`.

### Terminal 2: frontend

```bash
cd frontend
npm run dev
```

El frontend inicia en `http://localhost:5173`.

## Uso rapido

1. Inicia sesion con el usuario demo o crea una nueva cuenta desde la pantalla de registro.
2. Usa la pestana de recuperacion si quieres probar el flujo de restablecimiento.
3. Tras iniciar sesion, usa el dashboard inicial para navegar a los modulos de usuarios, clientes y proveedores.
4. En cada modulo puedes crear, editar, listar y eliminar registros.

## Scripts disponibles

### Backend

- `npm run dev`: inicia el servidor con recarga usando `node --watch`
- `npm run migrate`: crea la base de datos y las tablas en MySQL
- `npm start`: inicia el servidor en modo normal
- `npm test`: ejecuta las pruebas unitarias con `node:test`

### Frontend

- `npm run dev`: inicia Vite en desarrollo
- `npm run build`: genera el build de produccion
- `npm run preview`: sirve el build generado localmente

## Validacion

### Backend

```bash
cd backend
npm test
```

### Migracion

```bash
cd backend
npm run migrate
```

### Frontend

```bash
cd frontend
npm run build
```
