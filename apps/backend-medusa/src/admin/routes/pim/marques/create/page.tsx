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
import { ArrowLeft, ArrowPath, Photo } from "@medusajs/icons"
import { useState, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"

/**
 * Interface des donnees du formulaire
 */
interface FormData {
  name: string
  slug: string
  description: string
  website_url: string
  country: string
  is_active: boolean
}

/**
 * Interface de reponse API
 */
interface CreateMarqueResponse {
  marque: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Interface erreur API
 */
interface ApiError {
  message?: string
  error?: string
}

/**
 * Valeurs initiales du formulaire
 */
const initialFormData: FormData = {
  name: "",
  slug: "",
  description: "",
  website_url: "",
  country: "",
  is_active: true,
}

/**
 * Genere un slug a partir d'un nom
 * - Convertit en minuscules
 * - Supprime les accents
 * - Remplace les espaces par des tirets
 * - Supprime les caracteres speciaux
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplace tout ce qui n'est pas alphanum par des tirets
    .replace(/^-|-$/g, "") // Supprime les tirets en debut/fin
}

/**
 * Page de creation d'une nouvelle marque sous la section PIM
 */
const CreateMarquePage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [autoSlug, setAutoSlug] = useState(true)

  /**
   * Met a jour un champ du formulaire
   */
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value }

        // Generation automatique du slug quand le nom change et que autoSlug est actif
        if (field === "name" && autoSlug && typeof value === "string") {
          newData.slug = generateSlug(value)
        }

        // Desactiver autoSlug quand l'utilisateur modifie manuellement le slug
        if (field === "slug") {
          setAutoSlug(false)
        }

        return newData
      })

      // Effacer l'erreur du champ modifie
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    },
    [autoSlug, errors]
  )

  /**
   * Reactive la generation automatique du slug
   */
  const handleResetAutoSlug = useCallback(() => {
    setAutoSlug(true)
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(prev.name),
    }))
  }, [])

  /**
   * Valide le formulaire avant soumission
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Nom requis
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caracteres"
    }

    // Validation du slug si fourni
    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    }

    // Validation URL du site web
    if (formData.website_url && !formData.website_url.startsWith("http")) {
      newErrors.website_url = "L'URL doit commencer par http:// ou https://"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

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
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
        website_url: formData.website_url.trim() || undefined,
        country: formData.country.trim() || undefined,
        is_active: formData.is_active,
      }

      const response = await fetch("/admin/marques", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ApiError
        const errorMessage =
          errorData.message || errorData.error || "Echec de la creation de la marque"

        // Gestion des erreurs specifiques
        if (response.status === 409 || errorMessage.toLowerCase().includes("slug")) {
          setErrors({ slug: "Ce slug est deja utilise par une autre marque" })
          throw new Error("Ce slug est deja utilise")
        }
        if (errorMessage.toLowerCase().includes("name")) {
          setErrors({ name: errorMessage })
          throw new Error(errorMessage)
        }

        throw new Error(errorMessage)
      }

      const data = (await response.json()) as CreateMarqueResponse

      toast.success(`Marque "${data.marque.name}" creee avec succes`)

      // Redirection vers la page d'edition pour permettre l'upload du logo
      setTimeout(() => {
        navigate(`/pim/marques/${data.marque.id}?edit=true`)
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
          <span className="text-ui-fg-base font-medium">Nouvelle marque</span>
        </nav>

        <Heading level="h1">Creer une marque</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Ajoutez une nouvelle marque pour vos produits
        </Text>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="max-w-2xl space-y-8">
          {/* Section Logo - Message informatif */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Logo
            </Heading>

            <div className="border-2 border-dashed border-ui-border-base rounded-lg p-6 bg-ui-bg-subtle">
              <div className="flex flex-col items-center text-center">
                <Photo className="w-10 h-10 text-ui-fg-muted mb-3" />
                <Text className="text-ui-fg-subtle font-medium">
                  Vous pourrez ajouter un logo apres la creation
                </Text>
                <Text className="text-ui-fg-muted text-sm mt-1">
                  Une fois la marque creee, vous serez redirige vers la page d'edition pour uploader le logo
                </Text>
              </div>
            </div>
          </div>

          {/* Section Informations generales */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Informations generales
            </Heading>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div>
                <Label htmlFor="name" className="mb-2 block">
                  Nom <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Cartier, Swarovski, Pandora..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  aria-required="true"
                  disabled={submitting}
                />
                {errors.name && (
                  <Text id="name-error" className="text-ui-fg-error text-sm mt-1">
                    {errors.name}
                  </Text>
                )}
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug" className="mb-2 block">
                  Slug
                  {autoSlug && (
                    <span className="text-ui-fg-subtle text-xs ml-2">(auto-genere)</span>
                  )}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder="ex: cartier"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value.toLowerCase())}
                    aria-invalid={!!errors.slug}
                    aria-describedby={errors.slug ? "slug-error" : "slug-hint"}
                    disabled={submitting}
                    className="flex-1"
                  />
                  {!autoSlug && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResetAutoSlug}
                      disabled={submitting}
                      title="Regenerer automatiquement le slug"
                    >
                      <ArrowPath className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {errors.slug ? (
                  <Text id="slug-error" className="text-ui-fg-error text-sm mt-1">
                    {errors.slug}
                  </Text>
                ) : (
                  <Text id="slug-hint" className="text-ui-fg-subtle text-sm mt-1">
                    Utilise dans l'URL: /marques/{formData.slug || "slug"}
                  </Text>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Description de la marque, son histoire, ses specialites..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                disabled={submitting}
                aria-describedby="description-hint"
              />
              <Text id="description-hint" className="text-ui-fg-subtle text-sm mt-1">
                Description optionnelle affichee sur la page de la marque
              </Text>
            </div>
          </div>

          {/* Section Informations complementaires */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Informations complementaires
            </Heading>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site web */}
              <div>
                <Label htmlFor="website_url" className="mb-2 block">
                  Site web officiel
                </Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.website_url}
                  onChange={(e) => handleInputChange("website_url", e.target.value)}
                  aria-invalid={!!errors.website_url}
                  aria-describedby={errors.website_url ? "website_url-error" : undefined}
                  disabled={submitting}
                />
                {errors.website_url && (
                  <Text id="website_url-error" className="text-ui-fg-error text-sm mt-1">
                    {errors.website_url}
                  </Text>
                )}
              </div>

              {/* Pays */}
              <div>
                <Label htmlFor="country" className="mb-2 block">
                  Pays d'origine
                </Label>
                <Input
                  id="country"
                  placeholder="Ex: France, Italie, Autriche..."
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Statut
            </Heading>

            <div className="p-4 bg-ui-bg-subtle rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active" className="font-medium cursor-pointer">
                    Marque active
                  </Label>
                  <Text className="text-ui-fg-subtle text-sm mt-1">
                    {formData.is_active
                      ? "La marque sera visible sur le site public"
                      : "La marque ne sera pas visible sur le site public"}
                  </Text>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-ui-border-base">
            <Link to="/pim/marques">
              <Button variant="secondary" type="button" disabled={submitting}>
                Annuler
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-2" />
                  Creation en cours...
                </>
              ) : (
                "Creer la marque"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default CreateMarquePage
