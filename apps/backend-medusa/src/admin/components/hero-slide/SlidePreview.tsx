/**
 * Composant de preview de slide en temps reel
 *
 * Affiche un apercu fidele de la slide avec:
 * - Ratio 16:9 correct
 * - Support des differents layouts
 * - Toggle desktop/mobile
 * - Overlay dynamique
 */

import { useState } from "react"
import { Text, Button } from "@medusajs/ui"
import type { LayoutType } from "./LayoutTypeSelector"

interface SlidePreviewProps {
  /** Titre de la slide */
  title: string
  /** Sous-titre */
  subtitle?: string
  /** Description */
  description?: string
  /** Badge */
  badge?: string
  /** URL de l'image */
  imageUrl?: string
  /** Classes CSS du gradient */
  gradient: string
  /** Couleur du texte (hex) */
  textColor: string
  /** Opacite de l'overlay (0-100) */
  overlayOpacity: number
  /** Label du CTA principal */
  ctaLabel?: string
  /** Label du CTA secondaire */
  secondaryCtaLabel?: string
  /** Type de layout */
  layoutType: LayoutType
  /** Position de l'image (pour layout "side") */
  imagePosition?: "left" | "right"
}

/**
 * Preview de la slide avec toggle desktop/mobile
 */
export function SlidePreview({
  title,
  subtitle,
  description,
  badge,
  imageUrl,
  gradient,
  textColor,
  overlayOpacity,
  ctaLabel,
  secondaryCtaLabel,
  layoutType,
  imagePosition = "right",
}: SlidePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  // Calculer l'opacite CSS (0 a 1)
  const overlayAlpha = overlayOpacity / 100

  // Determiner si le texte est clair ou sombre pour adapter les styles
  const isLightText = textColor === "#ffffff" || textColor === "#fff"

  /**
   * Rendu du contenu texte
   */
  const TextContent = () => (
    <div
      className={`
        flex flex-col
        ${viewMode === "mobile" ? "items-center text-center" : "items-start text-left"}
      `}
      style={{ color: textColor }}
    >
      {badge && (
        <span
          className={`
            inline-block px-3 py-1 mb-2 text-xs font-semibold rounded-full
            ${isLightText ? "bg-white/20" : "bg-black/10"}
            backdrop-blur-sm
          `}
        >
          {badge}
        </span>
      )}

      {subtitle && (
        <p
          className={`
            text-xs uppercase tracking-wider mb-1
            ${viewMode === "mobile" ? "text-[10px]" : ""}
          `}
          style={{ opacity: 0.8 }}
        >
          {subtitle}
        </p>
      )}

      <h2
        className={`
          font-bold mb-2 leading-tight
          ${viewMode === "mobile" ? "text-lg" : "text-2xl"}
        `}
      >
        {title || "Titre de la slide"}
      </h2>

      {description && (
        <p
          className={`
            mb-3 max-w-md
            ${viewMode === "mobile" ? "text-xs" : "text-sm"}
          `}
          style={{ opacity: 0.9 }}
        >
          {description}
        </p>
      )}

      <div
        className={`
          flex flex-wrap gap-2
          ${viewMode === "mobile" ? "justify-center" : ""}
        `}
      >
        {ctaLabel && (
          <span
            className={`
              inline-flex items-center px-4 py-2 rounded-lg font-semibold
              ${viewMode === "mobile" ? "text-xs px-3 py-1.5" : "text-sm"}
              ${isLightText ? "bg-white text-gray-900" : "bg-gray-900 text-white"}
            `}
          >
            {ctaLabel}
          </span>
        )}

        {secondaryCtaLabel && (
          <span
            className={`
              inline-flex items-center px-4 py-2 rounded-lg font-medium border
              ${viewMode === "mobile" ? "text-xs px-3 py-1.5" : "text-sm"}
              ${isLightText ? "bg-white/10 border-white/30" : "bg-black/5 border-black/20"}
            `}
            style={{ color: textColor }}
          >
            {secondaryCtaLabel}
          </span>
        )}
      </div>
    </div>
  )

  /**
   * Rendu layout "background" - Image en fond avec texte superpose
   */
  const BackgroundLayout = () => (
    <div
      className={`relative w-full h-full bg-gradient-to-r ${gradient}`}
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay sombre */}
      {(overlayOpacity > 0 || imageUrl) && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${imageUrl ? Math.max(overlayAlpha, 0.3) : overlayAlpha})`,
          }}
        />
      )}

      {/* Gradient overlay si pas d'image */}
      {!imageUrl && (
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
      )}

      {/* Contenu */}
      <div
        className={`
          relative z-10 h-full flex items-center
          ${viewMode === "mobile" ? "justify-center px-4" : "px-8"}
        `}
      >
        <TextContent />
      </div>
    </div>
  )

  /**
   * Rendu layout "side" - Image a cote du texte
   */
  const SideLayout = () => (
    <div
      className={`
        w-full h-full flex bg-gradient-to-r ${gradient}
        ${imagePosition === "left" ? "flex-row-reverse" : "flex-row"}
        ${viewMode === "mobile" ? "flex-col" : ""}
      `}
    >
      {/* Cote texte */}
      <div
        className={`
          flex items-center justify-center
          ${viewMode === "mobile" ? "flex-1 p-4" : "flex-1 p-8"}
        `}
      >
        <TextContent />
      </div>

      {/* Cote image */}
      <div
        className={`
          ${viewMode === "mobile" ? "h-1/3" : "flex-1"}
          bg-ui-bg-subtle
        `}
        style={{
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center bg-ui-bg-subtle">
            <Text className="text-ui-fg-muted text-xs">Pas d'image</Text>
          </div>
        )}
      </div>
    </div>
  )

  /**
   * Rendu layout "fullwidth" - Minimaliste sans image
   */
  const FullwidthLayout = () => (
    <div className={`relative w-full h-full bg-gradient-to-r ${gradient}`}>
      <div
        className={`
          h-full flex flex-col items-center justify-center text-center
          ${viewMode === "mobile" ? "px-4" : "px-8"}
        `}
      >
        <TextContent />
      </div>
    </div>
  )

  /**
   * Map des composants de layout
   */
  const layoutComponents: Record<LayoutType, React.ComponentType> = {
    background: BackgroundLayout,
    side: SideLayout,
    fullwidth: FullwidthLayout,
  }

  const LayoutComponent = layoutComponents[layoutType]

  return (
    <div className="rounded-lg border border-ui-border-base overflow-hidden">
      {/* Header avec toggle */}
      <div className="px-4 py-2 bg-ui-bg-subtle border-b border-ui-border-base flex items-center justify-between">
        <Text className="text-ui-fg-subtle text-sm font-medium">
          Apercu de la slide
        </Text>

        {/* Toggle Desktop/Mobile */}
        <div className="flex items-center gap-1 bg-ui-bg-base rounded-lg p-0.5">
          <Button
            variant={viewMode === "desktop" ? "primary" : "secondary"}
            size="small"
            onClick={() => setViewMode("desktop")}
            className="px-3 py-1 text-xs"
          >
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "primary" : "secondary"}
            size="small"
            onClick={() => setViewMode("mobile")}
            className="px-3 py-1 text-xs"
          >
            Mobile
          </Button>
        </div>
      </div>

      {/* Zone de preview */}
      <div
        className={`
          relative bg-ui-bg-subtle flex items-center justify-center p-4
          ${viewMode === "mobile" ? "py-6" : ""}
        `}
      >
        {/* Container avec ratio 16:9 */}
        <div
          className={`
            relative overflow-hidden rounded-lg shadow-lg
            ${viewMode === "mobile"
              ? "w-[180px] aspect-[9/16]"
              : "w-full max-w-2xl aspect-video"
            }
          `}
        >
          <LayoutComponent />
        </div>
      </div>

      {/* Info sur le layout */}
      <div className="px-4 py-2 bg-ui-bg-subtle border-t border-ui-border-base">
        <Text className="text-ui-fg-muted text-xs">
          Layout: {layoutType === "background" ? "Arriere-plan" : layoutType === "side" ? "Cote a cote" : "Pleine largeur"}
          {layoutType === "side" && ` (image a ${imagePosition === "left" ? "gauche" : "droite"})`}
          {layoutType === "background" && overlayOpacity > 0 && ` - Overlay: ${overlayOpacity}%`}
        </Text>
      </div>
    </div>
  )
}

export default SlidePreview
