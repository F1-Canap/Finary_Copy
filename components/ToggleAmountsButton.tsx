"use client"

import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAppContext } from "@/context/AppContext"

export function ToggleAmountsButton() {
  const { showAmounts, toggleShowAmounts } = useAppContext()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShowAmounts}
            className="text-muted-foreground hover:text-foreground"
          >
            {showAmounts ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-sm">
          {showAmounts ? "Cacher les montants" : "Afficher les montants"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
