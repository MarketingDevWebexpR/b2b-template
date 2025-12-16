import { Container, Heading, Text, Button, Input, Label, Select, Toaster, toast, Switch } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

type EntityType = "order" | "quote" | "return" | "credit"
type TriggerType = "always" | "amount_exceeds" | "first_order" | "credit_limit_exceeded" | "discount_exceeds"

interface WorkflowFormData {
  name: string
  entity_type: EntityType
  trigger: TriggerType
  trigger_threshold: string
  priority: string
  escalation_hours: string
  expiration_hours: string
  is_active: boolean
}

const entityTypeOptions: { value: EntityType; label: string }[] = [
  { value: "order", label: "Commande" },
  { value: "quote", label: "Devis" },
  { value: "return", label: "Retour" },
  { value: "credit", label: "Credit" },
]

const triggerOptions: { value: TriggerType; label: string }[] = [
  { value: "always", label: "Toujours" },
  { value: "amount_exceeds", label: "Montant superieur a" },
  { value: "first_order", label: "Premiere commande" },
  { value: "credit_limit_exceeded", label: "Limite de credit depassee" },
  { value: "discount_exceeds", label: "Remise superieure a" },
]

const CreateWorkflowPage = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: "",
    entity_type: "order",
    trigger: "always",
    trigger_threshold: "",
    priority: "1",
    escalation_hours: "24",
    expiration_hours: "72",
    is_active: true,
  })

  const showThresholdField = ["amount_exceeds", "discount_exceeds"].includes(formData.trigger)

  const handleInputChange = (field: keyof WorkflowFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Le nom du workflow est requis")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        entity_type: formData.entity_type,
        trigger: formData.trigger,
        trigger_threshold: showThresholdField && formData.trigger_threshold
          ? Math.round(parseFloat(formData.trigger_threshold) * 100)
          : null,
        priority: parseInt(formData.priority, 10) || 1,
        escalation_hours: parseInt(formData.escalation_hours, 10) || 24,
        expiration_hours: parseInt(formData.expiration_hours, 10) || 72,
        is_active: formData.is_active,
      }

      const response = await fetch("/admin/b2b/approvals/workflows", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Erreur lors de la creation du workflow")
      }

      toast.success("Workflow cree avec succes")

      setTimeout(() => {
        navigate("/app/b2b-approvals")
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la creation du workflow"
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
        <Link
          to="/app/b2b-approvals"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux approbations</Text>
        </Link>

        <Heading level="h1">Creer un workflow d'approbation</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Configurez les regles de declenchement et les parametres du workflow
        </Text>
      </div>

      {/* Form */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-ui-fg-base">
              Nom du workflow <span className="text-ui-tag-red-text">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Approbation commandes > 1000 EUR"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
            <Text size="small" className="text-ui-fg-subtle">
              Un nom descriptif pour identifier ce workflow
            </Text>
          </div>

          {/* Type d'entite */}
          <div className="space-y-2">
            <Label htmlFor="entity_type" className="text-ui-fg-base">
              Type d'entite
            </Label>
            <Select
              value={formData.entity_type}
              onValueChange={(value) => handleInputChange("entity_type", value)}
            >
              <Select.Trigger id="entity_type">
                <Select.Value placeholder="Selectionner un type" />
              </Select.Trigger>
              <Select.Content>
                {entityTypeOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="small" className="text-ui-fg-subtle">
              Le type d'element sur lequel ce workflow s'applique
            </Text>
          </div>

          {/* Declencheur */}
          <div className="space-y-2">
            <Label htmlFor="trigger" className="text-ui-fg-base">
              Declencheur
            </Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) => handleInputChange("trigger", value)}
            >
              <Select.Trigger id="trigger">
                <Select.Value placeholder="Selectionner un declencheur" />
              </Select.Trigger>
              <Select.Content>
                {triggerOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text size="small" className="text-ui-fg-subtle">
              La condition qui declenche ce workflow
            </Text>
          </div>

          {/* Seuil de declenchement (conditionnel) */}
          {showThresholdField && (
            <div className="space-y-2">
              <Label htmlFor="trigger_threshold" className="text-ui-fg-base">
                Seuil de declenchement (EUR)
              </Label>
              <Input
                id="trigger_threshold"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 1000"
                value={formData.trigger_threshold}
                onChange={(e) => handleInputChange("trigger_threshold", e.target.value)}
              />
              <Text size="small" className="text-ui-fg-subtle">
                Le montant a partir duquel le workflow est declenche
              </Text>
            </div>
          )}

          {/* Priorite */}
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-ui-fg-base">
              Priorite
            </Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="100"
              placeholder="1"
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
            />
            <Text size="small" className="text-ui-fg-subtle">
              Un nombre plus bas indique une priorite plus haute (1 = haute priorite)
            </Text>
          </div>

          {/* Heures d'escalade */}
          <div className="space-y-2">
            <Label htmlFor="escalation_hours" className="text-ui-fg-base">
              Delai d'escalade (heures)
            </Label>
            <Input
              id="escalation_hours"
              type="number"
              min="1"
              placeholder="24"
              value={formData.escalation_hours}
              onChange={(e) => handleInputChange("escalation_hours", e.target.value)}
            />
            <Text size="small" className="text-ui-fg-subtle">
              Nombre d'heures avant escalade au niveau superieur
            </Text>
          </div>

          {/* Heures d'expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration_hours" className="text-ui-fg-base">
              Delai d'expiration (heures)
            </Label>
            <Input
              id="expiration_hours"
              type="number"
              min="1"
              placeholder="72"
              value={formData.expiration_hours}
              onChange={(e) => handleInputChange("expiration_hours", e.target.value)}
            />
            <Text size="small" className="text-ui-fg-subtle">
              Nombre d'heures avant expiration de la demande
            </Text>
          </div>

          {/* Actif */}
          <div className="flex items-center justify-between rounded-lg border border-ui-border-base p-4">
            <div>
              <Label htmlFor="is_active" className="text-ui-fg-base cursor-pointer">
                Workflow actif
              </Label>
              <Text size="small" className="text-ui-fg-subtle">
                Activer ce workflow immediatement apres creation
              </Text>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? "Creation en cours..." : "Creer le workflow"}
            </Button>
            <Link to="/app/b2b-approvals">
              <Button type="button" variant="secondary" disabled={submitting}>
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </Container>
  )
}

export default CreateWorkflowPage
