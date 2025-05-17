"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  presetColors?: string[]
}

export function ColorPicker({
  color,
  onChange,
  presetColors = ["#0f2e4d", "#1a4a7c", "#2563eb", "#0ea5e9", "#38bdf8"],
}: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLocalColor(color)
  }, [color])

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value)
  }

  const handleColorChangeComplete = () => {
    onChange(localColor)
  }

  const handlePresetClick = (presetColor: string) => {
    setLocalColor(presetColor)
    onChange(presetColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal h-10">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <div className="w-full h-24 rounded-md mb-2" style={{ backgroundColor: localColor }} />
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="color"
                value={localColor}
                onChange={handleColorChange}
                onBlur={handleColorChangeComplete}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={localColor}
                onChange={handleColorChange}
                onBlur={handleColorChangeComplete}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <div className="font-medium mb-2 text-sm">Presets</div>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-6 h-6 rounded-full relative flex items-center justify-center"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePresetClick(presetColor)}
                  type="button"
                >
                  {presetColor === color && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
