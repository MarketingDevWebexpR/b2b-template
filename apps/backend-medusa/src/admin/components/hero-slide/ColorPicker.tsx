/**
 * Selecteur de couleur simplifie avec palette predefinie
 *
 * Affiche une palette de 8 couleurs predefinies et permet
 * optionnellement de saisir une couleur personnalisee.
 */

import { useState, useEffect } from "react"
import { Text, Input } from "@medusajs/ui"

interface ColorPickerProps {
  /** Couleur selectionnee (format hex) */
  value: string
  /** Callback quand la couleur change */
  onChange: (value: string) => void
  /** Label du composant */
  label?: string
  /** Message d'aide */
  helpText?: string
  /** Desactiver le composant */
  disabled?: boolean
  /** Afficher l'input custom */
  showCustomInput?: boolean
}

/**
 * Palette de couleurs predefinies
 */
const colorPresets: Array<{
  value: string
  label: string
}> = [
  { value: "#1a1a1a", label: "Noir" },
  { value: "#ffffff", label: "Blanc" },
  { value: "#0f172a", label: "Slate" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#dc2626", label: "Rouge" },
  { value: "#16a34a", label: "Vert" },
  { value: "#2563eb", label: "Bleu" },
  { value: "#f59e0b", label: "Or" },
]

/**
 * Verifie si une couleur est valide (format hex)
 */
function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
}

/**
 * Selecteur de couleur avec palette et input custom
 */
export function ColorPicker({
  value,
  onChange,
  label = "Couleur",
  helpText,
  disabled = false,
  showCustomInput = true,
}: ColorPickerProps) {
  const [customValue, setCustomValue] = useState(value)
  const [isCustom, setIsCustom] = useState(false)

  // Synchroniser l'input custom avec la valeur
  useEffect(() => {
    setCustomValue(value)
    // Verifier si la couleur est dans la palette
    const isPreset = colorPresets.some((c) => c.value.toLowerCase() === value.toLowerCase())
    setIsCustom(!isPreset && value !== "")
  }, [value])

  /**
   * Gere la selection d'une couleur de la palette
   */
  const handlePresetClick = (color: string) => {
    if (!disabled) {
      onChange(color)
      setIsCustom(false)
    }
  }

  /**
   * Gere le changement de l'input custom
   */
  const handleCustomChange = (newValue: string) => {
    setCustomValue(newValue)
    // Ajouter le # si manquant et que la valeur n'est pas vide
    let normalizedValue = newValue
    if (newValue && !newValue.startsWith("#")) {
      normalizedValue = "#" + newValue
    }
    // Mettre a jour la valeur si valide
    if (isValidHexColor(normalizedValue) || normalizedValue === "") {
      onChange(normalizedValue)
      setIsCustom(normalizedValue !== "" && !colorPresets.some((c) => c.value.toLowerCase() === normalizedValue.toLowerCase()))
    }
  }

  // Trouver le preset selectionne (si applicable)
  const selectedPreset = colorPresets.find(
    (c) => c.value.toLowerCase() === value.toLowerCase()
  )

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-ui-fg-base text-sm font-medium">
          {label}
        </label>
      )}

      {/* Palette de couleurs */}
      <div className="flex flex-wrap gap-2">
        {colorPresets.map((color) => {
          const isSelected = color.value.toLowerCase() === value.toLowerCase()
          const isDark = color.value === "#1a1a1a" || color.value === "#0f172a"

          return (
            <button
              key={color.value}
              type="button"
              onClick={() => handlePresetClick(color.value)}
              disabled={disabled}
              title={color.label}
              className={`
                group relative w-10 h-10 rounded-lg transition-all
                ${isSelected
                  ? "ring-2 ring-ui-border-interactive ring-offset-2"
                  : "hover:scale-110"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                ${color.value === "#ffffff" ? "border border-ui-border-base" : ""}
              `}
              style={{ backgroundColor: color.value }}
            >
              {/* Checkmark pour la selection */}
              {isSelected && (
                <span
                  className={`absolute inset-0 flex items-center justify-center ${isDark ? "text-white" : "text-black"}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}

              {/* Tooltip au survol */}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-ui-fg-muted opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                {color.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Input custom et preview */}
      {showCustomInput && (
        <div className="flex items-center gap-3 mt-4">
          {/* Preview swatch */}
          <div
            className="w-10 h-10 rounded-lg border border-ui-border-base flex-shrink-0"
            style={{
              backgroundColor: isValidHexColor(value) ? value : "#ffffff",
              backgroundImage: !isValidHexColor(value)
                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                : undefined,
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
            }}
          />

          {/* Input hex */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="#000000"
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              disabled={disabled}
              className="font-mono text-sm"
            />
          </div>
        </div>
      )}

      {/* Texte d'aide ou couleur selectionnee */}
      {helpText && (
        <Text className="text-ui-fg-subtle text-sm">{helpText}</Text>
      )}

      {selectedPreset && (
        <Text className="text-ui-fg-muted text-xs">
          Couleur selectionnee: {selectedPreset.label}
        </Text>
      )}

      {isCustom && isValidHexColor(value) && (
        <Text className="text-ui-fg-muted text-xs">
          Couleur personnalisee: {value}
        </Text>
      )}
    </div>
  )
}

export default ColorPicker
