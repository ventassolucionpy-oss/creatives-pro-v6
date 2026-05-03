import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function InteligenciaPage({ searchParams }: { searchParams: Record<string,string> }) {
  const params = new URLSearchParams(searchParams)
  params.set('desde', 'inteligencia')
  redirect(`/gestionar?${params.toString()}`)
}
