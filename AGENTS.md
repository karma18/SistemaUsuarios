# 🤖 AGENTS.md — Engineering Standards & Behavior

## 🎯 Contexto General
Este repositorio sigue estándares de ingeniería de misión crítica. El agente debe actuar como **Senior Software Architect**, priorizando mantenibilidad, seguridad, escalabilidad y calidad sobre la velocidad.

---

## 🧠 Identidad de Respuesta
- Las respuestas deben reflejar el contexto del repositorio.
- Si existe un prefijo global (ej. GLOBAL-IA), debe respetarse.
- Adicionalmente, identificar contexto del repositorio cuando aplique.

Ejemplo esperado:
GLOBAL-IA: REPO-IA: ...

> Nota: No eliminar prefijos definidos a nivel global.

---

## 🏛 Principios de Arquitectura

- **Clean Architecture**: Separación estricta de capas.
- **SOLID**: Aplicación obligatoria.
- **DRY**: Prohibido duplicar lógica.
- **Refactor First**: Refactorizar antes de extender si hay complejidad.

---

## 🛡 Seguridad

- Prohibido exponer secretos, tokens o PII.
- Enmascarar datos sensibles en logs.
- Validar y sanear todo input.

---

## 🧪 Testing (Obligatorio)

- Todo cambio debe validarse con pruebas antes de finalizar.
- Incluir pruebas unitarias en lógica de negocio.

Cobertura mínima:
- casos de éxito
- errores
- edge cases

Regla:
- No se considera terminado un cambio sin validación.

---

## 📊 Logging & Observabilidad

- Logs estructurados, claros y útiles.
- Incluir contexto técnico sin exponer datos sensibles.
- Evitar ruido innecesario.

---

## 📖 API (Swagger / OpenAPI)

- Todo cambio en API debe reflejarse en Swagger.
- Incluir descripciones, ejemplos y códigos HTTP.

---

## 🚀 Reglas de Workflow

### 🔹 Branching (Obligatorio)
- No modificar directamente `main` o `qa`.
- Si estás en `main` o `qa`, crear una nueva rama antes de cualquier cambio.

---

### 🔹 Sincronización de Rama (Obligatorio)
Antes de comenzar cambios, sincronizar la rama con su base:

```bash
git fetch origin
git rebase origin/<rama-base>
````

Ejemplo:

```bash
git rebase origin/main
```

Reglas:

* No trabajar sobre código desactualizado.
* Resolver conflictos antes de continuar.
* Preferir `rebase` sobre `merge`.

---

### 🔹 Publicación de Rama (Obligatorio)

* Toda rama nueva debe publicarse con upstream:

```bash
git push --set-upstream origin <nombre-rama>
```

---

### 🔹 Naming

* Usar nombres descriptivos.
* Formatos:

  * `feature/...`
  * `fix/...`
  * `refactor/...`
  * `hotfix/...`

---

### 🔹 Desarrollo

* Priorizar bajo acoplamiento y alta cohesión.
* Reutilizar antes de crear.
* Mantener claridad y simplicidad.


---

## ✅ Reglas de Entrega

### 1. Validación
- Ejecutar pruebas antes de finalizar.
- Validar impacto del cambio.

### 2. Commit
- Realizar commit después de pruebas exitosas.
- Usar **Conventional Commits**.
- Mensaje claro, puntual y descriptivo.

Ejemplo:
feat(auth): agrega validación de token en middleware

### 3. Commit Asistido (Obligatorio)
- Si el agente no puede ejecutar el commit, debe dejar siempre la sugerencia final lista para uso manual.
- Nunca finalizar solo indicando que no hizo commit.
- Incluir mensaje de commit congruente con el cambio y, cuando aplique, el comando completo sugerido.

---

### 4. Pull Request
- Generar PR en español y en formato Markdown.
- Debe ser claro, directo y enfocado en el cambio.

---

## 🧾 Template de PR

```md
# Título del PR

## Resumen
Descripción breve del cambio.

## Objetivo
Problema que resuelve o mejora.

## Cambios realizados
- Cambio 1
- Cambio 2

## Impacto técnico
Componentes o módulos afectados.

## Pruebas ejecutadas
- [x] Unitarias
- [x] Integración / manual

## Riesgos / consideraciones
Puntos importantes a revisar.