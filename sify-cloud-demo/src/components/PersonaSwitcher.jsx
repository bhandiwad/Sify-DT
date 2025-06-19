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

// Map full persona names to short forms
const PERSONA_SHORT_FORMS = {
  [PERSONAS.ACCOUNT_MANAGER]: 'AM',
  [PERSONAS.PRODUCT_MANAGER]: 'PM',
  [PERSONAS.SOLUTION_ARCHITECT]: 'SA',
  [PERSONAS.FINANCE_ADMIN]: 'FA'
}

// Map short forms back to full names for display
const PERSONA_FULL_NAMES = {
  'AM': 'Account Manager',
  'PM': 'Product Manager',
  'SA': 'Solution Architect',
  'FA': 'Finance Admin'
}

const PersonaSwitcher = ({ onPersonaChange }) => {
  const [currentPersona, setCurrentPersonaState] = useState(() => {
    const fullPersona = getCurrentPersona()
    return PERSONA_SHORT_FORMS[fullPersona] || 'AM'
  })

  useEffect(() => {
    // Ensure persona is initialized and synced with localStorage
    const fullPersona = getCurrentPersona()
    const shortPersona = PERSONA_SHORT_FORMS[fullPersona] || 'AM'
    setCurrentPersonaState(shortPersona)
  }, [])

  // Sync with localStorage on dropdown close (or periodically)
  useEffect(() => {
    const interval = setInterval(() => {
      const fullPersona = getCurrentPersona()
      const shortPersona = PERSONA_SHORT_FORMS[fullPersona] || 'AM'
      setCurrentPersonaState(shortPersona)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handlePersonaChange = (fullPersona) => {
    const shortPersona = PERSONA_SHORT_FORMS[fullPersona]
    setCurrentPersona(fullPersona)
    setCurrentPersonaState(shortPersona)
    if (onPersonaChange) {
      onPersonaChange(shortPersona)
    }
  }

  const getPersonaColor = (shortPersona) => {
    const colors = {
      'AM': 'bg-blue-100 text-blue-800',
      'PM': 'bg-purple-100 text-purple-800',
      'SA': 'bg-green-100 text-green-800',
      'FA': 'bg-orange-100 text-orange-800'
    }
    return colors[shortPersona] || 'bg-gray-100 text-gray-800'
  }

  const getPersonaIcon = () => {
    return <User className="h-4 w-4" />
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 hidden sm:block">Role:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {getPersonaIcon()}
            <Badge className={getPersonaColor(currentPersona)}>
              {PERSONA_FULL_NAMES[currentPersona]}
            </Badge>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {Object.values(PERSONAS).map((fullPersona) => {
            const shortPersona = PERSONA_SHORT_FORMS[fullPersona]
            return (
              <DropdownMenuItem
                key={fullPersona}
                onClick={() => handlePersonaChange(fullPersona)}
                className={`flex items-center gap-2 ${
                  currentPersona === shortPersona ? 'bg-gray-100' : ''
                }`}
              >
                {getPersonaIcon()}
                <span>{fullPersona}</span>
                {currentPersona === shortPersona && (
                  <Badge className="ml-auto bg-green-100 text-green-800">Current</Badge>
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default PersonaSwitcher

