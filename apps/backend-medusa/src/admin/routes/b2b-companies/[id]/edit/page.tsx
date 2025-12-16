import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Toaster,
  toast,
} from "@medusajs/ui"
import { ArrowLeft, ArrowPath } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"

type CompanyStatus = "pending" | "active" | "suspended" | "inactive" | "closed"
type CompanyTier = "standard" | "premium" | "enterprise" | "vip"
type PaymentTermType = "prepaid" | "net_15" | "net_30" | "net_45" | "net_60" | "net_90" | "due_on_receipt"

interface Company {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  tax_id: string | null
  status: CompanyStatus
  tier: CompanyTier
  credit_limit: number
  payment_terms: {
    type: string
    days: number
  } | null
  settings: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

interface CompanyResponse {
  company: Company
}

interface FormData {
  name: string
  email: string
  phone: string
  tax_id: string
  status: CompanyStatus
  tier: CompanyTier
  credit_limit: string
  payment_terms_type: PaymentTermType
  payment_terms_days: string
}

const statusOptions: { value: CompanyStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actif" },
  { value: "suspended", label: "Suspendu" },
  { value: "inactive", label: "Inactif" },
  { value: "closed", label: "Fermé" },
]

const profileOptions: { value: CompanyTier; label: string }[] = [
  { value: "standard", label: "Détaillant" },
  { value: "premium", label: "Grossiste" },
  { value: "enterprise", label: "Distributeur" },
  { value: "vip", label: "Partenaire stratégique" },
]

const paymentTermTypeOptions: { value: PaymentTermType; label: string }[] = [
  { value: "prepaid", label: "Paiement anticipé" },
  { value: "due_on_receipt", label: "Paiement à réception" },
  { value: "net_15", label: "Net 15 jours" },
  { value: "net_30", label: "Net 30 jours" },
  { value: "net_45", label: "Net 45 jours" },
  { value: "net_60", label: "Net 60 jours" },
  { value: "net_90", label: "Net 90 jours" },
]

const EditCompanyPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    tax_id: "",
    status: "pending",
    tier: "standard",
    credit_limit: "",
    payment_terms_type: "net_30",
    payment_terms_days: "30",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const fetchCompany = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec du chargement de l'entreprise")
      }

      const data = (await response.json()) as CompanyResponse
      const company = data.company

      // Populate form with existing data
      setFormData({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        tax_id: company.tax_id || "",
        status: company.status,
        tier: company.tier,
        credit_limit: company.credit_limit ? (company.credit_limit / 100).toString() : "",
        payment_terms_type: (company.payment_terms?.type as PaymentTermType) || "net_30",
        payment_terms_days: company.payment_terms?.days?.toString() || "30",
      })
    } catch (error) {
      console.error("Failed to fetch company:", error)
      toast.error("Erreur lors du chargement de l'entreprise")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (formData.credit_limit && isNaN(Number(formData.credit_limit))) {
      newErrors.credit_limit = "La limite de crédit doit être un nombre"
    }

    if (formData.payment_terms_days && isNaN(Number(formData.payment_terms_days))) {
      newErrors.payment_terms_days = "Le délai de paiement doit être un nombre"
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
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        tax_id: formData.tax_id.trim() || null,
        status: formData.status,
        tier: formData.tier,
        credit_limit: formData.credit_limit ? Math.round(Number(formData.credit_limit) * 100) : undefined,
        payment_terms: {
          type: formData.payment_terms_type,
          days: formData.payment_terms_days ? Number(formData.payment_terms_days) : 30,
        },
      }

      const response = await fetch(`/admin/b2b/companies/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Échec de la mise à jour de l'entreprise")
      }

      toast.success("Entreprise mise à jour avec succès")

      // Small delay to let the toast show before navigating
      setTimeout(() => {
        navigate(`/b2b-companies/${id}`)
      }, 500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <ArrowPath className="h-8 w-8 animate-spin text-ui-fg-muted" />
          <Text className="text-ui-fg-subtle">Chargement de l'entreprise...</Text>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to={`/b2b-companies/${id}`}
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux détails</Text>
        </Link>

        <Heading level="h1">Modifier l'entreprise</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Modifiez les informations de l'entreprise
        </Text>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="max-w-2xl space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Informations générales
            </Heading>

            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="col-span-2">
                <Label htmlFor="name" className="mb-2 block">
                  Nom de l'entreprise <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Bijouterie Paris"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.name}</Text>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="mb-2 block">
                  Email <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@entreprise.fr"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.email}</Text>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 1 23 45 67 89"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              {/* Tax ID */}
              <div className="col-span-2">
                <Label htmlFor="tax_id" className="mb-2 block">
                  N. TVA / SIRET
                </Label>
                <Input
                  id="tax_id"
                  placeholder="FR12345678901"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Status & Profile Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Statut et profil client
            </Heading>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <Label htmlFor="status" className="mb-2 block">
                  Statut
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionner un statut" />
                  </Select.Trigger>
                  <Select.Content>
                    {statusOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              {/* Profile */}
              <div>
                <Label htmlFor="tier" className="mb-2 block">
                  Profil client
                </Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value) => handleInputChange("tier", value)}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionner un profil" />
                  </Select.Trigger>
                  <Select.Content>
                    {profileOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>
          </div>

          {/* Credit Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Credit
            </Heading>

            <div>
              <Label htmlFor="credit_limit" className="mb-2 block">
                Limite de credit (EUR)
              </Label>
              <Input
                id="credit_limit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.credit_limit}
                onChange={(e) => handleInputChange("credit_limit", e.target.value)}
                aria-invalid={!!errors.credit_limit}
              />
              {errors.credit_limit && (
                <Text className="text-ui-fg-error text-sm mt-1">{errors.credit_limit}</Text>
              )}
              <Text className="text-ui-fg-subtle text-sm mt-1">
                Montant maximum que l'entreprise peut utiliser en credit
              </Text>
            </div>
          </div>

          {/* Payment Terms Section */}
          <div className="space-y-4">
            <Heading level="h2" className="text-ui-fg-base">
              Conditions de paiement
            </Heading>

            <div className="grid grid-cols-2 gap-4">
              {/* Payment Terms Type */}
              <div>
                <Label htmlFor="payment_terms_type" className="mb-2 block">
                  Type de paiement
                </Label>
                <Select
                  value={formData.payment_terms_type}
                  onValueChange={(value) => handleInputChange("payment_terms_type", value)}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionner un type" />
                  </Select.Trigger>
                  <Select.Content>
                    {paymentTermTypeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              {/* Payment Terms Days */}
              <div>
                <Label htmlFor="payment_terms_days" className="mb-2 block">
                  Délai (jours)
                </Label>
                <Input
                  id="payment_terms_days"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={formData.payment_terms_days}
                  onChange={(e) => handleInputChange("payment_terms_days", e.target.value)}
                  aria-invalid={!!errors.payment_terms_days}
                />
                {errors.payment_terms_days && (
                  <Text className="text-ui-fg-error text-sm mt-1">
                    {errors.payment_terms_days}
                  </Text>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-ui-border-base">
            <Link to={`/b2b-companies/${id}`}>
              <Button variant="secondary" type="button">
                Annuler
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default EditCompanyPage
