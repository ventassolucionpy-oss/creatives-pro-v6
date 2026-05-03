'use client'
export const dynamic = 'force-dynamic'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const PASOS_META = [
  {
    n: 1, titulo: 'Ir a Meta Ads Manager',
    desc: 'Abrí ads.facebook.com y asegurate de estar en tu cuenta de anuncios correcta.',
    tip: '',
  },
  {
    n: 2, titulo: 'Nivel "Anuncios" (no Conjuntos ni Campañas)',
    desc: 'En la barra de la izquierda hacé clic en "Anuncios". Si exportás a nivel campaña o conjunto el parser no va a encontrar los datos correctos.',
    tip: '⚠️ Nivel Anuncio obligatorio',
  },
  {
    n: 3, titulo: 'Rango de fechas',
    desc: 'Hacé clic en el selector de fechas arriba a la derecha. Elegí el período que querés analizar: últimos 7 días, 14 días o 30 días.',
    tip: '📅 Últimos 7 días para decisiones urgentes',
  },
  {
    n: 4, titulo: 'Columnas exactas a incluir',
    desc: 'Hacé clic en "Columnas" → "Personalizar columnas". Asegurate de tener estas columnas marcadas:',
    columnas: ['Nombre del anuncio', 'Estado', 'Presupuesto', 'Impresiones', 'Alcance', 'Frecuencia', 'Clics en el enlace', 'CTR (clics en el enlace)', 'CPC (costo por clic en el enlace)', 'CPM (costo por 1.000 impresiones)', 'Resultados', 'Coste por resultado', 'Importe gastado', 'Ingresos (valor de conversión de compras)', 'ROAS de compras en el sitio web'],
    tip: '✅ Guardá esta vista de columnas para reusar',
  },
  {
    n: 5, titulo: 'Exportar como CSV',
    desc: 'Hacé clic en el botón "Exportar" (arriba a la derecha, ícono de descarga) → "Exportar tabla como .csv". El archivo se va a descargar automáticamente.',
    tip: '📁 El archivo tiene un nombre como "2024-01-15_2024-01-21_ads.csv"',
  },
  {
    n: 6, titulo: 'Subir al Meta Tracker',
    desc: 'Volvé al Meta Tracker y arrastrá el archivo CSV descargado al área de carga. El análisis automático comienza de inmediato.',
    tip: '',
    link: '/meta-tracker',
    linkLabel: 'Ir al Meta Tracker →',
  },
]

const ERRORES_COMUNES_META = [
  { error: 'Error al leer el CSV / 0 anuncios encontrados', causa: 'Exportaste a nivel Campaña o Conjunto, no Anuncio', solucion: 'En Ads Manager, cambiá la vista a nivel "Anuncios" antes de exportar' },
  { error: 'Columna ROAS vacía', causa: 'No tenés configurado el píxel o las conversiones de compra', solucion: 'El tracker calculará el ROAS si subís Ingresos y Gasto. Activá el píxel de compras en tu sitio.' },
  { error: 'Las métricas no coinciden con lo que veo en Meta', causa: 'Diferencia de atribución (ventana de 1 día vs 7 días)', solucion: 'Usá la misma ventana de atribución en Meta y en el tracker. Recomendado: 7 días clic, 1 día vista.' },
  { error: 'Solo aparecen algunos anuncios', causa: 'Hay anuncios pausados o eliminados que no se exportaron', solucion: 'Filtrá por "Todos los anuncios" (activos + pausados) antes de exportar' },
]

export default function MetaTrackerGuiaPage() {
  return (
    <div className="min-h-screen">
      <Link href="/meta-tracker" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/meta-tracker" className="text-white/30 hover:text-white/60 text-sm">Meta Tracker</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Guía de descarga</span>
          </div>
          <h1 className="text-2xl font-bold text-white">📘 Cómo descargar el CSV de Meta</h1>
          <p className="text-white/40 text-sm mt-1">Guía paso a paso para que el parser lea tus datos correctamente</p>
        </div>

        <div className="space-y-3 mb-6">
          {PASOS_META.map(paso => (
            <div key={paso.n} className="card p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-sm flex-shrink-0">{paso.n}</div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm mb-1">{paso.titulo}</p>
                  <p className="text-white/50 text-xs leading-relaxed mb-2">{paso.desc}</p>
                  {paso.tip && (
                    <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 inline-block">
                      <p className="text-amber-400 text-[10px] font-bold">{paso.tip}</p>
                    </div>
                  )}
                  {paso.columnas && (
                    <div className="mt-2 space-y-1">
                      {paso.columnas.map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-emerald-400 text-[10px]">✓</span>
                          <p className="text-white/60 text-xs">{c}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {paso.link && (
                    <Link href={paso.link} className="mt-2 inline-block text-violet-400 text-xs font-bold hover:text-violet-300 transition-colors">
                      {paso.linkLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Errores comunes y soluciones</p>
          <div className="space-y-3">
            {ERRORES_COMUNES_META.map((e, i) => (
              <div key={i} className="card p-4 border border-red-500/20 bg-red-500/3">
                <p className="text-red-400 font-bold text-xs mb-1">❌ {e.error}</p>
                <p className="text-white/40 text-xs mb-1"><span className="text-white/60 font-medium">Causa:</span> {e.causa}</p>
                <p className="text-white/40 text-xs"><span className="text-emerald-400 font-medium">Solución:</span> {e.solucion}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/meta-tracker"
          className="w-full block py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm text-center transition-all">
          📘 Ir al Meta Tracker — subir CSV
        </Link>
      </main>
    </div>
  )
}
