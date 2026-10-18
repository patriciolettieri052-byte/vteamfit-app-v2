# CATÁLOGO DE IMÁGENES, FOTOS Y ASSETS GRÁFICOS // VTEAMFIT
### Documento Madre v1.1 — Inventario de Activos Visuales y Rutas
> **Framework:** Protocolo de Extracción de Recursos y Assets | Appfabrik by Bamba Scale  
> **Fuente:** Aplicación Web de Producción (https://www.vteamfit.app/) y Repositorio Oficial `vteamfit-2026`  
> **Ubicación Local de Archivos (Logo, Textura y Fotos):**  
> `C:\Users\matil\.gemini\antigravity\scratch\Scale\apps\vteamfit-2026-2027\docs\extraccion_visual\Fotos`  
> **Estructura:** Ruta física local directa, URLs públicas de producción, proporciones de aspecto (`aspect-ratio`), encuadres ópticos y roles funcionales en la interfaz visual.

---

## 1. Identidad de Marca y Texturas de Sistema

> **Directorio Local Base:** `C:\Users\matil\.gemini\antigravity\scratch\Scale\apps\vteamfit-2026-2027\docs\extraccion_visual\Fotos\`

| Nombre de Archivo | Ruta Local Completa (Windows) | URL Pública en Producción | Rol Funcional en la UI | Formato / Características |
| :--- | :--- | :--- | :--- | :--- |
| `logo.svg` | `...\Fotos\logo.svg` | `https://www.vteamfit.app/images/logo.svg` | **Isologotipo Principal:** Cabecera de Landing, pantallas de autenticación (`/login`, `/registro`, `/recuperar`) y cabecera de onboarding. | Vectorial SVG optimizado (`width: 306px`, `height: 153px` en desktop). |
| `carbon-texture-v4.webp` | `...\Fotos\carbon-texture-v4.webp` | `https://www.vteamfit.app/images/carbon-texture-v4.webp` | **Textura Táctica de Fondo:** Aplicada sobre el `body` en repetición continua (`repeat`, `background-size: 500px`) en toda la app. | Raster WebP de alta densidad (534 KB). Tono carbón mate con trama de fibra. |
| `carbon-texture.webp` | `...\Fotos\carbon-texture.webp` | `https://www.vteamfit.app/images/carbon-texture.webp` | **Textura Alternativa:** Textura liviana heredada para soporte de dispositivos móviles antiguos. | WebP comprimido (51 KB). |

---

## 2. Fotografía Editorial y Portadas de Planes

> **Directorio Local Base:** `C:\Users\matil\.gemini\antigravity\scratch\Scale\apps\vteamfit-2026-2027\docs\extraccion_visual\Fotos\fotos\`

| Nombre de Archivo | Ruta Local Completa (Windows) | URL Pública en Producción | Rol en la UI | Proporción & Encuadre Óptico |
| :--- | :--- | :--- | :--- | :--- |
| `inicio.webp` | `...\Fotos\fotos\inicio.webp` | `https://www.vteamfit.app/images/fotos/inicio.webp` | **Hero Background de Portada:** Fondo inmersivo a sangre de la Landing Page principal con Vicky Torres entrenando. | `100vw / 100vh` Fullscreen.<br>`object-cover`<br>`object-[50%_15%]` (móvil)<br>`object-[50%_35%]` (desktop). |
| `transforma-tu-cuerpo.jpg` | `...\Fotos\fotos\transforma-tu-cuerpo.jpg` | `https://www.vteamfit.app/images/fotos/transforma-tu-cuerpo.jpg` | **Portada Plan "Transforma tu Cuerpo":** Tarjeta en grilla de planes de la Landing y Hero de `/planes/transforma-tu-cuerpo`. | `aspect-[100/97]`<br>`object-cover`<br>`object-[center_45%]`. |
| `plan-padel.jpg` | `...\Fotos\fotos\plan-padel.jpg` | `https://www.vteamfit.app/images/fotos/plan-padel.jpg` | **Portada Plan "Plan Pádel":** Tarjeta en grilla de planes y Hero de `/planes/plan-padel`. Fotografía de rendimiento en pista. | `aspect-[100/97]`<br>`object-cover`<br>`object-center`. |
| `gluteos.jpg` | `...\Fotos\fotos\gluteos.jpg` | `https://www.vteamfit.app/images/fotos/gluteos.jpg` | **Portada Plan "Glúteos de Acero":** Tarjeta en grilla de planes y Hero de `/planes/gluteos-de-acero`. | `aspect-[100/97]`<br>`object-cover`<br>`object-center`. |
| `entrena-conmigo2.webp` | `...\Fotos\fotos\entrena-conmigo2.webp` | `https://www.vteamfit.app/images/fotos/entrena-conmigo2.webp` | **Portada Plan "Entrena Conmigo":** Tarjeta en grilla de planes y Hero de `/planes/entrena-conmigo`. Retrato activo de Vicky Torres. | `aspect-[100/97]`<br>`object-cover`<br>`object-top`. |
| `entrena-conmigo.webp` | `...\Fotos\fotos\entrena-conmigo.webp` | `https://www.vteamfit.app/images/fotos/entrena-conmigo.webp` | **Variante de Portada:** Alternativa fotográfica de alta resolución para promociones del plan personalizado. | Proporción vertical `4:5`. |
| `fisico-padel.webp` | `...\Fotos\fotos\fisico-padel.webp` | `https://www.vteamfit.app/images/fotos/fisico-padel.webp` | **Portada "Curso de Físico en Pista de Pádel":** Tarjeta de curso de Tito Allemandi en la Landing y Hero de detalle. | `aspect-[100/97]`<br>`object-cover`<br>`object-center`. |
| `fisico-pista-padel.jpg` | `...\Fotos\fotos\fisico-pista-padel.jpg` | `https://www.vteamfit.app/images/fotos/fisico-pista-padel.jpg` | **Portada Alternativa Pádel:** Fotografía secundaria de entrenamiento en pista para módulos internos. | Proporción horizontal `16:9` / `4:3`. |

---

## 3. Retratos de Autor y Testimoniales

> **Directorio Local Base:** `C:\Users\matil\.gemini\antigravity\scratch\Scale\apps\vteamfit-2026-2027\docs\extraccion_visual\Fotos\fotos\`

| Nombre de Archivo | Ruta Local Completa (Windows) | URL Pública en Producción | Rol en la UI | Proporción & Encuadre Óptico |
| :--- | :--- | :--- | :--- | :--- |
| `vicky-torres2.webp` | `...\Fotos\fotos\vicky-torres2.webp` | `https://www.vteamfit.app/images/fotos/vicky-torres2.webp` | **Avatar Bio de la Landing:** Fotografía circular de Vicky Torres junto a su cita célebre en la sección inferior de la portada. | Circular `1:1` (`w-56 h-56` en móvil / `w-72 h-72` en desktop).<br>`border-[6px] border-carbon`<br>`object-[0%_top]` (móvil) / `object-[30%_center]` (desktop) con `scale-110`. |
| `vicky-personalizado.jpg` | `...\Fotos\fotos\vicky-personalizado.jpg` | `https://www.vteamfit.app/images/fotos/vicky-personalizado.jpg` | **Avatar Pantalla de Espera:** Retrato de Vicky Torres en la pantalla de espera de WhatsApp (`/dashboard/entrena-conmigo/espera`). | Circular `1:1` (`w-32 h-32` / 128x128px).<br>`border-4 border-copper/40`<br>`object-cover object-top`. |
| `IMG_4142.webp` | `...\Fotos\fotos\IMG_4142.webp` | `https://www.vteamfit.app/images/fotos/IMG_4142.webp` | **Material Editorial de Vicky:** Sesión fotográfica de entrenamiento para artículos o promocionales. | Proporción vertical `3:4`. |
| `IMG_4152.JPG.webp` | `...\Fotos\fotos\IMG_4152.JPG.webp` | `https://www.vteamfit.app/images/fotos/IMG_4152.JPG.webp` | **Material Editorial de Técnica:** Sesión fotográfica en exterior deportivo para banners y contenidos. | Proporción vertical `3:4`. |

---

## 4. Fondos de Dashboard y Vistas de Entrenamiento

> **Directorio Local Base:** `C:\Users\matil\.gemini\antigravity\scratch\Scale\apps\vteamfit-2026-2027\docs\extraccion_visual\Fotos\fotos\`

| Nombre de Archivo | Ruta Local Completa (Windows) | URL Pública en Producción | Rol en la UI | Proporción & Encuadre Óptico |
| :--- | :--- | :--- | :--- | :--- |
| `pantalla-semanas.jpg` | `...\Fotos\fotos\pantalla-semanas.jpg` | `https://www.vteamfit.app/images/fotos/pantalla-semanas.jpg` | **Hero de Semana (`SemanaHero`):** Cabecera inmersiva superior en la vista semanal de entrenamiento (`/dashboard/semana/[week]`). | Panorámica de altura variable (`45vh`, mín. `350px`).<br>`object-cover object-[center_top]` con degradado a carbón. |
| `pantalla-seleccion-planes.jpg` | `...\Fotos\fotos\pantalla-seleccion-planes.jpg` | `https://www.vteamfit.app/images/fotos/pantalla-seleccion-planes.jpg` | **Fondo de Selección de Plan:** Cabecera de módulo de selección de programas de suscripción para usuarios activos. | Panorámica horizontal `16:9`. |
| `portada-interna-entrena-conmigo.webp` | `...\Fotos\fotos\portada-interna-entrena-conmigo.webp` | `https://www.vteamfit.app/images/fotos/portada-interna-entrena-conmigo.webp` | **Cabecera Interna de Rutina Custom:** Portada para el panel exclusivo de usuarios de "Entrena Conmigo". | Proporción horizontal `16:9` / `2:1`. |

---

## 5. Recursos Externos y CDN de Videos/Thumbnails

| Recurso | URL Base / Endpoint | Rol en la UI | Notas Técnicas |
| :--- | :--- | :--- | :--- |
| **Bandera de España** | `https://flagcdn.com/es.svg` | Selector de idioma en el header de la Landing y páginas de planes. | Circular de 18x18px (`w-[18px] h-[18px] object-cover rounded-full`). |
| **CDN de Videos y Miniaturas de Ejercicios** | `https://vteamfitnessapp.b-cdn.net/` (Bunny CDN) | Videos demostrativos en HD y posters/miniaturas de cada ejercicio en la lista de rutina y reproductor. | * Formato: MP4 / WebP.<br>* Fallback de miniaturas: Frame al segundo `0.5` del video (`#t=0.5`).<br>* Proporción en tarjeta de ejercicio: Cuadrada `1:1` (`100x100px rounded-[1rem]`). |
