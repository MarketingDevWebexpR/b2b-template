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
} from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"

// Next.js frontend URL for revalidation
const NEXT_URL = typeof window !== "undefined"
  ? window.location.origin.replace(":9000", ":3000").replace("/app", "")
  : "http://localhost:3000"

/**
 * Trigger Next.js cache revalidation for announcements
 */
const revalidateNextCache = async () => {
  try {
    await fetch(`${NEXT_URL}/api/cms/revalidate?type=announcements`, {
      method: "GET",
    })
  } catch (error) {
    console.warn("Failed to revalidate Next.js cache:", error)
  }
}

// Types
type AnnouncementStatus = "active" | "inactive" | "scheduled" | "expired"

interface Announcement {
  id: string
  message: string
  link_url: string | null
  link_text: string | null
  background_color: string
  text_color: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

interface AnnouncementResponse {
  announcement: Announcement
}

interface FormData {
  message: string
  link_url: string
  link_text: string
  background_color: string
  text_color: string
  start_date: string
  end_date: string
  is_active: boolean
  priority: string
}

// Configuration des couleurs des badges selon le statut
const statusColors: Record<AnnouncementStatus, "green" | "orange" | "red" | "grey" | "blue"> = {
  active: "green",
  inactive: "grey",
  scheduled: "blue",
  expired: "red",
}

const statusLabels: Record<AnnouncementStatus, string> = {
  active: "Actif",
  inactive: "Inactif",
  scheduled: "Planifié",
  expired: "Expiré",
}

/**
 * Détermine le statut d'une annonce en fonction de ses dates et de son état actif
 */
const getAnnouncementStatus = (announcement: Announcement): AnnouncementStatus => {
  if (!announcement.is_active) {
    return "inactive"
  }

  const now = new Date()
  const startDate = announcement.start_date ? new Date(announcement.start_date) : null
  const endDate = announcement.end_date ? new Date(announcement.end_date) : null

  // Si une date de fin est définie et dépassée
  if (endDate && now > endDate) {
    return "expired"
  }

  // Si une date de début est définie et pas encore atteinte
  if (startDate && now < startDate) {
    return "scheduled"
  }

  return "active"
}

/**
 * Formate une date au format français
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
  // Format: YYYY-MM-DDTHH:MM
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// Confirmation Dialog Component
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

// Banner Preview Component
const BannerPreview = ({
  message,
  linkUrl,
  linkText,
  backgroundColor,
  textColor,
}: {
  message: string
  linkUrl: string
  linkText: string
  backgroundColor: string
  textColor: string
}) => {
  return (
    <div className="rounded-lg border border-ui-border-base overflow-hidden">
      <div className="px-4 py-2 bg-ui-bg-subtle border-b border-ui-border-base">
        <Text className="text-ui-fg-subtle text-sm font-medium">Aperçu du bandeau</Text>
      </div>
      <div
        className="px-4 py-3 text-center"
        style={{ backgroundColor, color: textColor }}
      >
        <span>{message || "Votre message apparaîtra ici..."}</span>
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline"
            style={{ color: textColor }}
          >
            {linkText || "En savoir plus"}
          </a>
        )}
      </div>
    </div>
  )
}

const AnnouncementDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"

  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    message: "",
    link_url: "",
    link_text: "",
    background_color: "#1a1a1a",
    text_color: "#ffffff",
    start_date: "",
    end_date: "",
    is_active: true,
    priority: "0",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchAnnouncement = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/cms/announcements/${id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec du chargement de l'annonce")
      }

      const data = (await response.json()) as AnnouncementResponse
      setAnnouncement(data.announcement)

      // Initialize form data
      setFormData({
        message: data.announcement.message || "",
        link_url: data.announcement.link_url || "",
        link_text: data.announcement.link_text || "",
        background_color: data.announcement.background_color || "#1a1a1a",
        text_color: data.announcement.text_color || "#ffffff",
        start_date: toDateTimeLocal(data.announcement.start_date),
        end_date: toDateTimeLocal(data.announcement.end_date),
        is_active: data.announcement.is_active,
        priority: data.announcement.priority?.toString() || "0",
      })
    } catch (error) {
      console.error("Failed to fetch announcement:", error)
      toast.error("Erreur lors du chargement de l'annonce")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAnnouncement()
  }, [fetchAnnouncement])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis"
    }

    if (formData.link_url && !formData.link_url.startsWith("http")) {
      newErrors.link_url = "L'URL doit commencer par http:// ou https://"
    }

    if (formData.priority && isNaN(Number(formData.priority))) {
      newErrors.priority = "La priorité doit être un nombre"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        message: formData.message.trim(),
        link_url: formData.link_url.trim() || null,
        link_text: formData.link_text.trim() || null,
        background_color: formData.background_color,
        text_color: formData.text_color,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_active: formData.is_active,
        priority: Number(formData.priority) || 0,
      }

      const response = await fetch(`/admin/cms/announcements/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Échec de la mise à jour de l'annonce")
      }

      toast.success("Annonce mise à jour avec succès")
      setEditing(false)
      fetchAnnouncement()

      // Revalidate Next.js cache
      revalidateNextCache()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/admin/cms/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la suppression de l'annonce")
      }

      toast.success("Annonce supprimée avec succès")

      // Revalidate Next.js cache
      revalidateNextCache()

      navigate("/cms/announcements")
    } catch (error) {
      console.error("Failed to delete announcement:", error)
      toast.error("Erreur lors de la suppression de l'annonce")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleCancelEdit = () => {
    if (announcement) {
      setFormData({
        message: announcement.message || "",
        link_url: announcement.link_url || "",
        link_text: announcement.link_text || "",
        background_color: announcement.background_color || "#1a1a1a",
        text_color: announcement.text_color || "#ffffff",
        start_date: toDateTimeLocal(announcement.start_date),
        end_date: toDateTimeLocal(announcement.end_date),
        is_active: announcement.is_active,
        priority: announcement.priority?.toString() || "0",
      })
    }
    setEditing(false)
    setErrors({})
  }

  const handleToggleActive = async () => {
    if (!announcement) return

    setSubmitting(true)
    try {
      const response = await fetch(`/admin/cms/announcements/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !announcement.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error("Échec de la mise à jour")
      }

      toast.success(announcement.is_active ? "Annonce désactivée" : "Annonce activée")
      fetchAnnouncement()

      // Always revalidate on toggle active
      revalidateNextCache()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <ArrowPath className="h-8 w-8 inline-block animate-spin text-ui-fg-muted" />
          <Text className="text-ui-fg-subtle">Chargement de l'annonce...</Text>
        </div>
      </Container>
    )
  }

  if (!announcement) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <ExclamationCircle className="h-12 w-12 text-ui-fg-muted mb-4" />
        <Text className="text-ui-fg-subtle">Annonce non trouvée</Text>
        <Link to="/cms" className="mt-4">
          <Button variant="secondary">Retour à la liste</Button>
        </Link>
      </Container>
    )
  }

  const status = getAnnouncementStatus(announcement)

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'annonce"
        message="Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."
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
            to="/cms/announcements"
            className="flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Annonces
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <span className="text-ui-fg-base font-medium">Detail</span>
        </nav>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Heading level="h1">Détail de l'annonce</Heading>
              <Badge color={statusColors[status]}>{statusLabels[status]}</Badge>
            </div>
            <Text className="text-ui-fg-subtle mt-1">
              Créée le {formatDate(announcement.created_at)}
            </Text>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <PencilSquare />
                  Modifier
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

      {/* Content */}
      <div className="px-6 py-6">
        {editing ? (
          // Edit Form
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* Preview */}
            <BannerPreview
              message={formData.message}
              linkUrl={formData.link_url}
              linkText={formData.link_text}
              backgroundColor={formData.background_color}
              textColor={formData.text_color}
            />

            {/* Message */}
            <div>
              <Label htmlFor="message" className="mb-2 block">
                Message <span className="text-ui-fg-error">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Entrez votre message d'annonce..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                aria-invalid={!!errors.message}
                rows={3}
              />
              {errors.message && (
                <Text className="text-ui-fg-error text-sm mt-1">{errors.message}</Text>
              )}
            </div>

            {/* Link URL & Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_url" className="mb-2 block">
                  URL du lien
                </Label>
                <Input
                  id="link_url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.link_url}
                  onChange={(e) => handleInputChange("link_url", e.target.value)}
                  aria-invalid={!!errors.link_url}
                />
                {errors.link_url && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.link_url}</Text>
                )}
              </div>
              <div>
                <Label htmlFor="link_text" className="mb-2 block">
                  Texte du lien
                </Label>
                <Input
                  id="link_text"
                  placeholder="En savoir plus"
                  value={formData.link_text}
                  onChange={(e) => handleInputChange("link_text", e.target.value)}
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="background_color" className="mb-2 block">
                  Couleur de fond
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="background_color"
                    value={formData.background_color}
                    onChange={(e) => handleInputChange("background_color", e.target.value)}
                    className="w-10 h-10 rounded border border-ui-border-base cursor-pointer"
                  />
                  <Input
                    value={formData.background_color}
                    onChange={(e) => handleInputChange("background_color", e.target.value)}
                    placeholder="#1a1a1a"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text_color" className="mb-2 block">
                  Couleur du texte
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="text_color"
                    value={formData.text_color}
                    onChange={(e) => handleInputChange("text_color", e.target.value)}
                    className="w-10 h-10 rounded border border-ui-border-base cursor-pointer"
                  />
                  <Input
                    value={formData.text_color}
                    onChange={(e) => handleInputChange("text_color", e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="mb-2 block">
                  Date de début
                </Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Laissez vide pour un début immédiat
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
                />
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Laissez vide pour une durée illimitée
                </Text>
              </div>
            </div>

            {/* Active Status */}
            <div>
              <Label className="mb-2 block">Statut</Label>
              <div className="flex items-center gap-3 mt-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Text>{formData.is_active ? "Actif" : "Inactif"}</Text>
              </div>
              <Text className="text-ui-fg-subtle text-sm mt-2">
                L'ordre d'affichage se gère depuis la liste des annonces
              </Text>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-ui-border-base">
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
          // View Mode
          <div className="max-w-2xl space-y-6">
            {/* Preview */}
            <BannerPreview
              message={announcement.message}
              linkUrl={announcement.link_url || ""}
              linkText={announcement.link_text || ""}
              backgroundColor={announcement.background_color}
              textColor={announcement.text_color}
            />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Info Card */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Informations
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Message</Text>
                    <Text className="font-medium">{announcement.message}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">URL du lien</Text>
                    <Text className="font-medium">
                      {announcement.link_url ? (
                        <a
                          href={announcement.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ui-fg-interactive hover:underline"
                        >
                          {announcement.link_url}
                        </a>
                      ) : (
                        "-"
                      )}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Texte du lien</Text>
                    <Text className="font-medium">{announcement.link_text || "-"}</Text>
                  </div>
                </div>
              </div>

              {/* Style & Dates Card */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Style et planification
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Couleur de fond</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-ui-border-base"
                        style={{ backgroundColor: announcement.background_color }}
                      />
                      <Text className="font-medium">{announcement.background_color}</Text>
                    </div>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Couleur du texte</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-6 h-6 rounded border border-ui-border-base"
                        style={{ backgroundColor: announcement.text_color }}
                      />
                      <Text className="font-medium">{announcement.text_color}</Text>
                    </div>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de début</Text>
                    <Text className="font-medium">
                      {announcement.start_date ? formatDate(announcement.start_date) : "Immédiat"}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de fin</Text>
                    <Text className="font-medium">
                      {announcement.end_date ? formatDate(announcement.end_date) : "Illimitée"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Actions rapides
              </Heading>
              <div className="flex gap-3">
                <Button
                  variant={announcement.is_active ? "secondary" : "primary"}
                  onClick={handleToggleActive}
                  disabled={submitting}
                >
                  {announcement.is_active ? (
                    <>
                      <XCircle className="mr-1" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-1" />
                      Activer
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-ui-fg-subtle text-sm">
              <Text>Dernière mise à jour : {formatDate(announcement.updated_at)}</Text>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default AnnouncementDetailPage
