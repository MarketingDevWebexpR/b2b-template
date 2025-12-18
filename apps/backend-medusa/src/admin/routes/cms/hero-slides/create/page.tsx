/**
 * Page de creation d'une nouvelle slide hero
 *
 * Formulaire complet avec:
 * - Upload d'image par drag & drop
 * - Selection visuelle du type de layout
 * - Palette de couleurs simplifiee
 * - Preview en temps reel avec toggle desktop/mobile
 * - Champs conditionnels selon le layout
 */

import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Toaster,
  toast,
} from "@medusajs/ui"
import { ArrowLeft, ArrowPath } from "@medusajs/icons"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// Composants personnalises pour le formulaire
import {
  ImageUpload,
  LayoutTypeSelector,
  ColorPicker,
  SlidePreview,
  type LayoutType,
} from "../../../../components/hero-slide"

/**
 * Interface des donnees du formulaire
 */
interface FormData {
  title: string
  subtitle: string
  description: string
  badge: string
  image_url: string
  image_alt: string
  gradient: string
  text_color: string
  overlay_opacity: string
  cta_label: string
  cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  start_date: string
  end_date: string
  is_published: boolean
  // Nouveaux champs pour le layout
  layout_type: LayoutType
  image_position: "left" | "right"
}

interface CreateSlideResponse {
  slide: {
    id: string
    title: string
  }
}

/**
 * Valeurs initiales du formulaire
 */
const initialFormData: FormData = {
  title: "",
  subtitle: "",
  description: "",
  badge: "",
  image_url: "",
  image_alt: "",
  gradient: "from-primary-700 via-primary-600 to-primary-500",
  text_color: "#ffffff",
  overlay_opacity: "40",
  cta_label: "",
  cta_href: "",
  secondary_cta_label: "",
  secondary_cta_href: "",
  start_date: "",
  end_date: "",
  is_published: false,
  layout_type: "background",
  image_position: "right",
}

/**
 * Presets de gradient disponibles
 */
const gradientPresets = [
  { name: "Primary", value: "from-primary-700 via-primary-600 to-primary-500" },
  { name: "Accent", value: "from-accent-700 via-accent-600 to-accent-500" },
  { name: "Gold", value: "from-gold-700 via-gold-600 to-accent" },
  { name: "Success", value: "from-success-700 via-success-600 to-success-500" },
  { name: "Blue", value: "from-blue-700 via-blue-600 to-blue-500" },
  { name: "Purple", value: "from-purple-700 via-purple-600 to-purple-500" },
]

/**
 * Composant de la page de creation
 */
const CreateHeroSlidePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  /**
   * Met a jour un champ du formulaire
   */
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * Valide le formulaire avant soumission
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis"
    }

    if (!formData.cta_label.trim()) {
      newErrors.cta_label = "Le texte du CTA est requis"
    }

    if (!formData.cta_href.trim()) {
      newErrors.cta_href = "L'URL du CTA est requise"
    }

    // Validation des URLs
    if (formData.image_url && !formData.image_url.startsWith("http") && !formData.image_url.startsWith("/")) {
      newErrors.image_url = "L'URL doit commencer par http://, https:// ou /"
    }

    // Validation de l'opacite
    if (formData.overlay_opacity && (isNaN(Number(formData.overlay_opacity)) || Number(formData.overlay_opacity) < 0 || Number(formData.overlay_opacity) > 100)) {
      newErrors.overlay_opacity = "L'opacite doit etre entre 0 et 100"
    }

    // Validation des dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate <= startDate) {
        newErrors.end_date = "La date de fin doit etre posterieure a la date de debut"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Soumet le formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setSubmitting(true)

    try {
      // Construire le payload avec les champs layout
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        description: formData.description.trim() || null,
        badge: formData.badge.trim() || null,
        image_url: formData.image_url.trim() || null,
        image_alt: formData.image_alt.trim() || null,
        gradient: formData.gradient,
        text_color: formData.text_color,
        overlay_opacity: Number(formData.overlay_opacity) || 0,
        cta_label: formData.cta_label.trim(),
        cta_href: formData.cta_href.trim(),
        secondary_cta_label: formData.secondary_cta_label.trim() || null,
        secondary_cta_href: formData.secondary_cta_href.trim() || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_published: formData.is_published,
        // Champs layout directement dans le payload
        layout_type: formData.layout_type,
        image_position: formData.image_position,
      }

      const response = await fetch("/admin/cms/hero-slides", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la creation de la slide")
      }

      const data = (await response.json()) as CreateSlideResponse

      toast.success("Slide creee avec succes")

      // Petit delai pour afficher le toast avant la navigation
      setTimeout(() => {
        navigate(`/cms/hero-slides/${data.slide.id}`)
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header avec breadcrumb */}
      <div className="px-6 py-4">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            to="/cms"
            className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            CMS
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <Link
            to="/cms/hero-slides"
            className="flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Hero Slides
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <span className="text-ui-fg-base font-medium">Nouvelle</span>
        </nav>

        <Heading level="h1">Nouvelle slide</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Creer une nouvelle slide pour le carousel d'accueil
        </Text>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Formulaire */}
          <div className="space-y-8">
            {/* Section Layout */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Type de layout
              </Heading>

              <LayoutTypeSelector
                value={formData.layout_type}
                onChange={(value) => handleInputChange("layout_type", value)}
              />

              {/* Option position image (visible seulement pour layout "side") */}
              {formData.layout_type === "side" && (
                <div className="mt-4 p-4 bg-ui-bg-subtle rounded-lg">
                  <Label className="mb-3 block">Position de l'image</Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange("image_position", "left")}
                      className={`
                        flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-medium
                        ${formData.image_position === "left"
                          ? "border-ui-border-interactive bg-ui-bg-interactive-hover"
                          : "border-ui-border-base hover:border-ui-border-strong"
                        }
                      `}
                    >
                      Image a gauche
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("image_position", "right")}
                      className={`
                        flex-1 py-2 px-4 rounded-lg border-2 transition-all text-sm font-medium
                        ${formData.image_position === "right"
                          ? "border-ui-border-interactive bg-ui-bg-interactive-hover"
                          : "border-ui-border-base hover:border-ui-border-strong"
                        }
                      `}
                    >
                      Image a droite
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section Image (visible sauf pour layout "fullwidth") */}
            {formData.layout_type !== "fullwidth" && (
              <div className="space-y-4">
                <Heading level="h2" className="text-ui-fg-base">
                  Image
                </Heading>

                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => handleInputChange("image_url", url)}
                  uploadUrl="/admin/uploads"
                  label="Image de la slide"
                  helpText="Format recommande: 1920x1080px (16:9)"
                  error={errors.image_url}
                />

                <div>
                  <Label htmlFor="image_alt" className="mb-2 block">
                    Texte alternatif (accessibilite)
                  </Label>
                  <Input
                    id="image_alt"
                    placeholder="Description de l'image pour les lecteurs d'ecran"
                    value={formData.image_alt}
                    onChange={(e) => handleInputChange("image_alt", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Section Contenu */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Contenu
              </Heading>

              <div>
                <Label htmlFor="title" className="mb-2 block">
                  Titre <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Collection Printemps 2025"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.title}</Text>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtitle" className="mb-2 block">
                    Sous-titre
                  </Label>
                  <Input
                    id="subtitle"
                    placeholder="Ex: Nouveautes"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange("subtitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="badge" className="mb-2 block">
                    Badge
                  </Label>
                  <Input
                    id="badge"
                    placeholder="Ex: Nouveau, Promo"
                    value={formData.badge}
                    onChange={(e) => handleInputChange("badge", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description optionnelle de la slide..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Section CTA */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Boutons d'action
              </Heading>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_label" className="mb-2 block">
                    Texte du CTA principal <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="cta_label"
                    placeholder="Ex: Decouvrir"
                    value={formData.cta_label}
                    onChange={(e) => handleInputChange("cta_label", e.target.value)}
                    aria-invalid={!!errors.cta_label}
                  />
                  {errors.cta_label && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.cta_label}</Text>
                  )}
                </div>
                <div>
                  <Label htmlFor="cta_href" className="mb-2 block">
                    URL du CTA <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="cta_href"
                    placeholder="Ex: /categories/nouveautes"
                    value={formData.cta_href}
                    onChange={(e) => handleInputChange("cta_href", e.target.value)}
                    aria-invalid={!!errors.cta_href}
                  />
                  {errors.cta_href && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.cta_href}</Text>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="secondary_cta_label" className="mb-2 block">
                    Texte du CTA secondaire
                  </Label>
                  <Input
                    id="secondary_cta_label"
                    placeholder="Ex: En savoir plus"
                    value={formData.secondary_cta_label}
                    onChange={(e) => handleInputChange("secondary_cta_label", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondary_cta_href" className="mb-2 block">
                    URL du CTA secondaire
                  </Label>
                  <Input
                    id="secondary_cta_href"
                    placeholder="Ex: /a-propos"
                    value={formData.secondary_cta_href}
                    onChange={(e) => handleInputChange("secondary_cta_href", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section Apparence */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Apparence
              </Heading>

              {/* Gradient */}
              <div>
                <Label className="mb-2 block">Gradient de fond</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleInputChange("gradient", preset.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${formData.gradient === preset.value
                          ? "bg-ui-bg-interactive text-ui-fg-on-inverted"
                          : "bg-ui-bg-subtle hover:bg-ui-bg-base border border-ui-border-base"
                        }
                      `}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <Input
                  value={formData.gradient}
                  onChange={(e) => handleInputChange("gradient", e.target.value)}
                  placeholder="Classes Tailwind du gradient"
                />
              </div>

              {/* Couleur du texte */}
              <ColorPicker
                value={formData.text_color}
                onChange={(color) => handleInputChange("text_color", color)}
                label="Couleur du texte"
                helpText="Choisissez une couleur contrastee avec le fond"
              />

              {/* Opacite de l'overlay (seulement pour layout "background") */}
              {formData.layout_type === "background" && (
                <div>
                  <Label htmlFor="overlay_opacity" className="mb-2 block">
                    Opacite de l'overlay ({formData.overlay_opacity}%)
                  </Label>
                  <div className="flex items-center gap-4">
                    <input
                      id="overlay_opacity"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.overlay_opacity}
                      onChange={(e) => handleInputChange("overlay_opacity", e.target.value)}
                      className="flex-1 h-2 bg-ui-bg-subtle rounded-lg appearance-none cursor-pointer accent-ui-fg-interactive"
                    />
                    <div className="w-16">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.overlay_opacity}
                        onChange={(e) => handleInputChange("overlay_opacity", e.target.value)}
                        className="text-center"
                      />
                    </div>
                  </div>
                  <Text className="text-ui-fg-muted text-xs mt-1">
                    Augmentez l'opacite pour ameliorer la lisibilite du texte sur l'image
                  </Text>
                </div>
              )}
            </div>

            {/* Section Planification */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Planification
              </Heading>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="mb-2 block">
                    Date de debut
                  </Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                  />
                  <Text className="text-ui-fg-subtle text-xs mt-1">
                    Laissez vide pour un debut immediat
                  </Text>
                </div>
                <div>
                  <Label htmlFor="end_date" className="mb-2 block">
                    Date de fin
                  </Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                    aria-invalid={!!errors.end_date}
                  />
                  {errors.end_date && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.end_date}</Text>
                  )}
                </div>
              </div>
            </div>

            {/* Section Publication */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Publication
              </Heading>

              <div className="p-4 bg-ui-bg-subtle rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-medium">Statut initial</Text>
                    <Text className="text-ui-fg-subtle text-sm">
                      {formData.is_published
                        ? "La slide sera visible des sa creation"
                        : "La slide sera enregistree comme brouillon"
                      }
                    </Text>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Preview sticky */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SlidePreview
              title={formData.title}
              subtitle={formData.subtitle}
              description={formData.description}
              badge={formData.badge}
              imageUrl={formData.image_url}
              gradient={formData.gradient}
              textColor={formData.text_color}
              overlayOpacity={Number(formData.overlay_opacity) || 0}
              ctaLabel={formData.cta_label}
              secondaryCtaLabel={formData.secondary_cta_label}
              layoutType={formData.layout_type}
              imagePosition={formData.image_position}
            />
          </div>
        </div>

        {/* Actions du formulaire */}
        <div className="flex items-center justify-end gap-4 pt-8 mt-8 border-t border-ui-border-base">
          <Link to="/cms/hero-slides">
            <Button variant="secondary" type="button">
              Annuler
            </Button>
          </Link>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <ArrowPath className="animate-spin mr-1" />
                Creation en cours...
              </>
            ) : (
              "Creer la slide"
            )}
          </Button>
        </div>
      </form>
    </Container>
  )
}

export default CreateHeroSlidePage
