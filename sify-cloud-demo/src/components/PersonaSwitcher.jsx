import { useState, useEffect } from 'react'
import { User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PERSONAS, getCurrentPersona, setCurrentPersona } from '@/utils/dataModel'

const PersonaSwitcher = ({ onPersonaChange }) => {
  const [currentPersona, setCurrentPersonaState] = useState(getCurrentPersona())

  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
    setCurrentPersonaState(persona)
    if (onPersonaChange) {
      onPersonaChange(persona)
    }
  }

  const getPersonaColor = (persona) => {
    const colors = {
      [PERSONAS.ACCOUNT_MANAGER]: 'bg-blue-100 text-blue-800',
      [PERSONAS.PRODUCT_MANAGER]: 'bg-purple-100 text-purple-800',
      [PERSONAS.SOLUTION_ARCHITECT]: 'bg-green-100 text-green-800',
      [PERSONAS.FINANCE_ADMIN]: 'bg-orange-100 text-orange-800'
    }
    return colors[persona] || 'bg-gray-100 text-gray-800'
  }

  const getPersonaIcon = (persona) => {
    return <User className="h-4 w-4" />
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 hidden sm:block">Role:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {getPersonaIcon(currentPersona)}
            <Badge className={getPersonaColor(currentPersona)}>
              {currentPersona}
            </Badge>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.values(PERSONAS).map((persona) => (
            <DropdownMenuItem
              key={persona}
              onClick={() => handlePersonaChange(persona)}
              className={`flex items-center gap-2 ${
                currentPersona === persona ? 'bg-gray-100' : ''
              }`}
            >
              {getPersonaIcon(persona)}
              <span>{persona}</span>
              {currentPersona === persona && (
                <Badge className="ml-auto bg-green-100 text-green-800">Current</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default PersonaSwitcher

