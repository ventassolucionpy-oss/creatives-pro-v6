'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

// --- TIPOS DE CONSULTA ------------------------------------
type ConsultaKey =
  | 'pixel' | 'estructura' | 'cbo_abo' | 'fase_aprendizaje' | 'roas_cae'
  | 'fatiga' | 'advantage_plus' | 'dynamic_ads' | 'retargeting' | 'lookalike'
  | 'presupuesto' | 'creativos' | 'dropi_paraguay' | 'pixel_dropi' | 'costos_paraguay'
  | 'colombia_ads' | 'mexico_ads'

type Consulta = {
  id: ConsultaKey
  titulo: string
  subtitulo: string
  icon: string
  categoria: 'configuracion' | 'estructura' | 'optimizacion' | 'escala' | 'paraguay'
  respuesta: string
  checklist?: string[]
  alerta?: string
  tip_pro?: string
}

// --- BASE DE CONOCIMIENTO HARDCODEADA ---------------------
// Todo esto es conocimiento experto que NO necesita llamada a API
const CONSULTAS: Consulta[] = [
  // PARAGUAY ESPECÍFICO
  {
    id: 'dropi_paraguay',
    titulo: 'Dropi Paraguay — Cómo funciona e integrarlo con Meta',
    subtitulo: 'Configuración completa para dropshipping en Paraguay',
    icon: '🇵🇾',
    categoria: 'paraguay',
    respuesta: `Dropi Paraguay es la plataforma de dropshipping más usada en el país. Funciona como intermediario: vos vendés, Dropi gestiona el stock y el envío al cliente final desde sus depósitos en Paraguay.

CÓMO FUNCIONA EL FLUJO CON META ADS:
1. Encontrás el producto en el catálogo de Dropi Paraguay (dropi.co/py)
2. Creás tu tienda (puede ser una landing simple, un link de pago, o WhatsApp)
3. Lanzás el ad en Meta con el link de tu landing o directamente a WhatsApp
4. El cliente compra — vos recibís el pago
5. Hacés el pedido en Dropi con los datos del cliente y pagás el costo del proveedor
6. Dropi envía el producto al cliente con tu nombre/marca (white label)
7. Tu ganancia = precio de venta − costo Dropi − costo del ad

DIFERENCIAS VS ALIEXPRESS:
✓ Envío desde Paraguay — llega en 1-3 días (no 15-30 días)
✓ Soporte en español paraguayo
✓ Sin problemas de aduana
✓ El cliente puede reclamar en WhatsApp local
✓ Cash on delivery disponible (el cliente paga al recibir)
✗ Menos variedad de productos que AliExpress
✗ Margen generalmente menor que importar directo

CASH ON DELIVERY (COD) EN PARAGUAY:
Esta es la clave del dropshipping paraguayo. El 70%+ de los compradores online en Paraguay prefieren pagar contra entrega porque desconfían del pago online. Si Dropi ofrece COD para tu producto — ACTIVALO. Va a triplicar tu tasa de conversión pero también va a subir tu tasa de devoluciones al 15-25%.

MARGEN REAL CON DROPI:
Si el producto cuesta Gs. 50.000 en Dropi y lo vendés a Gs. 150.000:
- Ganancia bruta: Gs. 100.000
- Costo de ads (asumiendo ROAS 3x): Gs. 150.000 ÷ 3 = Gs. 50.000 en ads → ganancia neta ≈ Gs. 50.000 por venta
- Con ROAS 4x: gastos ads = Gs. 37.500 → ganancia neta ≈ Gs. 62.500 por venta`,
    checklist: [
      'Registrarte en dropi.co/py con tu RUC o cédula',
      'Explorar el catálogo y calcular el margen real (precio venta - costo Dropi - ads)',
      'Activar Cash on Delivery si está disponible para tu producto',
      'Configurar tu método de cobro (Tigo Money, Bancotec, transferencia bancaria)',
      'Crear una landing simple o usar WhatsApp como canal de venta directo',
      'Instalar el Pixel de Meta en tu landing (ver sección Pixel + Dropi)',
    ],
    tip_pro: 'Los productos entre Gs. 80.000 - Gs. 200.000 son el sweet spot en Paraguay. Más caro y la gente desconfía. Más barato y el margen no da para ads.',
    alerta: 'No lances ads hasta tener el sistema de pedidos funcionando. Probá hacer 2-3 pedidos de prueba en Dropi antes de invertir en ads.',
  },
  {
    id: 'pixel_dropi',
    titulo: 'Pixel de Meta + Dropi Paraguay — Configuración exacta',
    subtitulo: 'Cómo trackear conversiones cuando vendés por WhatsApp o landing simple',
    icon: '📊',
    categoria: 'paraguay',
    respuesta: `El mayor problema del dropshipping en Paraguay es el tracking. Muchos venden por WhatsApp y no tienen cómo instalar el Pixel. Acá están las 3 opciones según tu setup:

OPCIÓN A — Si vendés con landing page (Lovable, Tiendanube, etc.):
Es la mejor opción. Instalás el Pixel directamente en la landing y trackeas eventos:
→ PageView (cuando alguien visita la página)
→ InitiateCheckout (cuando hace clic en el botón de compra)
→ Purchase (cuando confirma la compra)
Con esto Meta optimiza para quienes más probabilidad tienen de comprar.

OPCIÓN B — Si vendés solo por WhatsApp (la más común en Paraguay):
Sin landing no podés instalar el Pixel directamente. Opciones:
→ Usar un link de WhatsApp con una micro-landing en el medio (Linktree, Bio.site o un simple HTML)
→ En esa micro-landing instalás el Pixel y le ponés un botón "Comprar por WhatsApp"
→ El Pixel trackea quién hizo clic — Meta puede optimizar para clics al link
→ IMPORTANTE: en este caso usá el objetivo "Clics al enlace" o "Mensajes", NO "Conversiones" (porque Meta no puede saber quién compró finalmente)

OPCIÓN C — Conversiones API (más avanzado pero más preciso):
Cuando el cliente paga (por transferencia, Tigo Money), mandás el evento de compra manualmente a Meta vía Conversions API. Dropi no lo hace automáticamente, pero podés usar herramientas como Make.com o Zapier para automatizarlo.

CONFIGURACIÓN PASO A PASO (Opción A):
1. Ads Manager → Events Manager → Conectar fuentes de datos → Pixel web
2. Copiá el ID del Pixel
3. En tu landing, pegá el código del Pixel en el <head>
4. Agregá el evento de Purchase en el botón de compra o en la página de confirmación
5. Verificá con el Meta Pixel Helper (extensión de Chrome)
6. Esperá 50 eventos de Purchase para que Meta pueda optimizar bien`,
    checklist: [
      'Crear el Pixel en Meta Events Manager (si no lo tenés)',
      'Instalar el Meta Pixel Helper en Chrome para verificar',
      'Elegir la opción de tracking según tu canal de venta (landing / WhatsApp)',
      'Configurar al menos los eventos: PageView + InitiateCheckout + Purchase',
      'Verificar que el Pixel dispare correctamente antes de lanzar ads',
      'Definir el objetivo de campaña correcto según tu tracking disponible',
    ],
    tip_pro: 'En Paraguay muchas ventas se cierran por WhatsApp aunque el ad lleve a una landing. Instalá el Pixel en la landing pero también usá el objetivo "Mensajes" en paralelo para no perder esas conversiones.',
    alerta: 'Si lanzás campañas con objetivo "Conversiones" sin tener al menos 50 eventos de compra en los últimos 30 días, Meta va a gastar mal tu dinero. Empezá con "Tráfico" o "Mensajes" hasta llegar a 50 compras.',
  },
  {
    id: 'costos_paraguay',
    titulo: 'CPMs, CPCs y ROAS reales en Paraguay',
    subtitulo: 'Benchmarks específicos para el mercado paraguayo en 2025',
    icon: '💰',
    categoria: 'paraguay',
    respuesta: `Paraguay es uno de los mercados con menores CPMs de LATAM — esto es una ventaja enorme. Acá están los números reales del mercado:

CPM (Costo por 1000 impresiones):
→ Facebook Feed Paraguay: USD 1.5 - 4
→ Instagram Feed Paraguay: USD 2 - 5
→ Instagram Stories Paraguay: USD 1 - 3
→ Reels Paraguay: USD 1.5 - 3.5
→ Meta Advantage+ Paraguay: USD 1.5 - 4
(Comparado: Argentina USD 3-8, Chile USD 5-12, España USD 8-20)

CPC (Costo por clic):
→ Paraguay promedio: USD 0.10 - 0.40
→ Bueno: < USD 0.25
→ Excelente: < USD 0.15
→ Preocupante: > USD 0.60

ROAS REFERENCIA POR CATEGORÍA (Paraguay 2025):
→ Productos físicos < Gs. 100.000: ROAS 3-5x es bueno, 6x+ es excelente
→ Productos físicos Gs. 100.000 - 250.000: ROAS 2.5-4x es bueno
→ Productos físicos > Gs. 250.000: ROAS 2-3x es bueno (ticket alto, margen alto)
→ Cursos digitales: ROAS 4-8x es bueno (margen 80-90%)
→ COD (contra entrega): el ROAS se ve artificialmente alto porque muchos pedidos se devuelven

TASA DE CONVERSIÓN REFERENCIA:
→ Landing page promedio Paraguay: 2-4%
→ WhatsApp como canal: 5-15% (más alta porque hay interacción humana)
→ COD: +50-100% más conversiones pero +15-25% de devoluciones

HORARIOS DE MENOR COSTO (Paraguay):
→ Madrugada 00-06hs: CPM más bajo pero audiencia menos activa
→ Lunes-martes: generalmente menos competencia de otros anunciantes
→ Sábado 20-23hs: buena combinación de tráfico + costo moderado
→ Viernes y domingo noche: más caro por mayor demanda de anunciantes`,
    tip_pro: 'En Paraguay el COD multiplica las ventas pero también los costos. Calculá el ROAS "neto de devoluciones". Si tenés 25% de devoluciones y tu ROAS bruto es 4x, tu ROAS real es ≈ 3x.',
    alerta: 'Los CPMs en Paraguay están subiendo año a año. En 2022 eran la mitad. No asumas que el mercado siempre va a ser barato — construí hábitos de optimización desde ahora.',
  },

  // CONFIGURACIÓN
  {
    id: 'pixel',
    titulo: 'Cómo configurar el Pixel correctamente',
    subtitulo: 'El Pixel mal configurado desperdicia el 40% del presupuesto',
    icon: '⚡',
    categoria: 'configuracion',
    respuesta: `El Pixel de Meta es el activo más valioso de tu negocio digital. Sin Pixel bien configurado, Meta está volando a ciegas y gastando tu dinero mal.

EVENTOS QUE TENÉS QUE TENER SÍ O SÍ:
1. PageView — se instala solo con el código base
2. ViewContent — cuando alguien ve la página del producto
3. AddToCart — cuando agrega al carrito
4. InitiateCheckout — cuando empieza el checkout
5. Purchase — cuando compra (el más crítico)

ORDEN DE IMPORTANCIA:
Purchase > InitiateCheckout > AddToCart > ViewContent > PageView

CÓMO VERIFICAR QUE FUNCIONA:
Instalá "Meta Pixel Helper" en Chrome. Va a mostrarte qué eventos se disparan en cada página. Si ves errores en rojo — fix inmediato antes de gastar un peso en ads.

CONVERSIONS API (CAPI):
Con iOS 14+ y los cambios de privacidad, el Pixel del browser solo trackea ≈70% de las conversiones. La Conversions API manda los eventos desde tu servidor, dando datos más completos. Si usás Shopify, Tiendanube o WooCommerce tienen integración nativa. Para Dropi + landing simple, necesitás configurarlo manual o con Make.com.

FASE DE APRENDIZAJE DEL PIXEL:
El Pixel necesita mínimo 50 eventos de compra por semana para optimizar bien. Si estás arrancando y no llegás a 50 compras/semana, usá el evento de InitiateCheckout (más fácil de acumular) hasta que tengas suficientes Purchase.`,
    checklist: [
      'Instalar Meta Pixel Helper y verificar que el Pixel dispara en todas las páginas',
      'Confirmar que el evento Purchase se dispara en la página de confirmación de compra',
      'Revisar que no haya eventos duplicados (se ven en el Pixel Helper)',
      'Activar Conversions API si tu plataforma lo permite',
      'Configurar custom conversions si usás WhatsApp como cierre',
      'Crear audiencias personalizadas basadas en eventos del Pixel',
    ],
    tip_pro: 'Nunca cambies el Pixel durante una campaña activa. Esperá a que la campaña esté en pausa o creá un nuevo ad set.',
    alerta: 'Si tu campaña de Conversiones lleva 7 días con menos de 50 eventos de compra, Meta no va a salir de la fase de aprendizaje. Cambiá el objetivo a un evento más arriba en el funnel.',
  },
  {
    id: 'estructura',
    titulo: 'Estructura de campañas — La arquitectura correcta',
    subtitulo: 'CBO vs ABO, cuántos ad sets, cuántos ads por ad set',
    icon: '🏗️',
    categoria: 'estructura',
    respuesta: `La estructura de campañas determina si Meta puede optimizar bien o no. Muchos operadores pierden dinero por tener mal estructuradas sus campañas.

ESTRUCTURA RECOMENDADA PARA ARRANCAR (Paraguay, USD 20-50/día):
Campaña 1 — TESTING (ABO - Ad Set Budget Optimization)
├-- Ad Set 1: Públicos por interés Amplio (sin intereses, solo edad/ubicación)
│   ├-- Ad 1: Imagen estática + Copy PAS
│   ├-- Ad 2: Video UGC + Copy AIDA
│   └-- Ad 3: Carrusel + Copy BAB
├-- Ad Set 2: Intereses específicos de tu nicho
│   └-- (mismo 3 ads)
└-- Ad Set 3: Advantage+ Audience (Meta elige el público)
    └-- (mismo 3 ads)

Presupuesto: USD 5-10/día POR AD SET. Dejar correr 48-72hs mínimo sin tocar.

CUÁNDO MOVER A CBO (Campaign Budget Optimization):
Una vez que tenés un ganador claro (el ad con mejor CTR y CPA), migrás a CBO:
Campaña 2 — ESCALA (CBO)
├-- Ad Set 1: Lookalike 1% de compradores
├-- Ad Set 2: Lookalike 2-3%
├-- Ad Set 3: Intereses ganadores del testing
└-- Ad Set 4: Retargeting (visitantes últimos 30 días)
Presupuesto: USD 50-200/día A NIVEL CAMPAÑA. Meta distribuye solo.

REGLAS DE ORO:
→ Máximo 4-5 ad sets por campaña CBO (más fragmenta el presupuesto)
→ Máximo 3-5 ads por ad set (más y Meta no sabe qué optimizar)
→ Nunca modificar el presupuesto más del 20-25% cada vez
→ Esperar mínimo 48hs después de cualquier cambio antes de evaluar`,
    checklist: [
      'Empezar siempre con ABO para testing — nunca lanzar CBO sin datos previos',
      'Máximo 3 ads por ad set en la fase de testing',
      'Usar Advantage+ Audience en al menos 1 ad set desde el arranque',
      'Esperar 48-72hs antes de tomar cualquier decisión de pausar/escalar',
      'Crear la campaña CBO solo cuando tenés un ganador confirmado',
      'Activar retargeting desde el día 1 (aunque la audiencia sea chica)',
    ],
    tip_pro: 'En Paraguay con presupuestos de USD 10-20/día, ABO funciona mejor que CBO. CBO necesita más volumen para que el algoritmo distribuya bien.',
    alerta: 'No hagas lo que hacen todos: crear 10 ad sets con 5 ads cada uno. Con USD 30/día eso es USD 0.60/día por ad. Meta no puede aprender nada con tan poco volumen.',
  },
  {
    id: 'cbo_abo',
    titulo: 'CBO vs ABO — Cuándo usar cada uno',
    subtitulo: 'La decisión que más impacta el ROAS en escala',
    icon: '⚖️',
    categoria: 'estructura',
    respuesta: `Esta es la pregunta más frecuente y la que más afecta el performance cuando escalás.

ABO (Ad Set Budget Optimization) — VOS controlás el presupuesto:
✓ Control total: decidís cuánto gasta cada ad set
✓ Ideal para testing: podés comparar públicos con el mismo presupuesto
✓ Mejor para presupuestos bajos (< USD 50/día total)
✓ Más predecible en resultados
✗ Más trabajo manual
✗ Meta no puede redistribuir según performance en tiempo real

CBO (Campaign Budget Optimization) — META controla el presupuesto:
✓ Meta redistribuye automáticamente hacia los ad sets que mejor convierten
✓ Menos trabajo manual cuando está bien configurado
✓ Ideal para escala (> USD 50-100/día)
✓ Mejor ROAS en el tiempo cuando el algoritmo aprende bien
✗ Puede gastar todo en 1 ad set si los demás no arrancan bien
✗ Necesita volumen para funcionar correctamente
✗ Más difícil de depurar cuando algo falla

REGLA PRÁCTICA PARA PARAGUAY:
→ USD 0-50/día → ABO siempre
→ USD 50-200/día → CBO para escala, ABO para testing en paralelo
→ USD 200+/día → CBO + Advantage+ Catalog Ads

ADVANTAGE+ SHOPPING CAMPAIGNS (ASC):
Es la versión más automatizada. Meta elige el público, el placement y optimiza todo. Muchos operadores están migrando a ASC porque los resultados en 2024-2025 superan al CBO manual en muchos casos. Requiere tener el catálogo configurado.`,
    tip_pro: 'Nunca pares una campaña CBO que funciona para "arreglar algo". Si algo no funciona, pausá el ad set específico. Tocar la campaña reinicia el aprendizaje.',
    alerta: 'CBO con menos de 3 ad sets activos no tiene sentido — Meta no tiene opciones para redistribuir el presupuesto.',
  },
  {
    id: 'fase_aprendizaje',
    titulo: 'Fase de aprendizaje — Cómo no romperla',
    subtitulo: 'El error más caro en Meta Ads',
    icon: '🧠',
    categoria: 'optimizacion',
    respuesta: `La fase de aprendizaje es el período en que Meta calibra quién recibe tus ads. Romperla significa volver a empezar — dinero quemado.

QUÉ LA ACTIVA (o reinicia):
→ Cambiar el presupuesto en más del 20% de golpe
→ Editar el copy o la imagen de un ad activo
→ Agregar o quitar un ad de un ad set activo
→ Cambiar la estrategia de puja
→ Cambiar el evento de optimización
→ Cambiar la segmentación del ad set

CUÁNTO DURA:
→ Necesitás 50 eventos de optimización (ej: compras) en 7 días
→ Si no llegás a 50 eventos/semana → el ad set queda en "Aprendizaje limitado" permanentemente
→ Con USD 5/día en Paraguay podés tardar 2-4 semanas en acumular 50 compras

QUÉ HACER CUANDO ESTÁS EN "APRENDIZAJE LIMITADO":
Opción 1: Cambiar el evento de optimización a algo más alto en el funnel (InitiateCheckout en lugar de Purchase)
Opción 2: Aumentar el presupuesto para generar más volumen
Opción 3: Ampliar la audiencia para no limitar la entrega
Opción 4: Esperar — a veces el algoritmo sale solo después de 2 semanas

CUÁNDO SÍ SE PUEDE EDITAR SIN ROMPER:
→ Cambiar el presupuesto ≤ 20% está bien
→ Pausar/reactivar un ad (no el ad set) generalmente no reinicia
→ Editar el bid cap no reinicia si usás "Lowest cost"`,
    checklist: [
      'Dejar correr nuevas campañas mínimo 48-72hs antes de tomar decisiones',
      'Aumentar presupuesto en incrementos de 20% máximo cada 48hs',
      'Si necesitás editar un ad — crear uno nuevo y pausar el viejo',
      'Usar el evento InitiateCheckout si no llegás a 50 Purchase/semana',
      'Revisar el estado del ad set (no "En aprendizaje" vs "Activo") antes de evaluar',
    ],
    tip_pro: 'Si tu ad lleva 3 días con resultados malos pero está en fase de aprendizaje — aguantá. Juzgar antes de las 48-72hs y de los 50 eventos es uno de los errores más comunes.',
  },
  {
    id: 'roas_cae',
    titulo: 'ROAS cayó de golpe — Qué hacer',
    subtitulo: 'El troubleshooting paso a paso para cuando los números se rompen',
    icon: '🚨',
    categoria: 'optimizacion',
    respuesta: `El ROAS cae misteriosamente. Antes funcionaba, ahora no. Esto le pasa a todos. Acá está el diagnóstico sistemático:

PASO 1 — ELIMINÁ LAS CAUSAS EXTERNAS (primero esto):
→ ¿Cambió algo en tu landing/tienda? Probá comprar vos mismo
→ ¿El Pixel sigue trackeando? Revisá con Meta Pixel Helper
→ ¿Subieron los precios de tus competidores? (puede ser bueno)
→ ¿Hay un evento estacional? (después de Black Friday el CPM sube)
→ ¿Tu oferta sigue siendo competitiva en precio?

PASO 2 — REVISÁ LAS MÉTRICAS EN ORDEN:
1. CPM subió → más competencia en el mercado, no es tu culpa
2. CTR bajó → el creativo se está agotando (fatiga)
3. CTR está bien pero tasa de conversión bajó → problema en landing/checkout
4. Todo está igual pero ROAS cayó → posiblemente atribución (cambios de iOS)

PASO 3 — DIAGNÓSTICO POR FRECUENCIA:
→ Frecuencia > 3 en 7 días → fatiga confirmada, cambiá los creativos
→ Frecuencia > 2 en 3 días → saturando la audiencia, ampliá el público
→ Frecuencia < 1.5 → no es fatiga, buscá otra causa

PASO 4 — ACCIONES SEGÚN DIAGNÓSTICO:
Si es fatiga de creativo → agregar 2-3 nuevos creativos al ad set. NO pausar el ganador todavía.
Si es saturación de audiencia → duplicar ad set con público lookalike más amplio (3-5%) o ampliar intereses
Si es problema de landing → revisá velocidad de carga, probá en móvil, revisá el precio visible
Si es problema de atribución → comparar con datos de ventas reales vs lo que reporta Meta`,
    tip_pro: 'El lunes suele tener peores métricas en Paraguay. No tomes decisiones los lunes — esperá al martes para evaluar el fin de semana.',
    alerta: 'NUNCA pares una campaña completamente en pánico. Primero identifica la causa. Pausar y reiniciar resetea el aprendizaje y empeora las cosas.',
  },
  {
    id: 'fatiga',
    titulo: 'Fatiga de creativos — Cómo detectarla y combatirla',
    subtitulo: 'Cuándo y cómo renovar los ads sin romper lo que funciona',
    icon: '😴',
    categoria: 'optimizacion',
    respuesta: `La fatiga creativa es inevitable — la audiencia se cansa de ver el mismo ad. Saber cuándo y cómo renovar es lo que separa a los operadores rentables de los que queman plata.

SEÑALES DE FATIGA (en orden de aparición):
1. Frecuencia supera 2.5 en 7 días
2. CTR empieza a bajar gradualmente (semana a semana)
3. CPM empieza a subir (Meta tiene que pagar más para forzar el delivery)
4. Comentarios negativos en el ad ("ya vi este ad 10 veces")
5. ROAS cae — esto es el último síntoma, no el primero

CADA CUÁNTO RENOVAR (según presupuesto):
→ USD 5-20/día: cada 3-4 semanas aproximadamente
→ USD 20-50/día: cada 2 semanas
→ USD 50-100/día: cada 1-2 semanas
→ USD 100+/día: tener siempre 2-3 creativos en testing permanente

CÓMO RENOVAR SIN ROMPER LO QUE FUNCIONA:
NO hagas esto: pausar el ad ganador y meter uno nuevo
SÍ hacé esto:
1. Crear nuevo ad en el mismo ad set (sin pausar el ganador)
2. El nuevo compite con el viejo — Meta va a elegir
3. Después de 7 días, si el nuevo supera al viejo, pausás el viejo
4. Si el nuevo no supera al viejo, pausás el nuevo

VARIANTES DE BAJO COSTO:
Para no tener que producir nuevo contenido desde cero:
→ Cambiar solo el hook (las primeras 3 segundos del video)
→ Cambiar el texto principal manteniendo el visual
→ Versión con música diferente del mismo video
→ Agregar subtítulos al video que no los tenía
→ Versión cuadrada 1:1 de un Reel 9:16 que funcionó`,
    checklist: [
      'Revisar la frecuencia 2 veces por semana en campañas activas',
      'Tener siempre 2-3 creativos "de reserva" listos para subir cuando caiga el ROAS',
      'Crear variantes de hook del creativo ganador cada 2 semanas',
      'No pausar el ganador hasta que el reemplazo demuestre igual o mejor performance',
    ],
    tip_pro: 'El mejor sistema es tener una "creative pipeline" permanente: siempre con 1-2 nuevos creativos en testing, para que cuando el ganador falla, tengas el reemplazo listo.',
  },
  {
    id: 'advantage_plus',
    titulo: 'Advantage+ — Cuándo usarlo y cómo configurarlo',
    subtitulo: 'La apuesta de Meta al targeting automatizado',
    icon: '🤖',
    categoria: 'escala',
    respuesta: `Advantage+ es el sistema de targeting automatizado de Meta. En 2024-2025 está superando al targeting manual en muchos casos porque el algoritmo tiene más datos que cualquier segmentación humana.

TIPOS DE ADVANTAGE+:
1. Advantage+ Audience — Meta elige el público (podés sugerir intereses como guía)
2. Advantage+ Placements — Meta elige dónde mostrar (Feed, Stories, Reels, etc.)
3. Advantage+ Shopping Campaigns (ASC) — Meta controla todo
4. Advantage+ Creative — Meta optimiza el creative (colores, texto, formato)

CUÁNDO USAR ADVANTAGE+ AUDIENCE:
→ Cuando tu campaña manual lleva más de 30 días con datos
→ Cuando tenés al menos 500 eventos de compra en el Pixel
→ Como complemento a tus ad sets manuales, no sustituto
→ Con presupuesto mínimo USD 30-50/día para que tenga datos suficientes

CÓMO CONFIGURAR ASC CORRECTAMENTE:
1. Objetivo: Ventas (Sales)
2. Audiencia: Advantage+ (no segmentés)
3. Subir 10+ creativos distintos (formatos variados)
4. Configurar el catálogo si vendés múltiples productos
5. Presupuesto mínimo: USD 50/día para que Meta pueda explorar

RESULTADO TÍPICO:
En Paraguay, la combinación que mejor funciona es:
→ 70% presupuesto en ASC o Advantage+ Audience (para escala)
→ 30% en ABO manual (para testing de nuevos creativos)`,
    tip_pro: 'Advantage+ Creative puede cambiar tu imagen, texto y botones para "optimizar". Si sos muy cuidadoso con tu marca, desactivalo en la configuración avanzada.',
    alerta: 'Advantage+ no es mágico. Si tu oferta es mala o tu landing no convierte, ningún targeting lo va a salvar.',
  },
  {
    id: 'retargeting',
    titulo: 'Retargeting — La campaña que siempre tiene el mejor ROAS',
    subtitulo: 'Cómo estructurarlo y qué creativos usar en cada audiencia',
    icon: '🎯',
    categoria: 'escala',
    respuesta: `El retargeting es la campaña con mejor ROAS de cualquier operación porque habla con gente que ya te conoce. En Paraguay, donde la confianza es el freno número 1 de la compra, el retargeting puede triplicar el ROAS de cold traffic.

AUDIENCIAS DE RETARGETING (por temperatura):

CALIENTE (mayor conversión):
→ Visitantes de la página de checkout (últimos 7 días) — son los más cercanos a comprar
→ Quienes iniciaron el checkout pero no compraron (últimos 7 días)
→ Compradores anteriores (para upsell/recompra)

TIBIO:
→ Quienes vieron la página del producto por más de 15 segundos (últimos 14 días)
→ Quienes hicieron clic en un ad tuyo (últimos 14 días)
→ Engagement con tu página de Facebook/Instagram (últimos 30 días)

FRÍO-TIBIO:
→ Visitantes del sitio (últimos 30 días)
→ Quienes vieron un video tuyo al 75%+ (últimos 30 días)

CREATIVOS PARA CADA TEMPERATURA:
→ Caliente: oferta directa + urgencia real ("Solo 5 unidades disponibles") + precio con tachado
→ Tibio: testimonios + objeciones respondidas + garantía prominente
→ Frío-tibio: recordatorio del producto + beneficio principal + precio

ESTRUCTURA RECOMENDADA:
Campaña de Retargeting (CBO)
├-- Ad Set 1: Caliente (últimos 7 días) — presupuesto más alto
├-- Ad Set 2: Tibio (últimos 14 días)
└-- Ad Set 3: Frío-tibio (últimos 30 días)

EXCLUIR: Siempre excluir compradores recientes de todas las audiencias de retargeting excepto el ad set de upsell.`,
    tip_pro: 'En Paraguay el retargeting de "quienes preguntaron por WhatsApp pero no compraron" es muy poderoso. Podés subir esa lista manualmente a Meta como audiencia personalizada.',
    checklist: [
      'Crear audiencias personalizadas en Meta basadas en eventos del Pixel',
      'Separar las audiencias por temperatura (7/14/30 días)',
      'Crear creativos específicos para retargeting — no usar los mismos que en cold',
      'Excluir compradores de todas las audiencias de retargeting',
      'Revisar el tamaño de cada audiencia (mínimo 1.000 personas para que funcione)',
    ],
  },
  {
    id: 'lookalike',
    titulo: 'Lookalike Audiences — El activo más valioso después del Pixel',
    subtitulo: 'Cómo crear y usar audiencias similares correctamente',
    icon: '👥',
    categoria: 'escala',
    respuesta: `Los Lookalike (LAL) son audiencias que Meta crea buscando personas similares a tus mejores clientes. Son la herramienta de targeting más poderosa disponible.

FUENTES PARA CREAR LOOKALIKES (de mejor a peor calidad):
1. Compradores (Purchase) — la mejor fuente posible. Mínimo 100 personas.
2. InitiateCheckout — segunda opción si no tenés suficientes compras
3. Lista de clientes cargada manualmente (emails/teléfonos) — muy poderosa
4. Visitantes del sitio — útil pero más genérica
5. Fans de la página — generalmente la peor fuente

PORCENTAJES DE LOOKALIKE:
→ 1% = más parecido a tu audiencia fuente (más específico, menor alcance)
→ 2-3% = balance ideal para escala
→ 5% = más amplio (más alcance, menor precisión)
→ 10% = muy amplio, casi como segmentación por intereses amplios

ESTRATEGIA EN PARAGUAY:
El mercado paraguayo es pequeño. Un LAL 1% de compradores paraguayos puede tener solo 20.000-50.000 personas. Eso es suficiente para empezar pero se va a saturar rápido.
Opciones:
→ Expandir a Argentina + Paraguay juntos en el mismo LAL
→ Usar LAL 3-5% para tener más alcance
→ Alternar entre LAL 1%, LAL 2-3% y LAL 5% en ad sets separados

CUÁNDO CREAR TU PRIMER LOOKALIKE:
Cuando tengas mínimo 50 compras en los últimos 60 días. Antes de eso, los LAL no tienen suficiente data y Meta básicamente adivina.`,
    tip_pro: 'El mejor Lookalike posible no es el 1% de visitantes — es el 1% de compradores que volvieron a comprar más de una vez. Esos son tus mejores clientes y Meta va a encontrar más personas como ellos.',
    alerta: 'Los Lookalike no funcionan si la audiencia fuente es muy pequeña (< 100 personas) o si proviene de una fuente de baja calidad (fans de la página, por ejemplo).',
  },
]


  {
    id: 'colombia_ads',
    titulo: 'Meta Ads en Colombia — Benchmarks y estrategia',
    subtitulo: 'CPMs reales, ROAS y particularidades del mercado colombiano con Dropi CO',
    icon: '\u{1F1E8}\u{1F1F4}',
    categoria: 'paraguay',
    respuesta: `Colombia es el segundo mercado más grande de LATAM. CPM promedio USD 2-5 (30-50% más caro que PY). Tasa de entrega COD ~72%. Ciudades más rentables al inicio: Bogotá + Medellín + Cali.\n\nDIFERENCIAS CLAVE:\n→ Más competitivo — nichos se saturan más rápido\n→ Prueba social es fundamental — el colombiano compara más\n→ "Garantía de devolución" convierte mucho más que en PY\n→ Prices terminados en 9.000 (ej: $89.900 COP)\n\nROAS referencia COD Colombia:\n→ Productos < $100k COP: ROAS 3-4x es bueno\n→ Productos $100k-$250k COP: ROAS 2.5-3.5x\n\nESTRATEGIA:\n1. Empezar Bogotá + Medellín (mejor logística)\n2. Expandir a Cali y Barranquilla con ROAS validado\n3. Interior solo cuando hay datos sólidos`,
    checklist: [
      'Configurar ad set con ubicación Colombia específica',
      'Usar lenguaje colombiano natural (no paraguayismos)',
      'Activar COD en Dropi CO (dropi.co/co)',
      'Incluir "devolvemos tu plata" si producto lo permite',
      'Excluir zonas de logística difícil al inicio',
    ],
    tip_pro: 'En Colombia la garantía y el "te devolvemos el dinero" convierte 20-30% más. El comprador colombiano es más escéptico y necesita más seguridad para el primer impulso.',
  },
  {
    id: 'mexico_ads',
    titulo: 'Meta Ads en México — El mercado más grande de LATAM hispano',
    subtitulo: '130M de personas, mayor competencia y oportunidad con Dropi MX',
    icon: '\u{1F1F2}\u{1F1FD}',
    categoria: 'paraguay',
    respuesta: `México es el mercado de e-commerce más grande de LATAM hispano. Más competitivo pero el volumen justifica el esfuerzo.\n\nCPM MÉXICO 2025:\n→ Facebook Feed MX: USD 2.5 - 6\n→ Instagram/Reels: USD 2 - 5\n→ CDMX y GDL: 20-30% más caro que promedio\n\nROAS referencia COD México:\n→ $350-$700 MXN: ROAS 3-4x\n→ $700-$1200 MXN: ROAS 2.5-3.5x\n→ Tasa de entrega: ~68% (calcular conservador)\n\nLO QUE CONVIERTE EN MÉXICO:\n→ "¡Pagás cuando te llega!" en los primeros 3 segundos del video\n→ Precios terminados en 9: $499, $799, $999 MXN\n→ "Envío gratis + pago al recibir" = combinación ganadora\n→ Testimonios de mexicanos reales — el acento importa\n\nOPORTUNIDAD:\n→ TikTok Shop MX explotando — combinar con Meta Ads\n→ Buen Fin (noviembre) = temporada más grande del año\n→ Norte (MTY, Tijuana) tiene mayor poder adquisitivo`,
    checklist: [
      'Usar pesos mexicanos MXN — nunca mostrar USD al público',
      'Lenguaje mexicano: "ahorita", "padre", "en serio funciona"',
      'Mencionar COD en el hook del video (primeros 3 segundos)',
      'Comenzar CDMX + GDL + MTY antes de abrir al país',
      'Calcular rentabilidad con tasa entrega 65% (conservador)',
    ],
    tip_pro: 'En México el TikTok orgánico combinado con Spark Ads tiene CPMs 40-60% más bajos que Meta para ciertos nichos. Probá ambas plataformas en paralelo desde el inicio.',
    alerta: 'La tasa de entrega en zonas rurales de México puede caer al 50-55%. Empezá con ciudades principales y expandí solo con datos reales de tu producto específico.',
  },

// --- COMPONENTES ------------------------------------------
function ConsultaCard({ c }: { c: Consulta }) {
  const [open, setOpen] = useState(false)
  const catColors: Record<string, string> = {
    configuracion: 'border-blue-500/25 bg-blue-500/5',
    estructura: 'border-violet-500/20 bg-violet-500/5',
    optimizacion: 'border-amber-500/25 bg-amber-500/5',
    escala: 'border-emerald-500/20 bg-emerald-500/5',
    paraguay: 'border-red-500/25 bg-red-500/5',
  }
  const catLabels: Record<string, string> = {
    configuracion: 'Configuración', estructura: 'Estructura',
    optimizacion: 'Optimización', escala: 'Escala', paraguay: '🇵🇾 Paraguay'
  }
  const catTagColors: Record<string, string> = {
    configuracion: 'bg-blue-500/15 text-blue-400', estructura: 'bg-violet-500/15 text-violet-400',
    optimizacion: 'bg-amber-500/15 text-amber-400', escala: 'bg-emerald-500/15 text-emerald-400',
    paraguay: 'bg-red-500/15 text-red-400',
  }

  return (
    <div className={`card border rounded-xl overflow-hidden ${open ? catColors[c.categoria] : 'border-white/8'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full p-4 text-left flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{c.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-white font-semibold text-sm">{c.titulo}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${catTagColors[c.categoria]}`}>{catLabels[c.categoria]}</span>
          </div>
          <p className="text-white/40 text-xs">{c.subtitulo}</p>
        </div>
        <span className="text-white/20 text-xs flex-shrink-0 mt-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-5 border-t border-white/5 pt-4 space-y-4 animate-fade-up">
          <div className="prose-custom">
            {c.respuesta.split('\n\n').map((para, i) => (
              <p key={i} className="text-white/70 text-sm leading-relaxed mb-3 whitespace-pre-line">{para}</p>
            ))}
          </div>

          {c.checklist && (
            <div className="p-4 bg-white/3 border border-white/8 rounded-xl">
              <p className="text-white/40 text-[10px] font-bold uppercase mb-2">✅ Checklist</p>
              <ul className="space-y-1.5">
                {c.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {c.tip_pro && (
            <div className="p-3 bg-violet-500/8 border border-violet-500/20 rounded-xl">
              <p className="text-violet-300 text-[10px] font-bold uppercase mb-1">💡 Tip Pro</p>
              <p className="text-white/70 text-sm leading-relaxed">{c.tip_pro}</p>
            </div>
          )}

          {c.alerta && (
            <div className="p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-[10px] font-bold uppercase mb-1">⚠️ Alerta</p>
              <p className="text-white/65 text-sm leading-relaxed">{c.alerta}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- MAIN PAGE ---------------------------------------------
const CATEGORIAS = [
  { id: 'all', label: 'Todo' },
  { id: 'paraguay', label: '🌎 Por País (PY·CO·MX)' },
  { id: 'configuracion', label: 'Configuración' },
  { id: 'estructura', label: 'Estructura' },
  { id: 'optimizacion', label: 'Optimización' },
  { id: 'escala', label: 'Escala' },
]

export default function MetaAdsProPage() {
  const [filter, setFilter] = useState('paraguay') // default a Paraguay
  const [search, setSearch] = useState('')

  const filtered = CONSULTAS.filter(c => {
    const matchCat = filter === 'all' || c.categoria === filter
    const matchSearch = !search || c.titulo.toLowerCase().includes(search.toLowerCase()) || c.subtitulo.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen">
      <Link href="/aprender" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/crear" className="btn-ghost text-white/30 hover:text-white p-1.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Meta Ads Pro</h1>
              <span className="tag tag-blue text-[10px]">🇵🇾 Dropi Paraguay</span>
            </div>
            <p className="text-white/40 text-xs">Tácticas avanzadas: Pixel, CBO/ABO, fatiga, retargeting, Lookalike — para Paraguay, Colombia y México</p>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-5">
          <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar: ROAS, Pixel, CBO, Dropi..." />
        </div>

        {/* Filtros por categoría */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
          {CATEGORIAS.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === cat.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-white/30 text-sm">No se encontraron resultados para "{search}"</p>
            </div>
          ) : (
            filtered.map(c => <ConsultaCard key={c.id} c={c} />)
          )}
        </div>

        {/* Link a War Room */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link href="/war-room" className="card p-4 border border-red-500/15 flex items-center gap-3 card-hover">
            <span className="text-xl">⚡</span>
            <div><p className="text-white text-xs font-semibold">War Room</p><p className="text-white/30 text-[10px]">Decisiones en tiempo real</p></div>
          </Link>
          <Link href="/meta-tracker" className="card p-4 border border-blue-500/15 flex items-center gap-3 card-hover">
            <span className="text-xl">📊</span>
            <div><p className="text-white text-xs font-semibold">Meta Tracker</p><p className="text-white/30 text-[10px]">Analizar CSV de resultados</p></div>
          </Link>
        </div>
      </main>
    </div>
  )
}
