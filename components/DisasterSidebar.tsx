import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface DisasterSidebarProps {
  disaster: {
    type: string
    location: string
    description: string
    imageUrl: string
    severity: string
    [key: string]: string
  } | null
}

// Add donation links for each disaster type
const donationLinks = {
  Wildfire: [
    { name: 'American Red Cross', url: 'https://www.redcross.org/donate/donation.html/' },
    { name: 'California Fire Foundation', url: 'https://www.cafirefoundation.org/programs/supplying-aid-to-victims-of-emergency/' },
  ],
  Hurricane: [
    { name: 'American Red Cross', url: 'https://www.redcross.org/donate/donation.html/' },
    { name: 'Direct Relief', url: 'https://www.directrelief.org/place/usa/' },
  ],
  Earthquake: [
    { name: 'American Red Cross', url: 'https://www.redcross.org/donate/donation.html/' },
    { name: 'UNICEF USA', url: 'https://www.unicefusa.org/mission/emergencies/earthquakes' },
  ],
}

export default function DisasterSidebar({ disaster }: DisasterSidebarProps) {
  if (!disaster) {
    return (
      <div className="w-[30%] p-4 bg-gray-800 text-white">
        <p className="text-center text-gray-400">Select an event on the map to view details</p>
      </div>
    )
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'bg-red-500'
      case 'moderate':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div className="w-[30%] p-4 bg-gray-800 overflow-y-auto">
      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{disaster.type}</CardTitle>
            <Badge className={`${getSeverityColor(disaster.severity)} text-white`}>{disaster.severity}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <img src={disaster.imageUrl} alt={disaster.type} className="w-full h-48 object-cover mb-4 rounded" />
          <h3 className="font-bold mb-2 text-gray-300">Location</h3>
          <p className="mb-4 text-white">{disaster.location}</p>
          <h3 className="font-bold mb-2 text-gray-300">Description</h3>
          <p className="mb-4 text-white">{disaster.description}</p>
          {Object.entries(disaster).map(([key, value]) => {
            if (!['id', 'type', 'location', 'coordinates', 'description', 'imageUrl', 'severity'].includes(key)) {
              return (
                <div key={key} className="mb-2">
                  <h3 className="font-bold text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <p className="text-white">{value}</p>
                </div>
              )
            }
            return null
          })}
          <h3 className="font-bold mt-6 mb-3 text-gray-300">Donate to Relief Efforts</h3>
          <div className="flex flex-col space-y-2">
            {donationLinks[disaster.type as keyof typeof donationLinks].map((link, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
                asChild
              >
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.name}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
