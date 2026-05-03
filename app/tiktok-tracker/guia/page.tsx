'use client'
export const dynamic = 'force-dynamic'
import Navbar from '@/components/layout/Navbar'
import Link from 'next/link'

const PASOS_TIKTOK = [
  { n: 1, titulo: 'Ir a TikTok Ads Manager', desc: 'Abrí ads.tiktok.com y seleccioná tu cuenta publicitaria.' },
  { n: 2, titulo: 'Ir a "Reportes" → "Reporte personalizado"', desc: 'En el menú lateral izquierdo hacé clic en "Reportes" y luego "Reporte personalizado". No uses el reporte estándar.', tip: '⚠️ No es el Dashboard principal' },
  { n: 3, titulo: 'Seleccioná dimensión "Anuncio"', desc: 'En "Dimensiones" elegí "Anuncio". Esto genera una fila por cada creativo individual.', tip: '✅ Dimensión: Anuncio (no Campaña)' },
  { n: 4, titulo: 'Métricas a incluir', desc: 'En la sección de métricas marcá:', columnas: ['Nombre del anuncio', 'Estado del anuncio', 'Impresiones', 'Clics', 'CTR', 'CPC', 'CPM', 'Reproducciones de video (2s)', 'Tasa de visualización a los 6 segundos', 'Conversiones', 'Costo por conversión', 'Gasto total', 'Valor de conversión', 'ROAS'] },
  { n: 5, titulo: 'Seleccioná el período de tiempo', desc: 'Elegí "Últimos 7 días" o "Personalizado" para el período que querés analizar.', tip: '📅 7 días es suficiente para decisiones de Spark Ads' },
  { n: 6, titulo: 'Descargar como Excel o CSV', desc: 'Hacé clic en "Descargar" → "Excel (.xlsx)" o ".csv". Ambos formatos funcionan con el TikTok Tracker.', tip: '📁 El archivo se llama algo como "report_tiktok_ads.csv"' },
  { n: 7, titulo: 'Subir al TikTok Tracker', desc: 'Volvé al tracker y arrastrá el archivo. El sistema detecta automáticamente qué videos tienen potencial de Spark Ad.', link: '/tiktok-tracker', linkLabel: 'Ir al TikTok Tracker →' },
]

const ERRORES_TIKTOK = [
  { error: 'Sin datos de video / métricas vacías', causa: 'El anuncio es imagen, no video', solucion: 'Las métricas de video solo aplican a anuncios en formato video. Los de imagen igual se analizan pero sin métricas de retención.' },
  { error: 'No aparece el ROAS', causa: 'No tenés configurado el píxel de TikTok en tu landing o Dropi', solucion: 'Instalá el TikTok Pixel en tu página de checkout. Sin él, TikTok no puede atribuir las conversiones.' },
  { error: 'El reporte tiene ceros en todo', causa: 'El período seleccionado no tiene actividad', solucion: 'Verificá que el período coincida con fechas donde tus anuncios estuvieron activos.' },
]

export default function TikTokTrackerGuiaPage() {
  return (
    <div className="min-h-screen">
      <Link href="/tiktok-tracker" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-4 transition-colors">← Volver</Link>
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Link href="/tiktok-tracker" className="text-white/30 hover:text-white/60 text-sm">TikTok Tracker</Link>
            <span className="text-white/20">›</span>
            <span className="text-white/60 text-sm">Guía de descarga</span>
          </div>
          <h1 className="text-2xl font-bold text-white">🎵 Cómo descargar el CSV de TikTok</h1>
          <p className="text-white/40 text-sm mt-1">Guía exacta para que el tracker detecte tus Spark Ads potenciales</p>
        </div>

        <div className="space-y-3 mb-6">
          {PASOS_TIKTOK.map(paso => (
            <div key={paso.n} className="card p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-black text-sm flex-shrink-0">{paso.n}</div>
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
                      {paso.columnas.map((c, i) => <div key={i} className="flex items-center gap-2"><span className="text-emerald-400 text-[10px]">✓</span><p className="text-white/60 text-xs">{c}</p></div>)}
                    </div>
                  )}
                  {paso.link && <Link href={paso.link} className="mt-2 inline-block text-violet-400 text-xs font-bold hover:text-violet-300 transition-colors">{paso.linkLabel}</Link>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold text-white/25 uppercase tracking-widest mb-3">Errores comunes</p>
          <div className="space-y-3">
            {ERRORES_TIKTOK.map((e, i) => (
              <div key={i} className="card p-4 border border-red-500/20 bg-red-500/3">
                <p className="text-red-400 font-bold text-xs mb-1">❌ {e.error}</p>
                <p className="text-white/40 text-xs mb-1"><span className="text-white/60">Causa:</span> {e.causa}</p>
                <p className="text-white/40 text-xs"><span className="text-emerald-400">Solución:</span> {e.solucion}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/tiktok-tracker" className="w-full block py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm text-center transition-all">
          🎵 Ir al TikTok Tracker — subir CSV
        </Link>
      </main>
    </div>
  )
}
