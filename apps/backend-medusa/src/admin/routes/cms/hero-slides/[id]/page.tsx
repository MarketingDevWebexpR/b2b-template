/**
 * Page de detail et d'edition d'une slide hero
 *
 * Affiche les details d'une slide avec possibilite de:
 * - Visualiser toutes les informations
 * - Editer avec le formulaire ameliore (upload d'image, layout visuel, etc.)
 * - Publier/depublier
 * - Dupliquer
 * - Supprimer
 */

import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Switch,
  Toaster,
  toast,
} from "@medusajs/ui"
import {
  ArrowLeft,
  PencilSquare,
  Trash,
  ArrowPath,
  ExclamationCircle,
  CheckCircle,
  XCircle,
  SquareTwoStack,
} from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"

// Composants personnalises pour le formulaire
import {
  ImageUpload,
  LayoutTypeSelector,
  ColorPicker,
  SlidePreview,
  type LayoutType,
} from "../../../../components/hero-slide"

// URL du frontend Next.js pour la revalidation du cache
const NEXT_URL = typeof window !== "undefined"
  ? window.location.origin.replace(":9000", ":3000").replace("/app", "")
  : "http://localhost:3000"

/**
 * Declenche la revalidation du cache Next.js pour les hero slides
 */
const revalidateNextCache = async () => {
  try {
    await fetch(`${NEXT_URL}/api/cms/revalidate?type=hero-slides`, {
      method: "GET",
    })
  } catch (error) {
    console.warn("Echec de la revalidation du cache Next.js:", error)
  }
}

// Types
type SlideStatus = "published" | "draft" | "scheduled" | "expired"

interface SlideMetadata {
  layout_type?: LayoutType
  image_position?: "left" | "right"
  [key: string]: unknown
}

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  badge: string | null
  image_url: string | null
  image_alt: string | null
  image_file_key: string | null
  gradient: string
  text_color: string
  overlay_opacity: number
  cta_label: string
  cta_href: string
  secondary_cta_label: string | null
  secondary_cta_href: string | null
  position: number
  is_published: boolean
  start_date: string | null
  end_date: string | null
  // Champs layout directs (migration appliquee)
  layout_type: LayoutType
  image_position: "left" | "right"
  // Metadata pour compatibilite avec anciens slides
  metadata: SlideMetadata | null
  created_at: string
  updated_at: string
}

interface SlideResponse {
  slide: HeroSlide
}

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
  layout_type: LayoutType
  image_position: "left" | "right"
}

// Configuration des badges de statut
const statusColors: Record<SlideStatus, "green" | "orange" | "red" | "grey" | "blue"> = {
  published: "green",
  draft: "grey",
  scheduled: "blue",
  expired: "red",
}

const statusLabels: Record<SlideStatus, string> = {
  published: "Publie",
  draft: "Brouillon",
  scheduled: "Planifie",
  expired: "Expire",
}

// Presets de gradient
const gradientPresets = [
  { name: "Primary", value: "from-primary-700 via-primary-600 to-primary-500" },
  { name: "Accent", value: "from-accent-700 via-accent-600 to-accent-500" },
  { name: "Gold", value: "from-gold-700 via-gold-600 to-accent" },
  { name: "Success", value: "from-success-700 via-success-600 to-success-500" },
  { name: "Blue", value: "from-blue-700 via-blue-600 to-blue-500" },
  { name: "Purple", value: "from-purple-700 via-purple-600 to-purple-500" },
]

/**
 * Determine le statut d'une slide en fonction de ses dates et etat de publication
 */
const getSlideStatus = (slide: HeroSlide): SlideStatus => {
  if (!slide.is_published) {
    return "draft"
  }

  const now = new Date()
  const startDate = slide.start_date ? new Date(slide.start_date) : null
  const endDate = slide.end_date ? new Date(slide.end_date) : null

  if (endDate && now > endDate) {
    return "expired"
  }

  if (startDate && now < startDate) {
    return "scheduled"
  }

  return "published"
}

/**
 * Formate une date au format francais
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Convertit une date ISO en format datetime-local pour les inputs
 */
const toDateTimeLocal = (dateString: string | null): string => {
  if (!dateString) return ""
  const date = new Date(dateString)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Composant de dialogue de confirmation
 */
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = "primary",
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: "primary" | "danger"
  isLoading?: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay">
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 w-full max-w-md shadow-elevation-modal">
        <div className="flex items-center gap-3 mb-4">
          {confirmVariant === "danger" ? (
            <ExclamationCircle className="h-6 w-6 text-ui-tag-red-icon" />
          ) : (
            <CheckCircle className="h-6 w-6 text-ui-tag-green-icon" />
          )}
          <Heading level="h2">{title}</Heading>
        </div>
        <Text className="text-ui-fg-subtle mb-6">{message}</Text>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant={confirmVariant === "danger" ? "secondary" : "primary"}
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmVariant === "danger" ? "text-ui-tag-red-text hover:text-ui-tag-red-text" : ""}
          >
            {isLoading ? (
              <>
                <ArrowPath className="inline-block animate-spin mr-1" />
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Page de detail/edition d'une slide
 */
const HeroSlideDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"

  const [slide, setSlide] = useState<HeroSlide | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  // Etat du formulaire
  const [formData, setFormData] = useState<FormData>({
    title: "",
    subtitle: "",
    description: "",
    badge: "",
    image_url: "",
    image_alt: "",
    gradient: "from-primary-700 via-primary-600 to-primary-500",
    text_color: "#ffffff",
    overlay_opacity: "0",
    cta_label: "",
    cta_href: "",
    secondary_cta_label: "",
    secondary_cta_href: "",
    start_date: "",
    end_date: "",
    is_published: false,
    layout_type: "background",
    image_position: "right",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Etat de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /**
   * Charge les donnees de la slide
   */
  const fetchSlide = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/cms/hero-slides/${id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec du chargement de la slide")
      }

      const data = (await response.json()) as SlideResponse
      setSlide(data.slide)

      // Utiliser les champs directs avec fallback sur metadata pour compatibilite
      const metadata = data.slide.metadata || {}
      const layoutType = data.slide.layout_type || (metadata.layout_type as LayoutType) || "background"
      const imagePosition = data.slide.image_position || (metadata.image_position as "left" | "right") || "right"

      // Initialiser le formulaire avec les donnees
      setFormData({
        title: data.slide.title || "",
        subtitle: data.slide.subtitle || "",
        description: data.slide.description || "",
        badge: data.slide.badge || "",
        image_url: data.slide.image_url || "",
        image_alt: data.slide.image_alt || "",
        gradient: data.slide.gradient || "from-primary-700 via-primary-600 to-primary-500",
        text_color: data.slide.text_color || "#ffffff",
        overlay_opacity: data.slide.overlay_opacity?.toString() || "40",
        cta_label: data.slide.cta_label || "",
        cta_href: data.slide.cta_href || "",
        secondary_cta_label: data.slide.secondary_cta_label || "",
        secondary_cta_href: data.slide.secondary_cta_href || "",
        start_date: toDateTimeLocal(data.slide.start_date),
        end_date: toDateTimeLocal(data.slide.end_date),
        is_published: data.slide.is_published,
        layout_type: layoutType,
        image_position: imagePosition,
      })
    } catch (error) {
      console.error("Echec du chargement de la slide:", error)
      toast.error("Erreur lors du chargement de la slide")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchSlide()
  }, [fetchSlide])

  /**
   * Met a jour un champ du formulaire
   */
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * Valide le formulaire
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Soumet les modifications
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setSubmitting(true)

    try {
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
        // Champs layout directs
        layout_type: formData.layout_type,
        image_position: formData.image_position,
      }

      const response = await fetch(`/admin/cms/hero-slides/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la mise a jour de la slide")
      }

      toast.success("Slide mise a jour avec succes")
      setEditing(false)
      fetchSlide()

      // Revalider le cache Next.js si publie
      if (payload.is_published) {
        revalidateNextCache()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Supprime la slide
   */
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/admin/cms/hero-slides/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec de la suppression de la slide")
      }

      toast.success("Slide supprimee avec succes")
      revalidateNextCache()
      navigate("/cms/hero-slides")
    } catch (error) {
      console.error("Echec de la suppression:", error)
      toast.error("Erreur lors de la suppression de la slide")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  /**
   * Annule l'edition et restaure les donnees originales
   */
  const handleCancelEdit = () => {
    if (slide) {
      // Utiliser les champs directs avec fallback sur metadata pour compatibilite
      const metadata = slide.metadata || {}
      setFormData({
        title: slide.title || "",
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        badge: slide.badge || "",
        image_url: slide.image_url || "",
        image_alt: slide.image_alt || "",
        gradient: slide.gradient || "from-primary-700 via-primary-600 to-primary-500",
        text_color: slide.text_color || "#ffffff",
        overlay_opacity: slide.overlay_opacity?.toString() || "40",
        cta_label: slide.cta_label || "",
        cta_href: slide.cta_href || "",
        secondary_cta_label: slide.secondary_cta_label || "",
        secondary_cta_href: slide.secondary_cta_href || "",
        start_date: toDateTimeLocal(slide.start_date),
        end_date: toDateTimeLocal(slide.end_date),
        is_published: slide.is_published,
        layout_type: slide.layout_type || (metadata.layout_type as LayoutType) || "background",
        image_position: slide.image_position || (metadata.image_position as "left" | "right") || "right",
      })
    }
    setEditing(false)
    setErrors({})
  }

  /**
   * Bascule l'etat de publication
   */
  const handleTogglePublish = async () => {
    if (!slide) return

    setSubmitting(true)
    try {
      const method = slide.is_published ? "DELETE" : "POST"
      const response = await fetch(`/admin/cms/hero-slides/${id}/publish`, {
        method,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec de la mise a jour")
      }

      toast.success(slide.is_published ? "Slide depubliee" : "Slide publiee")
      fetchSlide()
      revalidateNextCache()
    } catch (error) {
      toast.error("Erreur lors de la mise a jour")
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Duplique la slide
   */
  const handleDuplicate = async () => {
    if (!slide) return

    setSubmitting(true)
    try {
      const response = await fetch(`/admin/cms/hero-slides/${id}/duplicate`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec de la duplication")
      }

      const data = (await response.json()) as SlideResponse
      toast.success("Slide dupliquee avec succes")
      navigate(`/cms/hero-slides/${data.slide.id}`)
    } catch (error) {
      toast.error("Erreur lors de la duplication")
    } finally {
      setSubmitting(false)
    }
  }

  // Affichage du chargement
  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <ArrowPath className="h-8 w-8 inline-block animate-spin text-ui-fg-muted" />
          <Text className="text-ui-fg-subtle">Chargement de la slide...</Text>
        </div>
      </Container>
    )
  }

  // Slide non trouvee
  if (!slide) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <ExclamationCircle className="h-12 w-12 text-ui-fg-muted mb-4" />
        <Text className="text-ui-fg-subtle">Slide non trouvee</Text>
        <Link to="/cms/hero-slides" className="mt-4">
          <Button variant="secondary">Retour a la liste</Button>
        </Link>
      </Container>
    )
  }

  const status = getSlideStatus(slide)
  const metadata = slide.metadata || {}
  // Utiliser les champs directs avec fallback sur metadata pour compatibilite
  const layoutType = slide.layout_type || (metadata.layout_type as LayoutType) || "background"
  const imagePosition = slide.image_position || (metadata.image_position as "left" | "right") || "right"

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la slide"
        message="Etes-vous sur de vouloir supprimer cette slide ? Cette action est irreversible."
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={deleting}
      />

      {/* Header */}
      <div className="px-6 py-4">
        {/* Breadcrumb */}
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
          <span className="text-ui-fg-base font-medium">Detail</span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Heading level="h1">{slide.title}</Heading>
              <Badge color={statusColors[status]}>{statusLabels[status]}</Badge>
              <Badge color="grey">Position: {slide.position + 1}</Badge>
            </div>
            <Text className="text-ui-fg-subtle mt-1">
              Creee le {formatDate(slide.created_at)}
            </Text>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <PencilSquare />
                  Modifier
                </Button>
                <Button variant="secondary" onClick={handleDuplicate} disabled={submitting}>
                  <SquareTwoStack />
                  Dupliquer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                >
                  <Trash />
                  Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-6 py-6">
        {editing ? (
          // Mode edition
          <form onSubmit={handleSubmit}>
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

                  {/* Position de l'image (seulement pour layout "side") */}
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

                {/* Section Image (sauf pour layout "fullwidth") */}
                {formData.layout_type !== "fullwidth" && (
                  <div className="space-y-4">
                    <Heading level="h2" className="text-ui-fg-base">
                      Image
                    </Heading>

                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => handleInputChange("image_url", url)}
                      uploadUrl={`/admin/cms/hero-slides/${id}/upload-image`}
                      label="Image de la slide"
                      helpText="Format recommande: 1920x1080px (16:9)"
                      error={errors.image_url}
                    />

                    <div>
                      <Label htmlFor="image_alt" className="mb-2 block">
                        Texte alternatif
                      </Label>
                      <Input
                        id="image_alt"
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
                    />
                  </div>

                  {/* Couleur du texte */}
                  <ColorPicker
                    value={formData.text_color}
                    onChange={(color) => handleInputChange("text_color", color)}
                    label="Couleur du texte"
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
                      />
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
                        <Text className="font-medium">Statut</Text>
                        <Text className="text-ui-fg-subtle text-sm">
                          {formData.is_published ? "Publiee" : "Brouillon"}
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
              <Button variant="secondary" type="button" onClick={handleCancelEdit}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <ArrowPath className="animate-spin mr-1" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Mode visualisation
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Details */}
            <div className="space-y-6">
              {/* Carte Contenu */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Contenu
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Titre</Text>
                    <Text className="font-medium">{slide.title}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Sous-titre</Text>
                    <Text className="font-medium">{slide.subtitle || "-"}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Description</Text>
                    <Text className="font-medium">{slide.description || "-"}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Badge</Text>
                    <Text className="font-medium">{slide.badge || "-"}</Text>
                  </div>
                </div>
              </div>

              {/* Carte CTA */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Boutons d'action
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">CTA Principal</Text>
                    <Text className="font-medium">{slide.cta_label}</Text>
                    <Text className="text-ui-fg-subtle text-sm">{slide.cta_href}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">CTA Secondaire</Text>
                    <Text className="font-medium">{slide.secondary_cta_label || "-"}</Text>
                    {slide.secondary_cta_href && (
                      <Text className="text-ui-fg-subtle text-sm">{slide.secondary_cta_href}</Text>
                    )}
                  </div>
                </div>
              </div>

              {/* Carte Apparence */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Apparence
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Layout</Text>
                    <Text className="font-medium">
                      {layoutType === "background" ? "Arriere-plan" : layoutType === "side" ? "Cote a cote" : "Pleine largeur"}
                      {layoutType === "side" && ` (image a ${imagePosition === "left" ? "gauche" : "droite"})`}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Gradient</Text>
                    <Text className="font-medium text-sm break-all">{slide.gradient}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Couleur du texte</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-ui-border-base"
                        style={{ backgroundColor: slide.text_color }}
                      />
                      <Text className="font-medium">{slide.text_color}</Text>
                    </div>
                  </div>
                  {layoutType === "background" && (
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Opacite overlay</Text>
                      <Text className="font-medium">{slide.overlay_opacity}%</Text>
                    </div>
                  )}
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Image</Text>
                    <Text className="font-medium text-sm break-all">{slide.image_url || "-"}</Text>
                  </div>
                </div>
              </div>

              {/* Carte Planification */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Planification
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de debut</Text>
                    <Text className="font-medium">
                      {slide.start_date ? formatDate(slide.start_date) : "Immediat"}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de fin</Text>
                    <Text className="font-medium">
                      {slide.end_date ? formatDate(slide.end_date) : "Illimitee"}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Position</Text>
                    <Text className="font-medium">{slide.position + 1}</Text>
                  </div>
                </div>
              </div>

              {/* Carte Actions */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Actions rapides
                </Heading>
                <div className="flex gap-3">
                  <Button
                    variant={slide.is_published ? "secondary" : "primary"}
                    onClick={handleTogglePublish}
                    disabled={submitting}
                  >
                    {slide.is_published ? (
                      <>
                        <XCircle className="mr-1" />
                        Depublier
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-1" />
                        Publier
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Metadonnees */}
              <div className="text-ui-fg-subtle text-sm">
                <Text>Derniere mise a jour : {formatDate(slide.updated_at)}</Text>
              </div>
            </div>

            {/* Colonne droite - Preview */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <SlidePreview
                title={slide.title}
                subtitle={slide.subtitle || ""}
                description={slide.description || ""}
                badge={slide.badge || ""}
                imageUrl={slide.image_url || ""}
                gradient={slide.gradient}
                textColor={slide.text_color}
                overlayOpacity={slide.overlay_opacity}
                ctaLabel={slide.cta_label}
                secondaryCtaLabel={slide.secondary_cta_label || ""}
                layoutType={layoutType}
                imagePosition={imagePosition}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default HeroSlideDetailPage
