/**
 * Selecteur de type de layout avec cartes visuelles
 *
 * Affiche trois options de layout sous forme de cartes cliquables
 * avec une representation visuelle de chaque type.
 */

import { Text } from "@medusajs/ui"

/** Types de layout disponibles */
export type LayoutType = "background" | "side" | "fullwidth"

interface LayoutTypeSelectorProps {
  /** Type de layout selectionne */
  value: LayoutType
  /** Callback quand la selection change */
  onChange: (value: LayoutType) => void
  /** Desactiver le selecteur */
  disabled?: boolean
}

/**
 * Configuration des types de layout
 */
const layoutOptions: Array<{
  value: LayoutType
  label: string
  description: string
}> = [
  {
    value: "background",
    label: "Arriere-plan",
    description: "Image en fond avec texte superpose",
  },
  {
    value: "side",
    label: "Cote a cote",
    description: "Image a gauche ou a droite du texte",
  },
  {
    value: "fullwidth",
    label: "Pleine largeur",
    description: "Layout minimaliste sans image",
  },
]

/**
 * Mini representation visuelle du layout "background"
 */
function BackgroundPreview({ selected }: { selected: boolean }) {
  return (
    <div className="w-full aspect-video rounded bg-gradient-to-r from-ui-bg-subtle-pressed to-ui-bg-subtle relative overflow-hidden">
      {/* Lignes de texte simulees */}
      <div className="absolute inset-0 flex flex-col justify-center p-2 gap-1">
        <div
          className={`h-2 w-8 rounded ${selected ? "bg-ui-fg-on-inverted" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-3 w-14 rounded ${selected ? "bg-ui-fg-on-inverted" : "bg-ui-fg-subtle"}`}
        />
        <div
          className={`h-1.5 w-12 rounded mt-1 ${selected ? "bg-ui-fg-on-inverted/70" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-2 w-6 rounded mt-2 ${selected ? "bg-ui-tag-blue-bg" : "bg-ui-bg-interactive"}`}
        />
      </div>
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  )
}

/**
 * Mini representation visuelle du layout "side"
 */
function SidePreview({ selected }: { selected: boolean }) {
  return (
    <div className="w-full aspect-video rounded bg-ui-bg-base border border-ui-border-base overflow-hidden flex">
      {/* Cote texte */}
      <div className="flex-1 p-2 flex flex-col justify-center gap-1">
        <div
          className={`h-1.5 w-6 rounded ${selected ? "bg-ui-fg-base" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-2 w-10 rounded ${selected ? "bg-ui-fg-base" : "bg-ui-fg-subtle"}`}
        />
        <div
          className={`h-1 w-8 rounded ${selected ? "bg-ui-fg-subtle" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-1.5 w-5 rounded mt-1 ${selected ? "bg-ui-tag-blue-bg" : "bg-ui-bg-interactive"}`}
        />
      </div>
      {/* Cote image */}
      <div className="flex-1 bg-gradient-to-br from-ui-bg-subtle-pressed to-ui-bg-subtle" />
    </div>
  )
}

/**
 * Mini representation visuelle du layout "fullwidth"
 */
function FullwidthPreview({ selected }: { selected: boolean }) {
  return (
    <div className="w-full aspect-video rounded bg-gradient-to-r from-ui-bg-subtle to-ui-bg-base border border-ui-border-base overflow-hidden">
      {/* Contenu centre */}
      <div className="h-full flex flex-col items-center justify-center gap-1 p-2">
        <div
          className={`h-2 w-10 rounded ${selected ? "bg-ui-fg-base" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-3 w-16 rounded ${selected ? "bg-ui-fg-base" : "bg-ui-fg-subtle"}`}
        />
        <div
          className={`h-1.5 w-12 rounded ${selected ? "bg-ui-fg-subtle" : "bg-ui-fg-muted"}`}
        />
        <div
          className={`h-2 w-6 rounded mt-1 ${selected ? "bg-ui-tag-blue-bg" : "bg-ui-bg-interactive"}`}
        />
      </div>
    </div>
  )
}

/**
 * Map des composants de preview par type de layout
 */
const previewComponents: Record<
  LayoutType,
  React.ComponentType<{ selected: boolean }>
> = {
  background: BackgroundPreview,
  side: SidePreview,
  fullwidth: FullwidthPreview,
}

/**
 * Selecteur de type de layout sous forme de cartes visuelles
 */
export function LayoutTypeSelector({
  value,
  onChange,
  disabled = false,
}: LayoutTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-ui-fg-base text-sm font-medium">
        Type de layout
      </label>

      <div className="grid grid-cols-3 gap-3">
        {layoutOptions.map((option) => {
          const isSelected = value === option.value
          const PreviewComponent = previewComponents[option.value]

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              className={`
                p-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? "border-ui-border-interactive bg-ui-bg-interactive-hover ring-2 ring-ui-border-interactive ring-offset-1"
                  : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-base hover:bg-ui-bg-subtle"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Preview visuelle */}
              <div className="mb-2">
                <PreviewComponent selected={isSelected} />
              </div>

              {/* Label */}
              <Text
                className={`text-sm font-medium ${isSelected ? "text-ui-fg-base" : "text-ui-fg-subtle"}`}
              >
                {option.label}
              </Text>

              {/* Description */}
              <Text className="text-xs text-ui-fg-muted mt-0.5 line-clamp-2">
                {option.description}
              </Text>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LayoutTypeSelector
