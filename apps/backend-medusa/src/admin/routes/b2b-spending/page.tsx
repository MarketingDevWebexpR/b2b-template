import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge, Table, Tabs, Select, Input, Toaster, toast } from "@medusajs/ui"
import { CurrencyDollar, MagnifyingGlass, PencilSquare } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

// ============================================================================
// Types
// ============================================================================

type EntityType = "company" | "department" | "role" | "employee"
type PeriodType = "per_order" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
type RuleCondition = "amount_exceeds" | "limit_exceeded" | "limit_warning" | "category_restricted" | "vendor_restricted" | "quantity_exceeds"
type RuleAction = "require_approval" | "notify" | "block" | "warn"

interface SpendingLimit {
  id: string
  company_id: string
  entity_type: EntityType
  entity_id: string | null
  period: PeriodType
  limit_amount: number
  warning_threshold: number
  current_spending: number
  next_reset_at: string | null
  last_transaction_at: string | null
  is_active: boolean
  name: string | null
  description: string | null
  created_at: string
  // Enhanced fields from API
  remaining_credit: number
  utilization_percentage: number
  is_over_threshold: boolean
}

interface SpendingRule {
  id: string
  company_id: string
  name: string
  description: string | null
  condition: RuleCondition
  threshold_amount: number | null
  threshold_percentage: number | null
  action: RuleAction
  applies_to_entity_types: EntityType[] | null
  applies_to_entity_ids: string[] | null
  restricted_category_ids: string[] | null
  restricted_vendor_ids: string[] | null
  notify_emails: string[] | null
  notify_customer_ids: string[] | null
  priority: number
  is_active: boolean
  approval_workflow_id: string | null
  created_at: string
}

interface LimitsResponse {
  limits: SpendingLimit[]
  count: number
  limit: number
  offset: number
}

interface RulesResponse {
  rules: SpendingRule[]
  count: number
  limit: number
  offset: number
}

// ============================================================================
// Labels & Styling Maps
// ============================================================================

const entityTypeLabels: Record<EntityType, string> = {
  company: "Entreprise",
  department: "Departement",
  role: "Role",
  employee: "Employe",
}

const entityTypeColors: Record<EntityType, "blue" | "purple" | "orange" | "green"> = {
  company: "blue",
  department: "purple",
  role: "orange",
  employee: "green",
}

const periodLabels: Record<PeriodType, string> = {
  per_order: "Par commande",
  daily: "Journalier",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
}

const conditionLabels: Record<RuleCondition, string> = {
  amount_exceeds: "Montant depasse",
  limit_exceeded: "Limite depassee",
  limit_warning: "Alerte limite",
  category_restricted: "Categorie restreinte",
  vendor_restricted: "Vendeur restreint",
  quantity_exceeds: "Quantite depassee",
}

const actionLabels: Record<RuleAction, string> = {
  require_approval: "Approbation requise",
  notify: "Notification",
  block: "Bloquer",
  warn: "Avertissement",
}

const actionColors: Record<RuleAction, "red" | "orange" | "blue" | "grey"> = {
  require_approval: "orange",
  notify: "blue",
  block: "red",
  warn: "grey",
}

// ============================================================================
// Utility Components
// ============================================================================

interface UtilizationMeterProps {
  percentage: number
  warningThreshold: number
}

const UtilizationMeter = ({ percentage, warningThreshold }: UtilizationMeterProps) => {
  const getColor = () => {
    if (percentage >= 100) return "bg-ui-tag-red-bg"
    if (percentage >= warningThreshold) return "bg-ui-tag-orange-bg"
    return "bg-ui-tag-green-bg"
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className={`h-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <Text className={`text-sm font-medium ${percentage >= 100 ? "text-ui-tag-red-text" : percentage >= warningThreshold ? "text-ui-tag-orange-text" : ""}`}>
        {percentage.toFixed(1)}%
      </Text>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

const B2BSpendingPage = () => {
  // State
  const [limits, setLimits] = useState<SpendingLimit[]>([])
  const [rules, setRules] = useState<SpendingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("limits")

  // Filters
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<string>("all")

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchLimits = async () => {
    try {
      const params = new URLSearchParams()
      if (companyFilter) params.append("company_id", companyFilter)
      if (entityTypeFilter && entityTypeFilter !== "all") params.append("entity_type", entityTypeFilter)
      if (periodFilter && periodFilter !== "all") params.append("period", periodFilter)
      params.append("limit", "100")

      const response = await fetch(`/admin/b2b/spending/limits?${params}`, {
        credentials: "include",
      })
      const data: LimitsResponse = await response.json()
      setLimits(data.limits || [])
    } catch (error) {
      console.error("Failed to fetch limits:", error)
      toast.error("Erreur lors du chargement des limites")
    }
  }

  const fetchRules = async () => {
    try {
      const params = new URLSearchParams()
      if (companyFilter) params.append("company_id", companyFilter)
      params.append("limit", "100")

      const response = await fetch(`/admin/b2b/spending/rules?${params}`, {
        credentials: "include",
      })
      const data: RulesResponse = await response.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error("Failed to fetch rules:", error)
      toast.error("Erreur lors du chargement des regles")
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([fetchLimits(), fetchRules()])
      setLoading(false)
    }
    fetchAll()
  }, [companyFilter, entityTypeFilter, periodFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLimits()
    fetchRules()
  }

  // ============================================================================
  // Formatting Utilities
  // ============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date))
  }

  // ============================================================================
  // Computed Statistics
  // ============================================================================

  const totalLimits = limits.length
  const overThresholdCount = limits.filter(l => l.is_over_threshold).length
  const activeRulesCount = rules.filter(r => r.is_active).length
  const totalSpending = limits.reduce((sum, l) => sum + Number(l.current_spending), 0)

  // Filter limits by search
  const filteredLimits = limits.filter(l => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      l.name?.toLowerCase().includes(searchLower) ||
      l.entity_id?.toLowerCase().includes(searchLower) ||
      l.company_id.toLowerCase().includes(searchLower)
    )
  })

  // Filter rules by search
  const filteredRules = rules.filter(r => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      r.name.toLowerCase().includes(searchLower) ||
      r.description?.toLowerCase().includes(searchLower) ||
      r.company_id.toLowerCase().includes(searchLower)
    )
  })

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Limites de depenses B2B</Heading>
          <Text className="text-ui-fg-subtle">
            Gerez les limites de depenses et les regles de controle
          </Text>
        </div>
        <div className="flex gap-2">
          <Link to="/app/b2b-spending/limits/create">
            <Button variant="secondary">
              Nouvelle limite
            </Button>
          </Link>
          <Link to="/app/b2b-spending/rules/create">
            <Button variant="primary">
              Nouvelle regle
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Total limites</Text>
          <Heading level="h2">{totalLimits}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Seuil depasse</Text>
          <Heading level="h2" className={overThresholdCount > 0 ? "text-ui-tag-orange-text" : ""}>
            {overThresholdCount}
          </Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Regles actives</Text>
          <Heading level="h2" className="text-ui-tag-green-text">{activeRulesCount}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Depenses totales</Text>
          <Heading level="h2">{formatCurrency(totalSpending)}</Heading>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="Rechercher par nom, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <Input
          placeholder="Company ID"
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="w-40"
        />

        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <Select.Trigger className="w-40">
            <Select.Value placeholder="Type entite" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Tous les types</Select.Item>
            <Select.Item value="company">Entreprise</Select.Item>
            <Select.Item value="department">Departement</Select.Item>
            <Select.Item value="role">Role</Select.Item>
            <Select.Item value="employee">Employe</Select.Item>
          </Select.Content>
        </Select>

        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <Select.Trigger className="w-40">
            <Select.Value placeholder="Periode" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">Toutes les periodes</Select.Item>
            <Select.Item value="per_order">Par commande</Select.Item>
            <Select.Item value="daily">Journalier</Select.Item>
            <Select.Item value="weekly">Hebdomadaire</Select.Item>
            <Select.Item value="monthly">Mensuel</Select.Item>
            <Select.Item value="quarterly">Trimestriel</Select.Item>
            <Select.Item value="yearly">Annuel</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="limits">
              Limites
              {overThresholdCount > 0 && (
                <Badge color="orange" className="ml-2">{overThresholdCount}</Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="rules">
              Regles
              <Badge color="grey" className="ml-2">{rules.length}</Badge>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Limits Tab */}
          <Tabs.Content value="limits" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Text className="text-ui-fg-subtle">Chargement...</Text>
              </div>
            ) : filteredLimits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CurrencyDollar className="text-ui-fg-muted mb-4 h-12 w-12" />
                <Text className="text-ui-fg-subtle">Aucune limite de depenses configuree</Text>
                <Link to="/app/b2b-spending/limits/create" className="mt-4">
                  <Button variant="secondary">Creer une limite</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nom / Entite</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Periode</Table.HeaderCell>
                    <Table.HeaderCell>Limite</Table.HeaderCell>
                    <Table.HeaderCell>Utilisation</Table.HeaderCell>
                    <Table.HeaderCell>Restant</Table.HeaderCell>
                    <Table.HeaderCell>Prochaine RAZ</Table.HeaderCell>
                    <Table.HeaderCell>Statut</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredLimits.map((limit) => (
                    <Table.Row key={limit.id}>
                      <Table.Cell>
                        <div>
                          <Text className="font-medium">
                            {limit.name || `Limite ${limit.entity_type}`}
                          </Text>
                          <Text className="text-ui-fg-subtle text-sm">
                            {limit.entity_id || limit.company_id}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={entityTypeColors[limit.entity_type]}>
                          {entityTypeLabels[limit.entity_type]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{periodLabels[limit.period]}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="font-medium">{formatCurrency(limit.limit_amount)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <UtilizationMeter
                          percentage={limit.utilization_percentage}
                          warningThreshold={limit.warning_threshold}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Text className={limit.remaining_credit <= 0 ? "text-ui-tag-red-text font-medium" : ""}>
                          {formatCurrency(limit.remaining_credit)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-sm">{formatDate(limit.next_reset_at)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={limit.is_active ? "green" : "grey"}>
                          {limit.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Link to={`/app/b2b-spending/limits/${limit.id}`}>
                            <Button variant="secondary" size="small">
                              Voir
                            </Button>
                          </Link>
                          <Link to={`/app/b2b-spending/limits/${limit.id}/edit`}>
                            <Button variant="secondary" size="small">
                              <PencilSquare />
                            </Button>
                          </Link>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>

          {/* Rules Tab */}
          <Tabs.Content value="rules" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Text className="text-ui-fg-subtle">Chargement...</Text>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CurrencyDollar className="text-ui-fg-muted mb-4 h-12 w-12" />
                <Text className="text-ui-fg-subtle">Aucune regle de depenses configuree</Text>
                <Link to="/app/b2b-spending/rules/create" className="mt-4">
                  <Button variant="secondary">Creer une regle</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nom</Table.HeaderCell>
                    <Table.HeaderCell>Condition</Table.HeaderCell>
                    <Table.HeaderCell>Seuil</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                    <Table.HeaderCell>Priorite</Table.HeaderCell>
                    <Table.HeaderCell>Cibles</Table.HeaderCell>
                    <Table.HeaderCell>Statut</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredRules.map((rule) => (
                    <Table.Row key={rule.id}>
                      <Table.Cell>
                        <div>
                          <Text className="font-medium">{rule.name}</Text>
                          {rule.description && (
                            <Text className="text-ui-fg-subtle text-sm line-clamp-1">
                              {rule.description}
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{conditionLabels[rule.condition]}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        {rule.threshold_amount ? (
                          <Text className="font-medium">{formatCurrency(rule.threshold_amount)}</Text>
                        ) : rule.threshold_percentage ? (
                          <Text className="font-medium">{rule.threshold_percentage}%</Text>
                        ) : (
                          <Text className="text-ui-fg-muted">-</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={actionColors[rule.action]}>
                          {actionLabels[rule.action]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="grey">{rule.priority}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-wrap gap-1">
                          {rule.applies_to_entity_types?.map((type) => (
                            <Badge key={type} color={entityTypeColors[type]} className="text-xs">
                              {entityTypeLabels[type]}
                            </Badge>
                          )) || (
                            <Text className="text-ui-fg-muted text-sm">Tous</Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={rule.is_active ? "green" : "grey"}>
                          {rule.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Link to={`/app/b2b-spending/rules/${rule.id}`}>
                            <Button variant="secondary" size="small">
                              Voir
                            </Button>
                          </Link>
                          <Link to={`/app/b2b-spending/rules/${rule.id}/edit`}>
                            <Button variant="secondary" size="small">
                              <PencilSquare />
                            </Button>
                          </Link>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>
        </Tabs>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Depenses B2B",
  icon: CurrencyDollar,
})

export default B2BSpendingPage
