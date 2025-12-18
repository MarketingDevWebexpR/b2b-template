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

interface CreateAnnouncementResponse {
  announcement: {
    id: string
    message: string
  }
}

const initialFormData: FormData = {
  message: "",
  link_url: "",
  link_text: "",
  background_color: "#1a1a1a",
  text_color: "#ffffff",
  start_date: "",
  end_date: "",
  is_active: true,
  priority: "0",
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
            href="#"
            className="ml-2 underline"
            style={{ color: textColor }}
            onClick={(e) => e.preventDefault()}
          >
            {linkText || "En savoir plus"}
          </a>
        )}
      </div>
    </div>
  )
}

const CreateAnnouncementPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
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

    // Validate date range if both are set
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (endDate <= startDate) {
        newErrors.end_date = "La date de fin doit être postérieure à la date de début"
      }
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

      const response = await fetch("/admin/cms/announcements", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Échec de la création de l'annonce")
      }

      const data = (await response.json()) as CreateAnnouncementResponse

      toast.success("Annonce créée avec succès")

      // Small delay to let the toast show before navigating
      setTimeout(() => {
        navigate(`/cms/announcements/${data.announcement.id}`)
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
          <span className="text-ui-fg-base font-medium">Nouvelle</span>
        </nav>

        <Heading level="h1">Nouvelle annonce</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Créer un nouveau bandeau d'annonce pour votre site
        </Text>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="max-w-2xl space-y-6">
          {/* Preview */}
          <BannerPreview
            message={formData.message}
            linkUrl={formData.link_url}
            linkText={formData.link_text}
            backgroundColor={formData.background_color}
            textColor={formData.text_color}
          />

          {/* Message Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Contenu
            </Heading>

            <div>
              <Label htmlFor="message" className="mb-2 block">
                Message <span className="text-ui-fg-error">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Ex: Livraison gratuite sur toutes les commandes de plus de 100EUR !"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                aria-invalid={!!errors.message}
                rows={3}
              />
              {errors.message && (
                <Text className="text-ui-fg-error text-sm mt-1">{errors.message}</Text>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_url" className="mb-2 block">
                  URL du lien
                </Label>
                <Input
                  id="link_url"
                  type="url"
                  placeholder="https://example.com/promo"
                  value={formData.link_url}
                  onChange={(e) => handleInputChange("link_url", e.target.value)}
                  aria-invalid={!!errors.link_url}
                />
                {errors.link_url && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.link_url}</Text>
                )}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Optionnel - lien vers une page pour plus de détails
                </Text>
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
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Texte affiché pour le lien (par défaut: "En savoir plus")
                </Text>
              </div>
            </div>
          </div>

          {/* Style Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Apparence
            </Heading>

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
          </div>

          {/* Scheduling Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Planification
            </Heading>

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
                  aria-invalid={!!errors.end_date}
                />
                {errors.end_date && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.end_date}</Text>
                )}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Laissez vide pour une durée illimitée
                </Text>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Paramètres
            </Heading>

            <div>
              <Label className="mb-2 block">Statut initial</Label>
              <div className="flex items-center gap-3 mt-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Text>{formData.is_active ? "Actif" : "Inactif"}</Text>
              </div>
              <Text className="text-ui-fg-subtle text-sm mt-1">
                Si inactif, l'annonce ne sera pas affichée même si les dates sont valides.
                L'ordre d'affichage se gère depuis la liste des annonces.
              </Text>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-ui-border-base">
            <Link to="/cms/announcements">
              <Button variant="secondary" type="button">
                Annuler
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  Création en cours...
                </>
              ) : (
                "Créer l'annonce"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default CreateAnnouncementPage
