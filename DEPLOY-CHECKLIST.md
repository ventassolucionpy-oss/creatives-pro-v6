# 🚀 Deploy Checklist — Creatives Pro v6
## Generado por auditoría completa

### 1. ANTES DE SUBIR A PRODUCCIÓN

#### Supabase (OBLIGATORIO)
- [ ] Ejecutar `/supabase/schema-v6-final.sql` en el SQL Editor de Supabase
  - Agrega campo `pais` a: profiles, products, pedidos, ab_campaigns
  - Crea tabla `ad_spend_entries` (P&L real)
  - Crea tabla `creadores_ugc` (CRM de creadores)
  - Crea tabla `alertas_config`
  - Corrige constraint `generations_tool_check` con TODOS los tools
  - Agrega campos `upsell_aceptado` y `upsell_producto` a pedidos

#### Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # Nuevo: requerido para webhook de Dropi
ANTHROPIC_API_KEY=...
DROPI_WEBHOOK_SECRET=tu_secret_aqui  # Nuevo: para seguridad del webhook
```

#### Dropi (Configurar webhook)
- [ ] En tu cuenta Dropi → Settings → Webhooks → Agregar URL:
  `https://TU_DOMINIO/api/dropi-webhook`
- [ ] Header: `x-dropi-secret: tu_secret_aqui`
- [ ] Eventos: cambios de estado de pedido

---

### 2. BUGS CORREGIDOS EN ESTA VERSIÓN
| # | Bug | Archivo | Fix |
|---|-----|---------|-----|
| 1 | /whatsapp-flows faltaba | `app/whatsapp-flows/page.tsx` | ✅ Creado completo |
| 2 | parseInt en precio | `app/api/pedidos/route.ts` | ✅ → Number() |
| 3 | Schema SQL con constraints duplicados | `supabase/schema-v6-final.sql` | ✅ Versión única definitiva |
| 4 | FX hardcodeado en 13 lugares | `lib/constants.ts` | ✅ Centralizado |
| 5 | Redirect /tracker sin params | `app/tracker/page.tsx` | ✅ Pasa searchParams |
| 6 | autoPublico() ignora campos producto | `app/campana/page.tsx` | ✅ Lee product.audiencia |
| 7 | gasto_ads no persiste | `app/api/ad-spend/route.ts` | ✅ Nuevo endpoint |
| 8 | Autopilot acciones decorativas | `app/autopilot/page.tsx` | ✅ Navegan a tool real |

---

### 3. NUEVAS HERRAMIENTAS
| Herramienta | Ruta | Estado |
|-------------|------|--------|
| Flujos WhatsApp Business | `/whatsapp-flows` | ✅ Completo |
| Oferta Flash 48-72hs | `/oferta-flash` | ✅ Completo |
| Simulador ROAS Break-Even | `/roas-simulator` | ✅ Completo |
| Logística COD por ciudad | `/logistica-cod` | ✅ Completo |
| Copy Scorer IA | `/copy-scorer` | ✅ Completo |
| Guión UGC Reviews | `/ugc-review` | ✅ Completo |
| CRM Creadores UGC | `/creadores` | ✅ Completo (nuevo) |

---

### 4. MULTI-PAÍS
- [ ] Abrir `/perfil` y seleccionar tu país principal
- El selector de país está disponible en: Dropi, Rentabilidad, War Room,
  Roas Simulator, Logística COD, Oferta Flash, y todos los generadores IA
- FX rates por defecto: PY=6350, CO=4200, MX=17.2 (actualizar en `lib/constants.ts`)

---

### 5. PRÓXIMOS PASOS (Semana 4+)
- [ ] Implementar Meta Marketing API OAuth en `/api/meta-connect/`
- [ ] Web Push Notifications para alertas de ROAS
- [ ] Curva de fatiga visual en A/B Tracker (día 1-7-14-30)
- [ ] Integración FX rates en tiempo real (Fixer.io free tier)
