'use client'

import dynamic from 'next/dynamic'

const TrackerMap = dynamic(() => import('../components/TrackerMap'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.17),_transparent_34%),radial-gradient(circle_at_80%_18%,_rgba(16,185,129,0.12),_transparent_28%)]" />
      <TrackerMap />
    </main>
  )
}
