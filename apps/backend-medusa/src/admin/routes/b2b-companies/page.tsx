import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Input,
  Select,
  Toaster,
  toast,
  Drawer,
  Label,
} from "@medusajs/ui"
import { Buildings, Plus, MagnifyingGlass, ArrowPath, DocumentText, ListBullet } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"

// Types
type CompanyStatus = "pending" | "active" | "suspended" | "inactive" | "closed"
type CompanyTier = "standard" | "premium" | "enterprise" | "vip"
type PaymentTermType = "prepaid" | "net_15" | "net_30" | "net_45" | "net_60" | "net_90" | "due_on_receipt"

interface PaymentTerms {
  type: PaymentTermType
  days?: number
  allowPartialPayments?: boolean
  earlyPaymentDiscount?: number
}

interface Company {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  status: CompanyStatus
  tier: CompanyTier
  credit_limit: number
  payment_terms: PaymentTerms | null
  created_at: string
}

interface CompaniesResponse {
  companies: Company[]
  count: number
  limit: number
  offset: number
}

interface CreateFormData {
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

interface CreateCompanyResponse {
  company: {
    id: string
    name: string
  }
}

// Configuration des couleurs des badges selon le statut
const statusColors: Record<CompanyStatus, "green" | "orange" | "red" | "grey" | "blue"> = {
  active: "green",
  pending: "orange",
  suspended: "red",
  inactive: "grey",
  closed: "grey",
}

const statusLabels: Record<CompanyStatus, string> = {
  active: "Actif",
  pending: "En attente",
  suspended: "Suspendu",
  inactive: "Inactif",
  closed: "Ferme",
}

// Configuration des couleurs des badges selon le tier/profil
const tierColors: Record<CompanyTier, "green" | "orange" | "red" | "grey" | "blue" | "purple"> = {
  standard: "grey",
  premium: "blue",
  enterprise: "orange",
  vip: "purple",
}

const profileLabels: Record<CompanyTier, string> = {
  standard: "Detaillant",
  premium: "Grossiste",
  enterprise: "Distributeur",
  vip: "Partenaire strategique",
}

// Labels pour les conditions de paiement
const paymentTermLabels: Record<PaymentTermType, string> = {
  prepaid: "Prepaye",
  net_15: "Net 15j",
  net_30: "Net 30j",
  net_45: "Net 45j",
  net_60: "Net 60j",
  net_90: "Net 90j",
  due_on_receipt: "A reception",
}

// Options pour le formulaire de creation
const initialCreateFormData: CreateFormData = {
  name: "",
  email: "",
  phone: "",
  tax_id: "",
  status: "pending",
  tier: "standard",
  credit_limit: "",
  payment_terms_type: "net_30",
  payment_terms_days: "30",
}

const createStatusOptions: { value: "pending" | "active"; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actif" },
]

const tierOptions: { value: CompanyTier; label: string }[] = [
  { value: "standard", label: "Detaillant" },
  { value: "premium", label: "Grossiste" },
  { value: "enterprise", label: "Distributeur" },
  { value: "vip", label: "Partenaire strategique" },
]

const paymentTermTypeOptions: { value: PaymentTermType; label: string }[] = [
  { value: "prepaid", label: "Paiement anticipe" },
  { value: "due_on_receipt", label: "Paiement a reception" },
  { value: "net_15", label: "Net 15 jours" },
  { value: "net_30", label: "Net 30 jours" },
  { value: "net_45", label: "Net 45 jours" },
  { value: "net_60", label: "Net 60 jours" },
  { value: "net_90", label: "Net 90 jours" },
]

/**
 * Formatte un montant en euros
 * Les montants sont stockes en centimes dans la base de donnees
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

/**
 * Formatte une date au format francais
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

/**
 * Formatte les conditions de paiement
 */
const formatPaymentTerms = (terms: PaymentTerms | null): string => {
  if (!terms || !terms.type) {
    return "-"
  }
  return paymentTermLabels[terms.type] || terms.type
}

/**
 * Retourne le label du profil client
 */
const getProfileLabel = (tier: CompanyTier): string => {
  return profileLabels[tier] || tier
}


const B2BCompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")

  // Create drawer state
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateFormData>(initialCreateFormData)
  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      if (tierFilter && tierFilter !== "all") params.append("tier", tierFilter)
      params.append("limit", "50")

      const response = await fetch(`/admin/b2b/companies?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec du chargement des entreprises")
      }

      const data = (await response.json()) as CompaniesResponse
      setCompanies(data.companies || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch companies:", error)
      toast.error("Erreur lors du chargement des entreprises")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, tierFilter])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCompanies()
  }

  // Create form handlers
  const handleCreateInputChange = (field: keyof CreateFormData, value: string) => {
    setCreateFormData((prev) => ({ ...prev, [field]: value }))
    if (createErrors[field]) {
      setCreateErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateCreateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateFormData, string>> = {}

    if (!createFormData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis"
    }

    if (!createFormData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createFormData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (createFormData.credit_limit && isNaN(Number(createFormData.credit_limit))) {
      newErrors.credit_limit = "La limite de credit doit etre un nombre"
    }

    if (createFormData.payment_terms_days && isNaN(Number(createFormData.payment_terms_days))) {
      newErrors.payment_terms_days = "Le delai de paiement doit etre un nombre"
    }

    setCreateErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateCreateForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: createFormData.name.trim(),
        email: createFormData.email.trim(),
        phone: createFormData.phone.trim() || undefined,
        taxId: createFormData.tax_id.trim() || undefined,
        tier: createFormData.tier,
        creditLimit: createFormData.credit_limit ? Math.round(Number(createFormData.credit_limit) * 100) : undefined,
        paymentTerms: {
          type: createFormData.payment_terms_type,
          days: createFormData.payment_terms_days ? Number(createFormData.payment_terms_days) : 30,
        },
      }

      const response = await fetch("/admin/b2b/companies", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la creation de l'entreprise")
      }

      const data = (await response.json()) as CreateCompanyResponse

      toast.success(`Entreprise "${data.company.name}" creee avec succes`)
      setShowCreateDrawer(false)
      setCreateFormData(initialCreateFormData)
      setCreateErrors({})
      fetchCompanies()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenCreateDrawer = () => {
    setCreateFormData(initialCreateFormData)
    setCreateErrors({})
    setShowCreateDrawer(true)
  }

  const handleCloseCreateDrawer = () => {
    setShowCreateDrawer(false)
    setCreateFormData(initialCreateFormData)
    setCreateErrors({})
  }

  // Calcul des statistiques depuis les entreprises chargees
  const activeCount = companies.filter((c) => c.status === "active").length
  const pendingCount = companies.filter((c) => c.status === "pending").length
  const premiumPlusCount = companies.filter((c) => c.tier !== "standard").length

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Create Company Drawer */}
      <Drawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Nouvelle entreprise B2B</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <form id="create-company-form" onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <Heading level="h2" className="text-ui-fg-base">
                  Informations generales
                </Heading>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <Label htmlFor="create-name" className="mb-2 block">
                      Nom de l'entreprise <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="create-name"
                      placeholder="Ex: Bijouterie Paris"
                      value={createFormData.name}
                      onChange={(e) => handleCreateInputChange("name", e.target.value)}
                      aria-invalid={!!createErrors.name}
                      disabled={submitting}
                    />
                    {createErrors.name && (
                      <Text className="text-ui-fg-error text-sm mt-1">{createErrors.name}</Text>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="create-email" className="mb-2 block">
                      Email <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="create-email"
                      type="email"
                      placeholder="contact@entreprise.fr"
                      value={createFormData.email}
                      onChange={(e) => handleCreateInputChange("email", e.target.value)}
                      aria-invalid={!!createErrors.email}
                      disabled={submitting}
                    />
                    {createErrors.email && (
                      <Text className="text-ui-fg-error text-sm mt-1">{createErrors.email}</Text>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="create-phone" className="mb-2 block">
                      Telephone
                    </Label>
                    <Input
                      id="create-phone"
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      value={createFormData.phone}
                      onChange={(e) => handleCreateInputChange("phone", e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="col-span-2">
                    <Label htmlFor="create-tax_id" className="mb-2 block">
                      N. TVA / SIRET
                    </Label>
                    <Input
                      id="create-tax_id"
                      placeholder="FR12345678901"
                      value={createFormData.tax_id}
                      onChange={(e) => handleCreateInputChange("tax_id", e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Status & Tier Section */}
              <div className="space-y-4">
                <Heading level="h2" className="text-ui-fg-base">
                  Statut et profil
                </Heading>

                <div className="grid grid-cols-2 gap-4">
                  {/* Status */}
                  <div>
                    <Label htmlFor="create-status" className="mb-2 block">
                      Statut
                    </Label>
                    <Select
                      value={createFormData.status}
                      onValueChange={(value) => handleCreateInputChange("status", value)}
                      disabled={submitting}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Selectionner un statut" />
                      </Select.Trigger>
                      <Select.Content>
                        {createStatusOptions.map((option) => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>

                  {/* Tier */}
                  <div>
                    <Label htmlFor="create-tier" className="mb-2 block">
                      Profil client
                    </Label>
                    <Select
                      value={createFormData.tier}
                      onValueChange={(value) => handleCreateInputChange("tier", value)}
                      disabled={submitting}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Selectionner un profil" />
                      </Select.Trigger>
                      <Select.Content>
                        {tierOptions.map((option) => (
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
                  <Label htmlFor="create-credit_limit" className="mb-2 block">
                    Limite de credit (EUR)
                  </Label>
                  <Input
                    id="create-credit_limit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={createFormData.credit_limit}
                    onChange={(e) => handleCreateInputChange("credit_limit", e.target.value)}
                    aria-invalid={!!createErrors.credit_limit}
                    disabled={submitting}
                  />
                  {createErrors.credit_limit && (
                    <Text className="text-ui-fg-error text-sm mt-1">{createErrors.credit_limit}</Text>
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
                    <Label htmlFor="create-payment_terms_type" className="mb-2 block">
                      Type de paiement
                    </Label>
                    <Select
                      value={createFormData.payment_terms_type}
                      onValueChange={(value) => handleCreateInputChange("payment_terms_type", value)}
                      disabled={submitting}
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
                    <Label htmlFor="create-payment_terms_days" className="mb-2 block">
                      Delai (jours)
                    </Label>
                    <Input
                      id="create-payment_terms_days"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={createFormData.payment_terms_days}
                      onChange={(e) => handleCreateInputChange("payment_terms_days", e.target.value)}
                      aria-invalid={!!createErrors.payment_terms_days}
                      disabled={submitting}
                    />
                    {createErrors.payment_terms_days && (
                      <Text className="text-ui-fg-error text-sm mt-1">
                        {createErrors.payment_terms_days}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={handleCloseCreateDrawer} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="create-company-form"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  Creation en cours...
                </>
              ) : (
                "Creer l'entreprise"
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Entreprises B2B</Heading>
          <Text className="text-ui-fg-subtle">
            Gerez vos entreprises clientes et leurs parametres
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/b2b-companies/referentiel">
            <Button variant="secondary">
              <ListBullet />
              Referentiel
            </Button>
          </Link>
          <Link to="/b2b-companies/docs">
            <Button variant="secondary">
              <DocumentText />
              Documentation API
            </Button>
          </Link>
          <Button variant="secondary" onClick={fetchCompanies} disabled={loading}>
            <ArrowPath className={loading ? "animate-spin" : ""} />
            Actualiser
          </Button>
          <Button variant="primary" onClick={handleOpenCreateDrawer}>
            <Plus />
            Nouvelle entreprise
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="Rechercher par nom, email ou slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <Select.Trigger>
            <Select.Value placeholder="Tous les statuts" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Tous les statuts</Select.Item>
            <Select.Item value="active">Actif</Select.Item>
            <Select.Item value="pending">En attente</Select.Item>
            <Select.Item value="suspended">Suspendu</Select.Item>
            <Select.Item value="inactive">Inactif</Select.Item>
            <Select.Item value="closed">Ferme</Select.Item>
          </Select.Content>
        </Select>

        <Select value={tierFilter} onValueChange={setTierFilter}>
          <Select.Trigger>
            <Select.Value placeholder="Tous les profils" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Tous les profils</Select.Item>
            <Select.Item value="standard">Detaillant</Select.Item>
            <Select.Item value="premium">Grossiste</Select.Item>
            <Select.Item value="enterprise">Distributeur</Select.Item>
            <Select.Item value="vip">Partenaire strategique</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Total entreprises</Text>
          <Heading level="h2">{loading ? "-" : count}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Actives</Text>
          <Heading level="h2">{loading ? "-" : activeCount}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">En attente</Text>
          <Heading level="h2">{loading ? "-" : pendingCount}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Grossistes+</Text>
          <Heading level="h2">{loading ? "-" : premiumPlusCount}</Heading>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <ArrowPath className="h-8 w-8 animate-spin text-ui-fg-muted" />
              <Text className="text-ui-fg-subtle">Chargement des entreprises...</Text>
            </div>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Buildings className="text-ui-fg-muted mb-4 h-12 w-12" />
            <Text className="text-ui-fg-subtle">Aucune entreprise trouvee</Text>
            <Button variant="secondary" className="mt-4" onClick={handleOpenCreateDrawer}>
              Creer une entreprise
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="min-w-[200px]">Entreprise</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[120px]">Telephone</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Statut</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[140px]">Profil client</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Paiement</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[120px]">Limite credit</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Creation</Table.HeaderCell>
                  <Table.HeaderCell className="w-[80px]"></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {companies.map((company) => (
                  <Table.Row key={company.id} className="hover:bg-ui-bg-subtle-hover">
                    <Table.Cell>
                      <div className="flex flex-col">
                        <Link
                          to={`/b2b-companies/${company.id}`}
                          className="font-medium text-ui-fg-base hover:text-ui-fg-interactive transition-colors"
                        >
                          {company.name}
                        </Link>
                        <Text className="text-ui-fg-subtle text-sm truncate max-w-[180px]">
                          {company.email}
                        </Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="text-ui-fg-subtle text-sm">
                        {company.phone || "-"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={statusColors[company.status]}>
                        {statusLabels[company.status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={tierColors[company.tier]}>
                        {getProfileLabel(company.tier)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="text-ui-fg-subtle text-sm">
                        {formatPaymentTerms(company.payment_terms)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="font-medium">
                        {formatCurrency(company.credit_limit)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="text-ui-fg-subtle text-sm">
                        {formatDate(company.created_at)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Link to={`/b2b-companies/${company.id}`}>
                        <Button variant="secondary" size="small">
                          Voir
                        </Button>
                      </Link>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Entreprises B2B",
  icon: Buildings,
})

export default B2BCompaniesPage
