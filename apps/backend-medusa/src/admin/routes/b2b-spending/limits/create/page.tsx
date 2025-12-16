import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  Toaster,
  toast,
} from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

// ============================================================================
// Types
// ============================================================================

type EntityType = "company" | "department" | "role" | "employee"
type PeriodType = "per_order" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

interface FormData {
  name: string
  description: string
  company_id: string
  entity_type: EntityType
  entity_id: string
  period: PeriodType
  limit_amount: string
  warning_threshold: string
  is_active: boolean
}

// ============================================================================
// Labels
// ============================================================================

const entityTypeLabels: Record<EntityType, string> = {
  company: "Entreprise",
  department: "Departement",
  role: "Role",
  employee: "Employe",
}

const periodLabels: Record<PeriodType, string> = {
  per_order: "Par commande",
  daily: "Journalier",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  yearly: "Annuel",
}

// ============================================================================
// Main Component
// ============================================================================

const CreateSpendingLimitPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    company_id: "",
    entity_type: "company",
    entity_id: "",
    period: "monthly",
    limit_amount: "",
    warning_threshold: "80",
    is_active: true,
  })

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.company_id.trim()) {
      toast.error("L'ID de l'entreprise est requis")
      return
    }

    if (!formData.limit_amount || Number(formData.limit_amount) <= 0) {
      toast.error("Le montant limite doit etre un nombre positif")
      return
    }

    // Entity ID required for non-company types
    if (formData.entity_type !== "company" && !formData.entity_id.trim()) {
      toast.error(`L'ID de l'entite est requis pour le type "${entityTypeLabels[formData.entity_type]}"`)
      return
    }

    setLoading(true)

    try {
      // Convert limit_amount from EUR to cents
      const limitAmountInCents = Math.round(Number(formData.limit_amount) * 100)

      const requestBody: Record<string, unknown> = {
        company_id: formData.company_id.trim(),
        entity_type: formData.entity_type,
        period: formData.period,
        limit_amount: limitAmountInCents,
        warning_threshold: Number(formData.warning_threshold) || 80,
      }

      // Optional fields
      if (formData.name.trim()) {
        requestBody.name = formData.name.trim()
      }

      if (formData.description.trim()) {
        requestBody.description = formData.description.trim()
      }

      // Entity ID only for non-company types
      if (formData.entity_type !== "company" && formData.entity_id.trim()) {
        requestBody.entity_id = formData.entity_id.trim()
      }

      const response = await fetch("/admin/b2b/spending/limits", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || "Erreur lors de la creation de la limite")
      }

      toast.success("Limite de depenses creee avec succes")

      // Redirect after a short delay to show the toast
      setTimeout(() => {
        navigate("/app/b2b-spending")
      }, 1000)
    } catch (error) {
      console.error("Failed to create spending limit:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la creation de la limite"
      )
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  const showEntityIdField = formData.entity_type !== "company"

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/app/b2b-spending"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux limites de depenses</Text>
        </Link>

        <Heading level="h1">Nouvelle limite de depenses</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Configurez une nouvelle limite de depenses pour une entreprise ou une entite
        </Text>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        <div className="max-w-2xl space-y-6">
          {/* Section: Informations generales */}
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">
              Informations generales
            </Heading>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la limite</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Limite mensuelle departement achats"
                />
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Optionnel - Un nom descriptif pour identifier cette limite
                </Text>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description detaillee de la limite..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section: Configuration de l'entite */}
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">
              Configuration de l'entite
            </Heading>

            <div className="space-y-4">
              <div>
                <Label htmlFor="company_id">
                  ID de l'entreprise <span className="text-ui-tag-red-text">*</span>
                </Label>
                <Input
                  id="company_id"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  placeholder="comp_01..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="entity_type">Type d'entite</Label>
                <Select
                  value={formData.entity_type}
                  onValueChange={handleSelectChange("entity_type")}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionnez le type d'entite" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="company">
                      {entityTypeLabels.company}
                    </Select.Item>
                    <Select.Item value="department">
                      {entityTypeLabels.department}
                    </Select.Item>
                    <Select.Item value="role">
                      {entityTypeLabels.role}
                    </Select.Item>
                    <Select.Item value="employee">
                      {entityTypeLabels.employee}
                    </Select.Item>
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Definit a quel niveau cette limite s'applique
                </Text>
              </div>

              {showEntityIdField && (
                <div>
                  <Label htmlFor="entity_id">
                    ID de l'entite <span className="text-ui-tag-red-text">*</span>
                  </Label>
                  <Input
                    id="entity_id"
                    name="entity_id"
                    value={formData.entity_id}
                    onChange={handleInputChange}
                    placeholder={
                      formData.entity_type === "department"
                        ? "dept_01..."
                        : formData.entity_type === "role"
                        ? "role_01..."
                        : "emp_01..."
                    }
                    required={showEntityIdField}
                  />
                  <Text className="text-ui-fg-subtle text-sm mt-1">
                    L'identifiant de l'entite ({entityTypeLabels[formData.entity_type]}) a laquelle cette limite s'applique
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Section: Parametres de la limite */}
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">
              Parametres de la limite
            </Heading>

            <div className="space-y-4">
              <div>
                <Label htmlFor="period">Periode</Label>
                <Select
                  value={formData.period}
                  onValueChange={handleSelectChange("period")}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionnez la periode" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="per_order">
                      {periodLabels.per_order}
                    </Select.Item>
                    <Select.Item value="daily">
                      {periodLabels.daily}
                    </Select.Item>
                    <Select.Item value="weekly">
                      {periodLabels.weekly}
                    </Select.Item>
                    <Select.Item value="monthly">
                      {periodLabels.monthly}
                    </Select.Item>
                    <Select.Item value="quarterly">
                      {periodLabels.quarterly}
                    </Select.Item>
                    <Select.Item value="yearly">
                      {periodLabels.yearly}
                    </Select.Item>
                  </Select.Content>
                </Select>
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  La periode sur laquelle la limite est calculee
                </Text>
              </div>

              <div>
                <Label htmlFor="limit_amount">
                  Montant limite (EUR) <span className="text-ui-tag-red-text">*</span>
                </Label>
                <Input
                  id="limit_amount"
                  name="limit_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.limit_amount}
                  onChange={handleInputChange}
                  placeholder="1000.00"
                  required
                />
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Le montant maximum de depenses autorise pour cette periode (en euros)
                </Text>
              </div>

              <div>
                <Label htmlFor="warning_threshold">
                  Seuil d'alerte (%)
                </Label>
                <Input
                  id="warning_threshold"
                  name="warning_threshold"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.warning_threshold}
                  onChange={handleInputChange}
                  placeholder="80"
                />
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Une alerte sera declenchee lorsque ce pourcentage de la limite est atteint (par defaut: 80%)
                </Text>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-ui-border-base text-ui-fg-interactive focus:ring-ui-fg-interactive"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Limite active
                </Label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link to="/app/b2b-spending">
              <Button variant="secondary" type="button">
                Annuler
              </Button>
            </Link>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Creation en cours..." : "Creer la limite"}
            </Button>
          </div>
        </div>
      </form>
    </Container>
  )
}

export default CreateSpendingLimitPage
