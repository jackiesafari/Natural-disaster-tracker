'use client'

import React, { useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import DisasterSidebar from './DisasterSidebar'
//import { ExternalLink } from 'lucide-react'

// Mock data for natural disasters
const disasters = [
  {
    id: 1,
    type: 'Wildfire',
    location: 'Los Angeles, California',
    coordinates: [34.0522, -118.2437],
    description: 'Large wildfire affecting suburban areas',
    imageUrl: '/placeholder.svg?height=200&width=300',
    severity: 'High',
    affectedArea: '50,000 acres',
    evacuationStatus: 'Mandatory',
  },
  {
    id: 2,
    type: 'Hurricane',
    location: 'Miami, Florida',
    coordinates: [25.7617, -80.1918],
    description: 'Category 3 hurricane approaching the coast',
    imageUrl: '/placeholder.svg?height=200&width=300',
    severity: 'Severe',
    windSpeed: '120 mph',
    stormSurge: '9-12 feet',
  },
  {
    id: 3,
    type: 'Earthquake',
    location: 'San Francisco, California',
    coordinates: [37.7749, -122.4194],
    description: 'Magnitude 6.2 earthquake',
    imageUrl: '/placeholder.svg?height=200&width=300',
    severity: 'Moderate',
    depth: '10 km',
    aftershocks: 'Frequent',
  },
]

// Custom icons for different disaster types
const icons = {
  Wildfire: new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2880/2880627.png',
    iconSize: [32, 32],
  }),
  Hurricane: new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1684/1684426.png',
    iconSize: [32, 32],
  }),
  Earthquake: new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1684/1684424.png',
    iconSize: [32, 32],
  }),
}

function ZoomHandler({ setZoom }: { setZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom())
    },
  })
  return null
}

//interface DisasterSidebarProps {
  //disaster: {
    //id: number;
    //type: string;
    //location: string;
    //coordinates: number[];
    //description: string;
    //imageUrl: string;
    //severity: string;
    //affectedArea?: string;
    //evacuationStatus?: string;
    //windSpeed?: string;
    //stormSurge?: string;
    //depth?: string;
    //aftershocks?: string;
    //[key: string]: string | number | number[] | undefined;
  //} | null;
//}

export default function TrackerMap() {
  const [selectedDisaster, setSelectedDisaster] = useState<typeof disasters[0] | null>(null)
  const [zoom, setZoom] = useState(4)

  return (
    <div className="flex h-screen">
      <div className="w-[70%] h-full relative">
        <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <ZoomHandler setZoom={setZoom} />
          {disasters.map((disaster) => (
            <Marker
              key={disaster.id}
              position={disaster.coordinates as [number, number]}
              icon={icons[disaster.type as keyof typeof icons]}
              eventHandlers={{
                click: () => setSelectedDisaster(disaster),
              }}
            >
              {zoom > 6 && (
                <Popup>
                  <h3 className="font-bold">{disaster.type}</h3>
                  <p>{disaster.location}</p>
                </Popup>
              )}
            </Marker>
          ))}
        </MapContainer>
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-white mb-2">Tracker Map</h1>
          <p className="text-gray-300 text-sm">Real-time disaster monitoring and analysis</p>
        </div>
      </div>
      <DisasterSidebar disaster={selectedDisaster} />
    </div>
  )
}

