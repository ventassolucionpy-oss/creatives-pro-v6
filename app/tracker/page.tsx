import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
export default function TrackerPage({ searchParams }: { searchParams: Record<string,string> }) {
  const params = new URLSearchParams(searchParams)
  params.set('desde', 'tracker')
  redirect(`/gestionar?${params.toString()}`)
}
