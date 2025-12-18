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
  Tag,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Photo,
  Star,
  StarSolid,
} from "@medusajs/icons"
import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"

// Types
interface Marque {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  website_url?: string | null
  country?: string | null
  is_active: boolean
  is_favorite: boolean
  rank?: number | null
  product_count?: number
  created_at: Date
  updated_at: Date
}

interface MarqueResponse {
  marque: Marque
}

interface FormData {
  name: string
  slug: string
  description: string
  website_url: string
  country: string
  is_active: boolean
}

/**
 * Genere un slug a partir d'un nom
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
}

/**
 * Formate une date au format francais
 */
const formatDate = (dateInput: Date | string): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
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
 * Composant de preview du logo (grande taille)
 */
const LogoPreviewLarge = ({ url, name }: { url: string | null | undefined; name: string }) => {
  const [hasError, setHasError] = useState(false)

  // Reset error when URL changes
  useEffect(() => {
    setHasError(false)
  }, [url])

  if (!url || hasError) {
    return (
      <div className="w-40 h-40 rounded-lg border border-ui-border-base bg-ui-bg-subtle flex items-center justify-center">
        <Tag className="h-16 w-16 text-ui-fg-muted" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Logo ${name}`}
      className="w-40 h-40 object-contain rounded-lg border border-ui-border-base bg-ui-bg-subtle"
      onError={() => setHasError(true)}
    />
  )
}

/**
 * Composant de preview du logo (taille moyenne pour le formulaire)
 */
const LogoPreview = ({ url, name }: { url: string | null | undefined; name: string }) => {
  const [hasError, setHasError] = useState(false)

  // Reset error when URL changes
  useEffect(() => {
    setHasError(false)
  }, [url])

  if (!url || hasError) {
    return (
      <div className="w-24 h-24 rounded-lg border border-ui-border-base bg-ui-bg-subtle flex items-center justify-center">
        <Tag className="h-10 w-10 text-ui-fg-muted" />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={`Logo ${name}`}
      className="w-24 h-24 object-contain rounded-lg border border-ui-border-base bg-ui-bg-subtle"
      onError={() => setHasError(true)}
    />
  )
}

/**
 * Page de detail et d'edition d'une marque sous la section PIM
 */
const PimMarqueDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get("edit") === "true"

  // State
  const [marque, setMarque] = useState<Marque | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    website_url: "",
    country: "",
    is_active: true,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [autoSlug, setAutoSlug] = useState(false)

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Logo upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Favorite toggle state
  const [togglingFavorite, setTogglingFavorite] = useState(false)

  /**
   * Charge les donnees de la marque
   */
  const fetchMarque = useCallback(async () => {
    if (!id) return

    setLoading(true)
    setNotFound(false)

    try {
      const response = await fetch(`/admin/marques/${id}`, {
        credentials: "include",
      })

      if (response.status === 404) {
        setNotFound(true)
        setMarque(null)
        return
      }

      if (!response.ok) {
        throw new Error("Echec du chargement de la marque")
      }

      const data = (await response.json()) as MarqueResponse
      setMarque(data.marque)

      // Initialize form data (without rank and logo_url)
      setFormData({
        name: data.marque.name || "",
        slug: data.marque.slug || "",
        description: data.marque.description || "",
        website_url: data.marque.website_url || "",
        country: data.marque.country || "",
        is_active: data.marque.is_active,
      })
    } catch (error) {
      console.error("Failed to fetch marque:", error)
      toast.error("Erreur lors du chargement de la marque")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMarque()
  }, [fetchMarque])

  // Sync editing mode with URL param
  useEffect(() => {
    setEditing(isEditMode)
  }, [isEditMode])

  /**
   * Met a jour un champ du formulaire
   */
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate slug when name changes and autoSlug is enabled
      if (field === "name" && autoSlug && typeof value === "string") {
        newData.slug = generateSlug(value)
      }

      // Disable auto-slug when user manually edits slug
      if (field === "slug") {
        setAutoSlug(false)
      }

      return newData
    })

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  /**
   * Valide le formulaire
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Le slug est requis"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    }

    if (formData.website_url && !formData.website_url.startsWith("http")) {
      newErrors.website_url = "L'URL doit commencer par http:// ou https://"
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
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        website_url: formData.website_url.trim() || null,
        country: formData.country.trim() || null,
        is_active: formData.is_active,
      }

      const response = await fetch(`/admin/marques/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la mise a jour de la marque")
      }

      toast.success("Marque mise a jour avec succes")
      setEditing(false)
      // Update URL to remove edit param
      navigate(`/pim/marques/${id}`, { replace: true })
      fetchMarque()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Supprime la marque
   */
  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/admin/marques/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la suppression de la marque")
      }

      toast.success("Marque supprimee avec succes")
      navigate("/pim/marques")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression"
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  /**
   * Annule l'edition et restaure les donnees originales
   */
  const handleCancelEdit = () => {
    if (marque) {
      setFormData({
        name: marque.name || "",
        slug: marque.slug || "",
        description: marque.description || "",
        website_url: marque.website_url || "",
        country: marque.country || "",
        is_active: marque.is_active,
      })
    }
    setEditing(false)
    setErrors({})
    setAutoSlug(false)
    setUploadError(null)
    // Update URL to remove edit param
    navigate(`/pim/marques/${id}`, { replace: true })
  }

  /**
   * Bascule l'etat actif/inactif
   */
  const handleToggleActive = async () => {
    if (!marque) return

    setSubmitting(true)
    try {
      const response = await fetch(`/admin/marques/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !marque.is_active,
        }),
      })

      if (!response.ok) {
        throw new Error("Echec de la mise a jour")
      }

      toast.success(marque.is_active ? "Marque desactivee" : "Marque activee")
      fetchMarque()
    } catch (error) {
      toast.error("Erreur lors de la mise a jour")
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Bascule l'etat favori
   */
  const handleToggleFavorite = async () => {
    if (!marque) return

    setTogglingFavorite(true)

    // Optimistic update
    const newFavoriteStatus = !marque.is_favorite
    setMarque((prev) => (prev ? { ...prev, is_favorite: newFavoriteStatus } : null))

    try {
      const response = await fetch(`/admin/marques/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_favorite: newFavoriteStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Echec de la mise a jour")
      }

      toast.success(
        newFavoriteStatus
          ? `"${marque.name}" ajoutee aux favoris`
          : `"${marque.name}" retiree des favoris`
      )
    } catch (error) {
      // Revert optimistic update on error
      setMarque((prev) => (prev ? { ...prev, is_favorite: marque.is_favorite } : null))
      toast.error("Erreur lors de la mise a jour du favori")
    } finally {
      setTogglingFavorite(false)
    }
  }

  /**
   * Upload du logo
   */
  const uploadLogo = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Type de fichier non autorise. Utilisez JPEG, PNG, WebP ou SVG.")
      return
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("Le fichier est trop volumineux. Taille maximum: 2 MB.")
      return
    }

    setUploading(true)
    setUploadError(null)

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    try {
      const response = await fetch(`/admin/marques/${id}/upload-logo`, {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      })

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(error.message || "Erreur lors de l'upload")
      }

      const data = (await response.json()) as MarqueResponse
      setMarque(data.marque)
      toast.success("Logo uploade avec succes")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'upload"
      setUploadError(errorMessage)
      toast.error("Erreur lors de l'upload du logo")
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  /**
   * Suppression du logo
   */
  const handleDeleteLogo = async () => {
    setUploading(true)
    setUploadError(null)

    try {
      const response = await fetch(`/admin/marques/${id}/upload-logo`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const error = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(error.message || "Erreur lors de la suppression")
      }

      const data = (await response.json()) as MarqueResponse
      setMarque(data.marque)
      toast.success("Logo supprime")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression"
      setUploadError(errorMessage)
      toast.error("Erreur lors de la suppression du logo")
    } finally {
      setUploading(false)
    }
  }

  /**
   * Gestionnaire du changement de fichier
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadLogo(file)
  }

  /**
   * Gestionnaire du drop
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await uploadLogo(file)
  }

  /**
   * Gestionnaire du drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  /**
   * Gestionnaire du drag leave
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  /**
   * Ouvre le selecteur de fichier pour changer le logo
   */
  const handleChangeLogo = () => {
    fileInputRef.current?.click()
  }

  // Affichage du chargement
  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <ArrowPath className="h-8 w-8 inline-block animate-spin text-ui-fg-muted" />
          <Text className="text-ui-fg-subtle">Chargement de la marque...</Text>
        </div>
      </Container>
    )
  }

  // Marque non trouvee (404)
  if (notFound || !marque) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <ExclamationCircle className="h-12 w-12 text-ui-fg-muted mb-4" />
        <Heading level="h2" className="mb-2">
          Marque non trouvee
        </Heading>
        <Text className="text-ui-fg-subtle mb-4">
          La marque demandee n'existe pas ou a ete supprimee.
        </Text>
        <Link to="/pim/marques">
          <Button variant="secondary">
            <ArrowLeft className="mr-1" />
            Retour a la liste
          </Button>
        </Link>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Dialogue de confirmation de suppression */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la marque"
        message={`Etes-vous sur de vouloir supprimer la marque "${marque.name}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={deleting}
      />

      {/* Header */}
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            to="/pim"
            className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            PIM
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <Link
            to="/pim/marques"
            className="flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Marques
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <span className="text-ui-fg-base font-medium">
            {marque.name}
          </span>
        </nav>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <LogoPreview url={marque.logo_url} name={marque.name} />
            <div>
              <div className="flex items-center gap-3">
                <Heading level="h1">{marque.name}</Heading>
                <Badge color={marque.is_active ? "green" : "grey"}>
                  {marque.is_active ? "Actif" : "Inactif"}
                </Badge>
                {marque.is_favorite && (
                  <Badge color="orange">Favori</Badge>
                )}
                <Badge color="grey">
                  {marque.product_count ?? 0} produit{(marque.product_count ?? 0) !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Text className="text-ui-fg-subtle mt-1">
                Slug: {marque.slug}
                {marque.country && ` | Pays: ${marque.country}`}
              </Text>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={togglingFavorite || submitting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    marque.is_favorite
                      ? "border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100"
                      : "border-ui-border-base bg-ui-bg-base text-ui-fg-subtle hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50"
                  } ${togglingFavorite ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  title={marque.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {togglingFavorite ? (
                    <ArrowPath className="h-4 w-4 animate-spin" />
                  ) : marque.is_favorite ? (
                    <StarSolid className="h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {marque.is_favorite ? "Favori" : "Ajouter aux favoris"}
                  </span>
                </button>
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

      {/* Contenu */}
      <div className="px-6 py-6">
        {editing ? (
          // Mode edition
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* Section Logo Upload */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Logo
              </Heading>

              {marque.logo_url ? (
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 border border-ui-border-base rounded-lg overflow-hidden bg-ui-bg-subtle">
                    <img
                      src={marque.logo_url}
                      alt="Logo"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleChangeLogo}
                      disabled={uploading}
                    >
                      Changer
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleDeleteLogo}
                      disabled={uploading}
                      className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                    >
                      <Trash className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-ui-fg-interactive bg-ui-bg-interactive"
                      : "border-ui-border-strong hover:border-ui-fg-interactive"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Photo className="w-8 h-8 mx-auto text-ui-fg-muted mb-2" />
                  <Text className="text-sm text-ui-fg-subtle">
                    Glissez une image ou cliquez pour parcourir
                  </Text>
                  <Text className="text-xs text-ui-fg-muted mt-1">
                    JPEG, PNG, WebP ou SVG (max 2 MB)
                  </Text>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {uploadError && (
                <Text className="text-sm text-ui-fg-error">{uploadError}</Text>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-ui-fg-subtle">
                  <ArrowPath className="w-4 h-4 animate-spin" />
                  Upload en cours...
                </div>
              )}
            </div>

            {/* Section Informations */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Informations generales
              </Heading>

              {/* Nom et Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Nom <span className="text-ui-fg-error">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Cartier"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    disabled={submitting}
                  />
                  {errors.name && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.name}</Text>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug" className="mb-2 block">
                    Slug
                  </Label>
                  <Input
                    id="slug"
                    placeholder="ex: cartier"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase())}
                    aria-invalid={!!errors.slug}
                    disabled={submitting}
                  />
                  {errors.slug && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.slug}</Text>
                  )}
                  <Text className="text-ui-fg-subtle text-sm mt-1">
                    Utilise dans l'URL: /marques/{formData.slug || "slug"}
                  </Text>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description de la marque..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Section Informations complementaires */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Details
              </Heading>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country" className="mb-2 block">
                    Pays d'origine
                  </Label>
                  <Input
                    id="country"
                    placeholder="Ex: France"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="website_url" className="mb-2 block">
                    Site web
                  </Label>
                  <Input
                    id="website_url"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange("website_url", e.target.value)}
                    aria-invalid={!!errors.website_url}
                    disabled={submitting}
                  />
                  {errors.website_url && (
                    <Text className="text-ui-fg-error text-sm mt-1">{errors.website_url}</Text>
                  )}
                </div>
              </div>
            </div>

            {/* Section Statut */}
            <div className="space-y-4">
              <Heading level="h2" className="text-ui-fg-base">
                Statut
              </Heading>

              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  disabled={submitting}
                />
                <Text>{formData.is_active ? "Actif" : "Inactif"}</Text>
              </div>
              <Text className="text-ui-fg-subtle text-sm">
                Une marque inactive n'apparait pas sur le site
              </Text>
            </div>

            {/* Actions du formulaire */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-ui-border-base">
              <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={submitting}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <ArrowPath className="animate-spin mr-1" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Mode visualisation
          <div className="space-y-6">
            {/* Logo en grand */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Logo
              </Heading>
              <LogoPreviewLarge url={marque.logo_url} name={marque.name} />
              {marque.logo_url && (
                <Text className="text-ui-fg-subtle text-sm mt-2 break-all">
                  {marque.logo_url}
                </Text>
              )}
            </div>

            {/* Grille de details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Carte Informations de base */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Informations de base
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Nom</Text>
                    <Text className="font-medium">{marque.name}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Slug</Text>
                    <Text className="font-medium">{marque.slug}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Description</Text>
                    <Text className="font-medium whitespace-pre-wrap">
                      {marque.description || "-"}
                    </Text>
                  </div>
                </div>
              </div>

              {/* Carte Details */}
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">
                  Details
                </Heading>
                <div className="space-y-4">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Pays d'origine</Text>
                    <Text className="font-medium">{marque.country || "-"}</Text>
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Site web</Text>
                    {marque.website_url ? (
                      <a
                        href={marque.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-ui-fg-interactive hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        {marque.website_url}
                      </a>
                    ) : (
                      <Text className="font-medium">-</Text>
                    )}
                  </div>
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Produits</Text>
                    <Badge color="grey">
                      {marque.product_count ?? 0} produit{(marque.product_count ?? 0) !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte Statut */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Statut
              </Heading>
              <div className="flex items-center gap-4">
                <Badge color={marque.is_active ? "green" : "grey"} className="text-base px-3 py-1">
                  {marque.is_active ? "Actif" : "Inactif"}
                </Badge>
                <Button
                  variant={marque.is_active ? "secondary" : "primary"}
                  onClick={handleToggleActive}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ArrowPath className="animate-spin mr-1" />
                  ) : marque.is_active ? (
                    <>
                      <XCircle className="mr-1" />
                      Desactiver
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

            {/* Carte Timestamps */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Historique
              </Heading>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Date de creation</Text>
                  <Text className="font-medium">{formatDate(marque.created_at)}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Derniere mise a jour</Text>
                  <Text className="font-medium">{formatDate(marque.updated_at)}</Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default PimMarqueDetailPage
