---
$schema: "https://tr.designtokens.org/format/2025.10/"
name: "VTeamFit Design System 2026"
version: "2.0.0"
tokens:
  primitive:
    color:
      black:
        $type: "color"
        $value: "oklch(0.000 0.000 0)"        # #000000 - Negro absoluto
      carbon:
        $type: "color"
        $value: "oklch(0.115 0.000 89.9)"     # #050505 - Lienzo base carbón
      surface-dark:
        $type: "color"
        $value: "oklch(0.200 0.000 89.9)"     # #161616 - Base de superficie
      white:
        $type: "color"
        $value: "oklch(1.000 0.000 0)"        # #FFFFFF - Blanco puro
      gold:
        500:
          $type: "color"
          $value: "oklch(0.641 0.075 87.4)"   # #A08A56 - Dorado oficial VTeamFit
        400:
          $type: "color"
          $value: "oklch(0.710 0.075 87.4)"   # #B59F6B - Dorado hover (+L uniforme en OKLCH)
      zinc:
        800:
          $type: "color"
          $value: "oklch(0.274 0.005 286.0)"  # #27272A - Superficie de botón secundario
        700:
          $type: "color"
          $value: "oklch(0.370 0.012 285.8)"  # #3F3F46 - Borde de botón secundario
        400:
          $type: "color"
          $value: "oklch(0.711 0.006 286.0)"  # #A1A1AA - Texto secundario / metadatos
        300:
          $type: "color"
          $value: "oklch(0.871 0.005 286.3)"  # #D4D4D8 - Subtítulos y citas editoriales
      status:
        emerald:
          $type: "color"
          $value: "oklch(0.700 0.165 162.0)"  # #00BB7F - Éxito / Día completado / Intensidad suave
        amber:
          $type: "color"
          $value: "oklch(0.760 0.165 70.0)"   # #F99C00 - Advertencia / Racha / Intensidad media
        red:
          $type: "color"
          $value: "oklch(0.628 0.225 25.0)"   # #FB2C36 - Error / Intensidad fuerte
    font:
      family:
        sans:
          $type: "fontFamily"
          $value: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"]
        mono:
          $type: "fontFamily"
          $value: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
      weight:
        regular:
          $type: "fontWeight"
          $value: 400
        medium:
          $type: "fontWeight"
          $value: 500
        bold:
          $type: "fontWeight"
          $value: 700
        black:
          $type: "fontWeight"
          $value: 900
    radius:
      sm:
        $type: "dimension"
        $value: "0.5rem"     # 8px
      md:
        $type: "dimension"
        $value: "1rem"       # 16px - Miniaturas e inputs
      lg:
        $type: "dimension"
        $value: "1.5rem"     # 24px - Tarjetas de plan y rutinas
      pill:
        $type: "dimension"
        $value: "9999px"     # Botones y badges

  semantic:
    bg:
      canvas:
        $type: "color"
        $value: "{primitive.color.carbon}"
      card:
        $type: "color"
        $value: "oklch(0.200 0.000 89.9 / 0.20)"   # #16161633
      glass:
        $type: "color"
        $value: "oklch(0.000 0.000 0 / 0.40)"      # TopBar & BottomNav con backdrop-blur-xl
      button-secondary:
        $type: "color"
        $value: "{primitive.color.zinc.800}"
    text:
      primary:
        $type: "color"
        $value: "{primitive.color.white}"
      secondary:
        $type: "color"
        $value: "{primitive.color.zinc.300}"
      muted:
        $type: "color"
        $value: "{primitive.color.zinc.400}"
      accent:
        $type: "color"
        $value: "{primitive.color.gold.500}"
    accent:
      primary:
        $type: "color"
        $value: "{primitive.color.gold.500}"
      hover:
        $type: "color"
        $value: "{primitive.color.gold.400}"
      border-subtle:
        $type: "color"
        $value: "oklch(0.641 0.075 87.4 / 0.50)"
      glow:
        $type: "color"
        $value: "oklch(0.641 0.075 87.4 / 0.35)"
    border:
      subtle:
        $type: "color"
        $value: "oklch(1.000 0.000 0 / 0.06)"
      interactive:
        $type: "color"
        $value: "{primitive.color.zinc.700}"
---

# DESIGN.md — Sistema de Diseño y Arquitectura CSS // VTeamFit 2026

> **Estándares Aplicados:**  
> - **D12 ([Evitar Diseño Interfaz Genérica IA.md](file:///C:/00_dossiers_investigacion/Evitar%20Dise%C3%B1o%20Interfaz%20Gen%C3%A9rica%20IA.md#L66-L97)):** Estructura tripartita `DESIGN.md` + Espacio perceptual **OKLCH**.  
> - **D14 ([Tokenización de Imágenes a CSS.md](file:///C:/00_dossiers_investigacion/Tokenizaci%C3%B3n%20de%20Im%C3%A1genes%20a%20CSS.md#L9-L171)):** Taxonomía W3C DTCG 2025.10 (Primitivos $\rightarrow$ Semánticos), fluidez matemática con `clamp()`, metodología **CUBE CSS + Every Layout** y auditoría **WCAG 2.2**.

---

## 1. Dirección Estética y Razonamiento de Marca

La interfaz de **VTeamFit** se construye sobre una estética deportiva sobria, editorial y de alto contraste, gobernada estrictamente por cuatro pilares visuales extraídos de la aplicación oficial (`https://www.vteamfit.app/`):

1. **Lienzo Carbón Táctil (`#050505` + Textura):** El fondo global combina el negro carbón profundo (`--bg-canvas: #050505`) con la trama en repetición continua `/images/carbon-texture-v4.webp` (`background-size: 500px`).
2. **Acento Dorado Mate (`#A08A56`):** Es el único color de marca e identidad. Se reserva para:
   - El botón CTA principal del Hero (`VER PLANES`) y acciones primarias de confirmación.
   - Los precios de los planes (`$19.9`, `$49.9`, `$210`, `$249`).
   - El subrayado seccional (`ELIGE TU PLAN`), el filete editorial vertical de las citas (`border-l-4`) y las insignias destacadas (`PERSONALIZADO`).
3. **Jerarquía Tipográfica Suiza en Blanco Puro (`#FFFFFF`):** Todos los titulares (`H1`, `H2`, `H3`) utilizan `"Helvetica Neue", Helvetica, Arial, sans-serif` en peso **Black (`900`)**, estilo **`italic`**, **`uppercase`** y *tracking* comprimido (`-0.025em` a `-0.05em`), generando impacto atlético sin recurrir a fuentes decorativas externas.
4. **Superficies Silenciosas y Botones Secundarios Neutros:** Las tarjetas de planes descansan sobre superficies traslúcidas oscuras (`#16161633`) con borde casi imperceptible (`rgba(255,255,255,0.06)`). Sus botones internos (`VER PLAN`) son neutros (`zinc-800` `#27272A` con borde `zinc-700` `#3F3F46` y texto `zinc-300` `#D4D4D8`), encendiéndose en dorado `#A08A56` únicamente en estado `:hover` o `:focus-visible`.

---

## 2. Compilación de Tokens a Variables CSS (`:root`)

Siguiendo la Fase 3 de **D14** (`outputReferences: true`), los tokens del Frontmatter YAML se materializan en `:root` manteniendo la separación entre **Capa Primitiva** y **Capa Semántica**:

```css
:root {
  /* ==========================================================================
     1. CAPA PRIMITIVA (Valores Puros en OKLCH y Fallback Hex)
     ========================================================================== */
  --primitive-black: oklch(0 0 0);                     /* #000000 */
  --primitive-carbon: oklch(0.115 0 89.9);             /* #050505 */
  --primitive-surface-dark: oklch(0.200 0 89.9);       /* #161616 */
  --primitive-white: oklch(1 0 0);                     /* #FFFFFF */

  --primitive-gold-500: oklch(0.641 0.075 87.4);       /* #A08A56 - Dorado VTeamFit */
  --primitive-gold-400: oklch(0.710 0.075 87.4);       /* #B59F6B - Dorado Hover */

  --primitive-zinc-800: oklch(0.274 0.005 286.0);      /* #27272A */
  --primitive-zinc-700: oklch(0.370 0.012 285.8);      /* #3F3F46 */
  --primitive-zinc-400: oklch(0.711 0.006 286.0);      /* #A1A1AA */
  --primitive-zinc-300: oklch(0.871 0.005 286.3);      /* #D4D4D8 */

  --primitive-emerald-500: oklch(0.700 0.165 162.0);   /* #00BB7F */
  --primitive-amber-500: oklch(0.760 0.165 70.0);      /* #F99C00 */
  --primitive-red-500: oklch(0.628 0.225 25.0);        /* #FB2C36 */

  /* ==========================================================================
     2. CAPA SEMÁNTICA (Alias Funcionales Consumidos por los Componentes)
     ========================================================================== */
  --bg-canvas: var(--primitive-carbon);
  --bg-card: oklch(0.200 0 89.9 / 0.20);
  --bg-surface-elevated: oklch(0.200 0 89.9 / 0.65);
  --bg-glass: oklch(0 0 0 / 0.40);
  --bg-btn-secondary: var(--primitive-zinc-800);

  --text-primary: var(--primitive-white);
  --text-secondary: var(--primitive-zinc-300);
  --text-muted: var(--primitive-zinc-400);
  --text-accent: var(--primitive-gold-500);

  --accent-primary: var(--primitive-gold-500);
  --accent-hover: var(--primitive-gold-400);
  --accent-glow: oklch(0.641 0.075 87.4 / 0.35);
  --accent-border: oklch(0.641 0.075 87.4 / 0.50);

  --border-subtle: oklch(1 0 0 / 0.06);
  --border-interactive: var(--primitive-zinc-700);

  --state-success: var(--primitive-emerald-500);
  --state-warning: var(--primitive-amber-500);
  --state-danger: var(--primitive-red-500);

  /* Textura Oficial */
  --texture-carbon: url('/images/carbon-texture-v4.webp');
  --texture-size: 500px;

  /* Radios Estandarizados */
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --radius-pill: 9999px;
}
```

---

## 3. Tipografía y Espaciado Fluido Matemático (`clamp()`)

Aplicando la **Deducción Analítica de Interpolación Lineal** de **D14** entre un viewport móvil mínimo ($V_{\min} = 320\text{px}$) y un escritorio estándar ($V_{\max} = 1280\text{px}$), se eliminan los saltos bruscos de tamaño mediante funciones `clamp(min, pendiente_vw + intersección_rem, max)`:

```css
:root {
  --font-sans: "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

  /* H1 Hero Display ("TU MEJOR VERSIÓN"): 48px (3rem) @ 320px -> 72px (4.5rem) @ 1280px */
  --font-size-hero: clamp(3rem, 2.5vw + 2.5rem, 4.5rem);

  /* H2 Editorial Grande ("VICKY TORRES"): 36px (2.25rem) @ 320px -> 60px (3.75rem) @ 1280px */
  --font-size-h2-xl: clamp(2.25rem, 2.5vw + 1.75rem, 3.75rem);

  /* H2 Sección ("ELIGE TU PLAN"): 36px (2.25rem) @ 320px -> 48px (3rem) @ 1280px */
  --font-size-h2: clamp(2.25rem, 1.25vw + 2rem, 3rem);

  /* H3 Título de Tarjeta y Precio ("PLAN PÁDEL", "$49.9"): 24px (1.5rem) @ 320px -> 30px (1.875rem) @ 1280px */
  --font-size-h3: clamp(1.5rem, 0.625vw + 1.375rem, 1.875rem);

  /* Cita Editorial / Subtítulo Hero: 18px (1.125rem) @ 320px -> 20px (1.25rem) @ 1280px */
  --font-size-lead: clamp(1.125rem, 0.2vw + 1.06rem, 1.25rem);

  /* Cuerpo General y Botones: 16px (1rem) */
  --font-size-body: 1rem;

  /* Micro-etiquetas, Badges y Navegación: 12px (0.75rem) */
  --font-size-label: 0.75rem;

  /* Escala Espacial Fluida */
  --space-fluid-sm: clamp(0.75rem, 0.5vw + 0.6rem, 1rem);
  --space-fluid-md: clamp(1.25rem, 1vw + 1rem, 2rem);
  --space-fluid-lg: clamp(2rem, 2vw + 1.5rem, 3.5rem);
  --space-fluid-section: clamp(4rem, 5vw + 2.5rem, 7rem);
}
```

### Reglas Tipográficas Invariantes

| Rol Tipográfico | Familia | Peso / Estilo | Tamaño Token | Tracking | Leading | Transformación |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero (`H1`)** | `var(--font-sans)` | `900` / `italic` | `var(--font-size-hero)` | `-0.025em` | `1.0` | `uppercase` |
| **Sección (`H2`)** | `var(--font-sans)` | `900` / `italic` | `var(--font-size-h2)` | `-0.05em` | `1.0` | `uppercase` |
| **Título de Plan (`H3`)** | `var(--font-sans)` | `900` / `italic` | `var(--font-size-h3)` | `-0.025em` | `1.25` | `uppercase` |
| **Precio (`$49.9`)** | `var(--font-sans)` | `900` / `normal` | `var(--font-size-h3)` | `-0.05em` | `1.2` | `uppercase` |
| **Botones (`VER PLANES`)** | `var(--font-sans)` | `700` / `normal` | `var(--font-size-body)` | `+0.10em` | `1.5` | `uppercase` |
| **Badges y TopBar CTA** | `var(--font-sans)` | `900` / `normal` | `var(--font-size-label)` | `+0.10em` | `1.33` | `uppercase` |

---

## 4. Auditoría Matemática de Contraste (Normativa WCAG 2.2)

De acuerdo con **D14 (§Auditoría Visual de Contraste WCAG 2.2)**, todos los pares semánticos de texto y controles interactivos cumplen o superan los umbrales normativos:

| Par Semántico (Texto / Control vs. Fondo) | Hex Equivalente | Ratio Calculado | Umbral WCAG 2.2 | Veredicto |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` (`#FFFFFF`) sobre `--bg-canvas` (`#050505`) | Blanco sobre Carbón | **`20.38 : 1`** | `7.0 : 1` (AAA) | **PASA AAA+** |
| `--text-secondary` (`#D4D4D8`) sobre `--bg-canvas` (`#050505`) | Zinc-300 sobre Carbón | **`13.79 : 1`** | `7.0 : 1` (AAA) | **PASA AAA+** |
| `--text-secondary` (`#D4D4D8`) sobre `--bg-btn-secondary` (`#27272A`) | Botón `VER PLAN` | **`10.08 : 1`** | `4.5 : 1` (AA) | **PASA AAA** |
| `--text-accent` (`#A08A56`) sobre `--bg-canvas` (`#050505`) | Dorado sobre Carbón | **`6.08 : 1`** | `4.5 : 1` (AA Texto) | **PASA AA+** |
| `--text-primary` (`#FFFFFF` Bold) sobre `--accent-primary` (`#A08A56`) | Botón `VER PLANES` y Badges | **`3.35 : 1`** | `3.0 : 1` (AA UI / Bold) | **PASA AA** |

---

## 5. Arquitectura Espacial: CUBE CSS y Primitivas *Every Layout*

Siguiendo **D14 (§Arquitectura Espacial Moderna y Metodología CUBE CSS)**:

1. **Macro Layout con CSS Grid:**
   - La grilla del catálogo de planes (`#planes`) y las secciones de dos columnas utilizan exclusivamente **CSS Grid**: `grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr))` con `gap: var(--space-fluid-md)`.
2. **Micro Layout con CSS Flexbox:**
   - La barra superior (`TopBar`), el dock inferior (`BottomNav`), las píldoras de metadatos y las cabeceras de bloque de ejercicios usan **Flexbox** (`display: flex; align-items: center; justify-content: space-between`).
3. **Primitivas *Every Layout* (`Stack` y `Cluster`):**
   - **`Stack` (Flujo vertical rítmico):**
     ```css
     .stack > * + * {
       margin-block-start: var(--stack-space, var(--space-fluid-md));
     }
     ```
   - **`Cluster` (Agrupación horizontal adaptable de chips/categorías):**
     ```css
     .cluster {
       display: flex;
       flex-wrap: wrap;
       gap: var(--cluster-space, 0.5rem);
       align-items: center;
     }
     ```
4. **Excepciones de Estado con `data-state` (CUBE CSS):**
   - Los estados visuales de tarjetas y días de entrenamiento se gobiernan por atributos semánticos HTML en lugar de cadenas interminables de clases condicionales:
     - `data-state="active"` (Semana o día actual con borde dorado `--accent-primary`).
     - `data-state="completed"` (Día o ejercicio completado con indicador `--state-success`).
     - `data-state="rest"` (Día de descanso).

---

## 6. Restricciones Negativas y Guardarraíles Anti-Slop (Obligatorio)

Para evitar la regresión hacia diseños genéricos o la deuda técnica detectada anteriormente, quedan **estrictamente prohibidas** las siguientes prácticas en todo el código del frontend:

1. **Prohibido usar el color naranja `#ff6b4a` como color de botones, textos o insignias:** El único color de acento de marca es el **Dorado VTeamFit (`#A08A56` / `var(--accent-primary)`)**.
2. **Prohibido importar o declarar la fuente `Outfit` u otras fuentes externas:** Toda la interfaz utiliza la pila nativa `var(--font-sans)` (`"Helvetica Neue", Helvetica, Arial, sans-serif`) con peso `900 italic uppercase` en titulares.
3. **Prohibidos los valores arbitrarios ("Magic Numbers") en clases de utilidad:** No escribir `bg-[#...]`, `shadow-[0_0_24px_rgba(...)]`, `w-[600px]` ni `rounded-[2rem]`. Todo color, radio, sombra y espaciado debe consumir las variables semánticas de `:root`.
4. **Prohibidas las sombras grises o blancas sucias en modo oscuro:** La elevación sobre el fondo carbón se resuelve con bordes sutiles (`var(--border-subtle)`), desenfoque de fondo (`backdrop-blur-xl`) en barras flotantes y resplandor dorado (`var(--accent-glow)`) únicamente en el CTA primario.
5. **Prohibido usar emojis como iconografía estructural de navegación:** Usar exclusivamente iconos vectoriales SVG de trazo limpio (`lucide-react`) y el isologotipo oficial `/images/logo.svg`.
