# SistemaUsuarios

Aplicacion web local con frontend en React + Vite y backend en Node.js, separados en carpetas independientes.

## Estructura

```text
frontend/  -> interfaz React con Vite
backend/   -> API HTTP en Node.js
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

### 2. Frontend

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

## Scripts disponibles

### Backend

- `npm run dev`: inicia el servidor con recarga usando `node --watch`
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

### Frontend

```bash
cd frontend
npm run build
```

