# Creatives Pro — Guía de Deploy en Vercel

## Stack
- **Next.js 15** (App Router) + **React 19**
- **Supabase** (Auth + Postgres + Storage)
- **Anthropic Claude** (generación de copys)
- **OpenAI DALL-E** (generación de imágenes, opcional)
- **Tailwind CSS v3**

---

## 1. Supabase — Configurar base de datos

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el archivo:
   ```
   supabase/schema-completo.sql
   ```
   (Este archivo ya incluye todo: tablas, RLS, índices y storage)

3. En **Authentication → URL Configuration**:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: `https://tu-dominio.vercel.app/auth/callback`

---

## 2. Variables de entorno en Vercel

En tu proyecto de Vercel → Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `ANTHROPIC_API_KEY` | Tu API key de Anthropic |
| `OPENAI_API_KEY` | Tu API key de OpenAI (opcional) |
| `HOTMART_WEBHOOK_SECRET` | Token para webhook de Hotmart (opcional) |

---

## 3. Deploy en Vercel

```bash
# Opción A: desde la UI de Vercel
# 1. Subir el ZIP o conectar repo
# 2. Framework: Next.js (auto-detectado)
# 3. Root directory: creatives-pro-v4
# 4. Agregar variables de entorno
# 5. Deploy

# Opción B: Vercel CLI
npm i -g vercel
cd creatives-pro-v4
vercel --prod
```

---

## 4. Desarrollo local

```bash
cd creatives-pro-v4
npm install
cp .env.local.example .env.local
# Completar variables en .env.local
npm run dev
```

---

## Estructura del proyecto

```
creatives-pro-v4/
├── app/
│   ├── api/
│   │   ├── generations/     # Generación de copys con Claude
│   │   ├── products/        # CRUD de productos
│   │   ├── ab-tracker/      # Registro de métricas A/B
│   │   ├── generate-image/  # DALL-E (opcional)
│   │   └── webhooks/hotmart/
│   ├── dashboard/           # Página principal
│   ├── creativos/           # Hub de herramientas
│   │   └── ugc/             # Anuncios, Secuencias, Catálogo
│   ├── tracker/             # Tracker personal de ads
│   ├── biblioteca/          # Biblioteca de prompts
│   ├── exportar/            # Export a PDF
│   ├── historial/           # Historial de generaciones
│   ├── ab-tracker/          # A/B Tracker completo
│   └── perfil/
├── components/
│   ├── layout/Navbar.tsx
│   ├── tools/ResultsPanel.tsx
│   ├── wizard/              # WizardPage, ProductModal, etc.
│   └── ugc/                 # Componentes UGC
├── lib/
│   ├── supabase.ts          # Cliente browser
│   ├── supabase-server.ts   # Cliente server + middleware
│   ├── ugc-data.ts          # Datos y configuración UGC
│   └── env.ts               # Validación de variables
├── supabase/
│   └── schema-completo.sql  # ← Ejecutar esto en Supabase
├── types/index.ts
├── vercel.json
└── next.config.js
```
