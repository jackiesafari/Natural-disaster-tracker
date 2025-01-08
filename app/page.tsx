'use client'

import dynamic from 'next/dynamic'

const TrackerMap = dynamic(() => import('../components/TrackerMap'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <TrackerMap />
    </main>
  )
}

