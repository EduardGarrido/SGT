# SGT

Aplicación de escritorio para gestión de inventario y ventas, construida con **Electron + React** (frontend) y **PHP + MySQL** (backend).

---

## Requisitos previos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 18 + |
| npm | 9 + |
| Docker + Docker Compose | cualquier versión reciente |

Docker es la forma más sencilla de levantar el backend. También se puede usar PHP 8 instalado localmente.

---

## Ejecución en desarrollo

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Configurar el `.env`

```bash
cp .env.example .env
```

Editar `.env` según el modo elegido:

**Con Docker (recomendado):** los valores por defecto de `.env.example` funcionan sin cambios. Levantar los contenedores:

```bash
docker-compose up
```

Esto inicia MariaDB en el puerto `3307` y el servidor PHP en el puerto `8001`. El esquema y el seeder se aplican automáticamente.

**Sin Docker (requiere MariaDB instalado localmente):**

1. Crear la base de datos y el usuario en MySQL:

```sql
CREATE DATABASE sgtdb;
CREATE USER 'sgt_root'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON sgtdb.* TO 'sgt_root'@'localhost';
FLUSH PRIVILEGES;
```

2. Importar el esquema:

```bash
mysql -u sgt_root -p sgtdb < backend/config/database.sql
```

3. Ajustar el `.env`:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=sgt_root
DB_PASS=tu_contraseña
VITE_API_URL=http://localhost:8000/api
```

### 3. Iniciar la aplicación Electron

```bash
npm run dev
```

Electron arranca el servidor PHP automáticamente (usando el PHP del sistema) y abre la ventana. Los cambios en el renderer se recargan en caliente.

### Credenciales por defecto

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `passadministrador` |

El seeder crea esta cuenta automáticamente en el primer arranque si no existe.

---

## Compilar una versión distribuible

Los binarios de PHP y MariaDB deben colocarse en `resources/` antes de compilar (están en el `.gitignore`). Descárgarlos por separado:

- **PHP** (NTS x64): [php.net](https://www.php.net/downloads) → extraer en `resources/php/{win,linux,mac}/`
- **MariaDB 10.11 LTS**: [mariadb.org](https://mariadb.org/download/) → extraer en `resources/mysql/{win,linux,mac}/`

Luego compilar para la plataforma deseada:

```bash
npm run dist:win    # Windows — instalador NSIS + .zip (ejecutar en Windows)
npm run dist:linux  # Linux   — .tar.gz (ejecutar en Linux)
npm run dist:mac    # macOS   — .dmg (ejecutar en macOS)
```

El resultado se genera en `release/`. La app empaquetada es completamente autónoma: no requiere PHP ni MariaDB en la máquina del usuario final.

---

## Estructura del proyecto

```
src/
  main/         Proceso principal de Electron (arranca PHP siempre; también MySQL en la app empaquetada)
  renderer/     App React (Vite)
    api/        Wrappers de fetch
    components/ Componentes UI reutilizables
    pages/      Páginas por ruta
backend/        PHP 8 sin framework — router único en index.php
  config/       Esquema database.sql + seeder
  models/       Clases de consultas PDO
resources/      Binarios empaquetados (en .gitignore — descargar por separado)
```

---

## Comandos útiles

```bash
npm run lint             # ESLint con auto-fix
npm run format           # Prettier
docker-compose down      # detener contenedores (los datos persisten)
docker-compose down -v   # detener y borrar el volumen de base de datos
```
