# GymFit / FitApp - Frontend (TP Desarrollo de Software)

Aplicación web Frontend para la gestión integral de un gimnasio (**FitApp**), desarrollada con **React 19**, **Vite** y **Bootstrap 5**. Permite la interacción diferenciada por roles (**Socio**, **Profesor** y **Administrador**) consumiendo la API REST del Backend.

---

## 👥 Integrantes del Grupo

* **54890** - Anduaga, Morena
* **52221** - España, Agustín
* **54451** - Valvasoni, Máximo
* **53073** - Zuliani, Ignacio

### Repositorios Relacionados
* **Frontend:** [https://github.com/Agusesp1/TP-desarrollo-FRONTEND](https://github.com/Agusesp1/TP-desarrollo-FRONTEND)
* **Backend:** [https://github.com/Agusesp1/TP-desarrollo-BACKEND](https://github.com/Agusesp1/TP-desarrollo-BACKEND)
* **Propuesta del TP:** [PROPUESTA.md](./PROPUESTA.md)

---

## 🛠️ Tecnologías y Arquitectura Frontend

* **Framework Frontend:** React 19 + Vite
* **Enrutamiento:** React Router DOM v7
* **Estilos y UI:** Bootstrap 5 (`react-bootstrap`) + CSS3 Custom Properties (`theme.css`) con enfoque **Mobile-First** y soporte para múltiples breakpoints (`SM`, `MD`, `LG`).
* **Arquitectura:**
  * `src/config/`: Configuración centralizada de variables de entorno y URL base de la API (`api.js`).
  * `src/context/`: Manejo de estado global reactivo para sesión y autenticación (`AuthContext`).
  * `src/components/`: Componentes modulares organizados por rol y funcionalidad (`Admin`, `User`, `Auth`, `Home`, `Navigation`, `Footer`).
  * `src/styles/`: Sistema de diseño, temas y estilos globales (`theme.css`).

---

## 📋 Requisitos Previos

* **Node.js** v18 o superior instalado ([Descargar Node.js](https://nodejs.org/))
* **npm** (incluido con Node.js)
* Tener en ejecución el servidor [Backend (`TP-desarrollo-BACKEND`)](https://github.com/Agusesp1/TP-desarrollo-BACKEND)

---

## 🚀 Instrucciones de Instalación y Ejecución

Sigue estos pasos para instalar y levantar el proyecto en entorno local sin conocimientos previos de su desarrollo:

### 1. Clonar el repositorio
```bash
git clone https://github.com/Agusesp1/TP-desarrollo-FRONTEND.git
cd TP-desarrollo-FRONTEND
```

### 2. Instalar las dependencias
```bash
npm install
```

### 3. Configurar las variables de entorno
Copia el archivo de ejemplo `.env.example` a un nuevo archivo llamado `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Asegúrate de que el archivo `.env` contenga la URL donde se encuentra corriendo tu backend (por defecto `http://localhost:3000`):

```env
VITE_API_URL=http://localhost:3000
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en tu navegador en: **`http://localhost:5173`**

---

## 📜 Scripts Disponibles (`package.json`)

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo de Vite con recarga en caliente (HMR). |
| `npm run build` | Compila y optimiza la aplicación para producción en la carpeta `dist/`. |
| `npm run preview` | Levanta un servidor local para previsualizar el build de producción. |
| `npm run lint` | Ejecuta ESLint para verificar la calidad y guía de estilo del código. |

---

## 🔑 Credenciales de Prueba (Seed Automático del Backend)

Al iniciar el Backend por primera vez, se crean automáticamente datos de prueba y las siguientes cuentas listas para usar:

| Rol | Correo Electrónico | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `administraciongymfit@gmail.com` | `adminfit` |
| **Socio (Al día)** | `juan.perez@gmail.com` | `socio123` |
| **Profesor** | *(Cualquier profesor creado desde el panel Admin)* | Su número de `DNI` (por defecto) |
