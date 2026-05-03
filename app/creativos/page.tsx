import { redirect } from 'next/navigation'
// /creativos fue reemplazado por la nav de 5 secciones — redirigir a /crear
export const dynamic = 'force-dynamic'
export default function CreativosPage() { redirect('/crear') }
