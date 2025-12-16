import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Tabs,
  Toaster,
  toast,
  Select,
  Textarea,
  Label,
  Input,
  Drawer,
} from "@medusajs/ui"
import {
  ArrowLeft,
  PencilSquare,
  Trash,
  ExclamationCircle,
  ArrowPath,
  XCircle,
  CheckCircle,
  Plus,
  Buildings,
  ChevronRight,
  ChevronDown,
  User,
  EllipsisHorizontal,
} from "@medusajs/icons"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"

type CompanyStatus = "pending" | "active" | "suspended" | "inactive" | "closed"
type CompanyTier = "standard" | "premium" | "enterprise" | "vip"
type PaymentTermType = "prepaid" | "net_15" | "net_30" | "net_45" | "net_60" | "net_90" | "due_on_receipt"

// Organizational Unit Types
type UnitType = "department" | "service" | "team" | "division" | "branch" | "office"

interface OrganizationalUnit {
  id: string
  company_id: string
  name: string
  type: UnitType
  description: string | null
  parent_id: string | null
  manager_id: string | null
  manager_name?: string | null
  member_count: number
  children?: OrganizationalUnit[]
  created_at: string
  updated_at: string
}

interface UnitFormData {
  name: string
  type: UnitType
  parent_id: string | null
  description: string
  manager_id: string | null
}

const unitTypeLabels: Record<UnitType, string> = {
  department: "Departement",
  service: "Service",
  team: "Equipe",
  division: "Division",
  branch: "Branche",
  office: "Bureau",
}

const unitTypeColors: Record<UnitType, "blue" | "purple" | "green" | "orange" | "grey" | "red"> = {
  department: "blue",
  service: "purple",
  team: "green",
  division: "orange",
  branch: "grey",
  office: "red",
}

const unitTypeOptions: { value: UnitType; label: string }[] = [
  { value: "department", label: "Departement" },
  { value: "service", label: "Service" },
  { value: "team", label: "Equipe" },
  { value: "division", label: "Division" },
  { value: "branch", label: "Branche" },
  { value: "office", label: "Bureau" },
]

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

interface EditFormData {
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

const statusColors: Record<CompanyStatus, "green" | "orange" | "red" | "grey"> = {
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

const profileLabels: Record<CompanyTier, string> = {
  standard: "Detaillant",
  premium: "Grossiste",
  enterprise: "Distributeur",
  vip: "Partenaire strategique",
}

const getProfileLabel = (tier: string): string => {
  return profileLabels[tier as CompanyTier] || tier
}

// Payment term type labels
const paymentTermTypeLabels: Record<string, string> = {
  prepaid: "Paiement anticipe",
  due_on_receipt: "Paiement a reception",
  net_15: "Net 15 jours",
  net_30: "Net 30 jours",
  net_45: "Net 45 jours",
  net_60: "Net 60 jours",
  net_90: "Net 90 jours",
}

// Helper function to get payment term label
const getPaymentTermLabel = (type: string | undefined): string => {
  if (!type) return "Non defini"
  return paymentTermTypeLabels[type] || type
}

// Edit form options
const statusOptions: { value: CompanyStatus; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "Actif" },
  { value: "suspended", label: "Suspendu" },
  { value: "inactive", label: "Inactif" },
  { value: "closed", label: "Ferme" },
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

// ==========================================
// UNIT MODAL COMPONENT
// ==========================================

interface UnitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UnitFormData) => Promise<void>
  editingUnit: OrganizationalUnit | null
  allUnits: OrganizationalUnit[]
  isLoading: boolean
  parentId?: string | null
}

const UnitModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingUnit,
  allUnits,
  isLoading,
  parentId,
}: UnitModalProps) => {
  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    type: "department",
    parent_id: null,
    description: "",
    manager_id: null,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UnitFormData, string>>>({})

  // Reset form when modal opens/closes or editing unit changes
  useEffect(() => {
    if (isOpen) {
      if (editingUnit) {
        setFormData({
          name: editingUnit.name,
          type: editingUnit.type,
          parent_id: editingUnit.parent_id,
          description: editingUnit.description || "",
          manager_id: editingUnit.manager_id,
        })
      } else {
        setFormData({
          name: "",
          type: "department",
          parent_id: parentId || null,
          description: "",
          manager_id: null,
        })
      }
      setErrors({})
    }
  }, [isOpen, editingUnit, parentId])

  const handleInputChange = (field: keyof UnitFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UnitFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'unite est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await onSubmit(formData)
  }

  // Flatten units for parent selector (excluding current unit and its descendants)
  const getAvailableParents = (): OrganizationalUnit[] => {
    const flattenUnits = (units: OrganizationalUnit[]): OrganizationalUnit[] => {
      return units.reduce((acc: OrganizationalUnit[], unit) => {
        // Skip current unit being edited and its descendants
        if (editingUnit && unit.id === editingUnit.id) {
          return acc
        }
        acc.push(unit)
        if (unit.children && unit.children.length > 0) {
          acc.push(...flattenUnits(unit.children))
        }
        return acc
      }, [])
    }
    return flattenUnits(allUnits)
  }

  if (!isOpen) return null

  const availableParents = getAvailableParents()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay">
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg w-full max-w-lg shadow-elevation-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
          <Heading level="h2">
            {editingUnit ? "Modifier l'unite" : "Nouvelle unite organisationnelle"}
          </Heading>
          <button
            onClick={onClose}
            className="text-ui-fg-subtle hover:text-ui-fg-base"
            disabled={isLoading}
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="unit-name" className="mb-2 block">
              Nom <span className="text-ui-fg-error">*</span>
            </Label>
            <Input
              id="unit-name"
              placeholder="Ex: Direction Commerciale"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              aria-invalid={!!errors.name}
              disabled={isLoading}
            />
            {errors.name && (
              <Text className="text-ui-fg-error text-sm mt-1">{errors.name}</Text>
            )}
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="unit-type" className="mb-2 block">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
              disabled={isLoading}
            >
              <Select.Trigger>
                <Select.Value placeholder="Selectionner un type" />
              </Select.Trigger>
              <Select.Content>
                {unitTypeOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {/* Parent Unit */}
          <div>
            <Label htmlFor="unit-parent" className="mb-2 block">
              Unite parente
            </Label>
            <Select
              value={formData.parent_id || "none"}
              onValueChange={(value) => handleInputChange("parent_id", value === "none" ? null : value)}
              disabled={isLoading}
            >
              <Select.Trigger>
                <Select.Value placeholder="Aucune (racine)" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="none">Aucune (racine)</Select.Item>
                {availableParents.map((unit) => (
                  <Select.Item key={unit.id} value={unit.id}>
                    {unit.name} ({unitTypeLabels[unit.type]})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Text className="text-ui-fg-subtle text-sm mt-1">
              Laissez vide pour creer une unite de premier niveau
            </Text>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="unit-description" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="unit-description"
              placeholder="Description de l'unite organisationnelle..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Manager - Placeholder for customer selector */}
          <div>
            <Label htmlFor="unit-manager" className="mb-2 block">
              Responsable
            </Label>
            <Input
              id="unit-manager"
              placeholder="ID du responsable (optionnel)"
              value={formData.manager_id || ""}
              onChange={(e) => handleInputChange("manager_id", e.target.value || null)}
              disabled={isLoading}
            />
            <Text className="text-ui-fg-subtle text-sm mt-1">
              Identifiant du client responsable de cette unite
            </Text>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-ui-border-base">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <ArrowPath className="inline-block animate-spin mr-1" />
                  {editingUnit ? "Mise a jour..." : "Creation..."}
                </>
              ) : (
                editingUnit ? "Mettre a jour" : "Creer"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// TREE NODE COMPONENT
// ==========================================

interface TreeNodeProps {
  unit: OrganizationalUnit
  level: number
  expandedNodes: Set<string>
  onToggle: (id: string) => void
  onEdit: (unit: OrganizationalUnit) => void
  onDelete: (unit: OrganizationalUnit) => void
  onAddChild: (parentId: string) => void
}

const TreeNode = ({
  unit,
  level,
  expandedNodes,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
}: TreeNodeProps) => {
  const hasChildren = unit.children && unit.children.length > 0
  const isExpanded = expandedNodes.has(unit.id)
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="select-none">
      {/* Node row */}
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-ui-bg-base-hover group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={() => hasChildren && onToggle(unit.id)}
          className={`w-5 h-5 flex items-center justify-center rounded ${
            hasChildren ? "hover:bg-ui-bg-subtle cursor-pointer" : "cursor-default opacity-0"
          }`}
          aria-label={isExpanded ? "Reduire" : "Developper"}
          disabled={!hasChildren}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-ui-fg-muted" />
            ) : (
              <ChevronRight className="h-4 w-4 text-ui-fg-muted" />
            )
          )}
        </button>

        {/* Unit icon */}
        <Buildings className="h-4 w-4 text-ui-fg-muted flex-shrink-0" />

        {/* Unit name and info */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Text className="font-medium truncate">{unit.name}</Text>
          <Badge color={unitTypeColors[unit.type]} className="flex-shrink-0">
            {unitTypeLabels[unit.type]}
          </Badge>
          <Text className="text-ui-fg-subtle text-sm flex-shrink-0">
            <User className="h-3 w-3 inline mr-1" />
            {unit.member_count} membre{unit.member_count !== 1 ? "s" : ""}
          </Text>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="transparent"
            size="small"
            onClick={() => onAddChild(unit.id)}
            className="text-ui-fg-subtle hover:text-ui-fg-base"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Button
              variant="transparent"
              size="small"
              onClick={() => setShowActions(!showActions)}
              className="text-ui-fg-subtle hover:text-ui-fg-base"
            >
              <EllipsisHorizontal className="h-4 w-4" />
            </Button>
            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-elevation-flyout min-w-32">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-ui-bg-base-hover flex items-center gap-2"
                    onClick={() => {
                      onEdit(unit)
                      setShowActions(false)
                    }}
                  >
                    <PencilSquare className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-ui-bg-base-hover flex items-center gap-2 text-ui-tag-red-text"
                    onClick={() => {
                      onDelete(unit)
                      setShowActions(false)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {unit.children!.map((child) => (
            <TreeNode
              key={child.id}
              unit={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ==========================================
// ORGANIZATION TAB COMPONENT
// ==========================================

interface OrganizationTabProps {
  companyId: string
}

const OrganizationTab = ({ companyId }: OrganizationTabProps) => {
  const [units, setUnits] = useState<OrganizationalUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [showUnitModal, setShowUnitModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null)
  const [deletingUnit, setDeletingUnit] = useState<OrganizationalUnit | null>(null)
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch organizational units tree
  const fetchUnits = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${companyId}/units/tree`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec du chargement des unites")
      }

      const data = (await response.json()) as { units: OrganizationalUnit[] }
      setUnits(data.units || [])

      // Auto-expand first level
      if (data.units) {
        const firstLevelIds = data.units.map((u) => u.id)
        setExpandedNodes(new Set(firstLevelIds))
      }
    } catch (error) {
      console.error("Failed to fetch units:", error)
      toast.error("Erreur lors du chargement des unites organisationnelles")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchUnits()
  }, [fetchUnits])

  // Flatten units for modal selector
  const allFlatUnits = useMemo(() => {
    const flatten = (units: OrganizationalUnit[]): OrganizationalUnit[] => {
      return units.reduce((acc: OrganizationalUnit[], unit) => {
        acc.push(unit)
        if (unit.children && unit.children.length > 0) {
          acc.push(...flatten(unit.children))
        }
        return acc
      }, [])
    }
    return flatten(units)
  }, [units])

  const handleToggle = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleExpandAll = () => {
    const getAllIds = (units: OrganizationalUnit[]): string[] => {
      return units.reduce((acc: string[], unit) => {
        acc.push(unit.id)
        if (unit.children && unit.children.length > 0) {
          acc.push(...getAllIds(unit.children))
        }
        return acc
      }, [])
    }
    setExpandedNodes(new Set(getAllIds(units)))
  }

  const handleCollapseAll = () => {
    setExpandedNodes(new Set())
  }

  const openAddModal = (parentId: string | null = null) => {
    setEditingUnit(null)
    setParentIdForNew(parentId)
    setShowUnitModal(true)
  }

  const openEditModal = (unit: OrganizationalUnit) => {
    setEditingUnit(unit)
    setParentIdForNew(null)
    setShowUnitModal(true)
  }

  const handleSubmitUnit = async (formData: UnitFormData) => {
    setSubmitting(true)
    try {
      const url = editingUnit
        ? `/admin/b2b/companies/${companyId}/units/${editingUnit.id}`
        : `/admin/b2b/companies/${companyId}/units`

      const method = editingUnit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          type: formData.type,
          parentId: formData.parent_id,
          description: formData.description.trim() || null,
          managerId: formData.manager_id,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de l'operation")
      }

      toast.success(editingUnit ? "Unite mise a jour avec succes" : "Unite creee avec succes")
      setShowUnitModal(false)
      setEditingUnit(null)
      setParentIdForNew(null)
      fetchUnits()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return

    setSubmitting(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${companyId}/units/${deletingUnit.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la suppression")
      }

      toast.success("Unite supprimee avec succes")
      setDeletingUnit(null)
      fetchUnits()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue"
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const totalUnits = allFlatUnits.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <ArrowPath className="h-8 w-8 inline-block animate-spin text-ui-fg-muted" />
        <Text className="text-ui-fg-subtle ml-2">Chargement des unites...</Text>
      </div>
    )
  }

  return (
    <>
      {/* Unit Modal */}
      <UnitModal
        isOpen={showUnitModal}
        onClose={() => {
          setShowUnitModal(false)
          setEditingUnit(null)
          setParentIdForNew(null)
        }}
        onSubmit={handleSubmitUnit}
        editingUnit={editingUnit}
        allUnits={units}
        isLoading={submitting}
        parentId={parentIdForNew}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingUnit}
        onClose={() => setDeletingUnit(null)}
        onConfirm={handleDeleteUnit}
        title="Supprimer l'unite"
        message={
          deletingUnit
            ? `Etes-vous sur de vouloir supprimer l'unite "${deletingUnit.name}" ? ${
                deletingUnit.children && deletingUnit.children.length > 0
                  ? "Attention: les sous-unites seront egalement supprimees."
                  : ""
              }`
            : ""
        }
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={submitting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h2">Structure organisationnelle</Heading>
          <Text className="text-ui-fg-subtle">
            {totalUnits} unite{totalUnits !== 1 ? "s" : ""} organisationnelle{totalUnits !== 1 ? "s" : ""}
          </Text>
        </div>
        <div className="flex gap-2">
          {units.length > 0 && (
            <>
              <Button variant="transparent" size="small" onClick={handleExpandAll}>
                Tout developper
              </Button>
              <Button variant="transparent" size="small" onClick={handleCollapseAll}>
                Tout reduire
              </Button>
            </>
          )}
          <Button variant="primary" onClick={() => openAddModal(null)}>
            <Plus className="mr-1" />
            Ajouter une unite
          </Button>
        </div>
      </div>

      {/* Tree View */}
      {units.length === 0 ? (
        <div className="rounded-lg border border-ui-border-base p-8 text-center">
          <Buildings className="h-12 w-12 text-ui-fg-muted mx-auto mb-4" />
          <Heading level="h3" className="mb-2">
            Aucune unite organisationnelle
          </Heading>
          <Text className="text-ui-fg-subtle mb-4">
            Commencez par creer une unite pour definir la structure de l'entreprise.
          </Text>
          <Button variant="primary" onClick={() => openAddModal(null)}>
            <Plus className="mr-1" />
            Creer la premiere unite
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-ui-border-base">
          {units.map((unit) => (
            <TreeNode
              key={unit.id}
              unit={unit}
              level={0}
              expandedNodes={expandedNodes}
              onToggle={handleToggle}
              onEdit={openEditModal}
              onDelete={setDeletingUnit}
              onAddChild={openAddModal}
            />
          ))}
        </div>
      )}
    </>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Confirmation dialog states
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<CompanyStatus | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Edit drawer state
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData>({
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
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditFormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)

  const fetchCompany = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec du chargement de l'entreprise")
      }

      const data = (await response.json()) as CompanyResponse
      setCompany(data.company)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount / 100)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const requestStatusChange = (newStatus: CompanyStatus) => {
    setPendingStatus(newStatus)
    setShowStatusConfirm(true)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return

    setUpdating(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: pendingStatus }),
      })

      if (!response.ok) {
        throw new Error("Echec de la mise a jour du statut")
      }

      toast.success(`Statut mis a jour: ${statusLabels[pendingStatus]}`)
      fetchCompany()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Erreur lors de la mise a jour du statut")
    } finally {
      setUpdating(false)
      setShowStatusConfirm(false)
      setPendingStatus(null)
    }
  }

  const handleDelete = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/admin/b2b/companies/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec de la suppression de l'entreprise")
      }

      toast.success("Entreprise supprimee avec succes")
      navigate("/b2b-companies")
    } catch (error) {
      console.error("Failed to delete company:", error)
      toast.error("Erreur lors de la suppression de l'entreprise")
    } finally {
      setUpdating(false)
      setShowDeleteConfirm(false)
    }
  }

  const getStatusConfirmMessage = () => {
    if (!pendingStatus || !company) return ""

    switch (pendingStatus) {
      case "active":
        return `Etes-vous sur de vouloir activer l'entreprise "${company.name}" ? Elle pourra passer des commandes.`
      case "suspended":
        return `Etes-vous sur de vouloir suspendre l'entreprise "${company.name}" ? Elle ne pourra plus passer de commandes.`
      case "inactive":
        return `Etes-vous sur de vouloir desactiver l'entreprise "${company.name}" ?`
      case "closed":
        return `Etes-vous sur de vouloir fermer l'entreprise "${company.name}" ? Cette action est generalement irreversible.`
      default:
        return `Etes-vous sur de vouloir changer le statut de l'entreprise "${company.name}" ?`
    }
  }

  // Edit form handlers
  const handleOpenEditDrawer = () => {
    if (!company) return

    setEditFormData({
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
    setEditErrors({})
    setShowEditDrawer(true)
  }

  const handleCloseEditDrawer = () => {
    setShowEditDrawer(false)
    setEditErrors({})
  }

  const handleEditInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateEditForm = (): boolean => {
    const newErrors: Partial<Record<keyof EditFormData, string>> = {}

    if (!editFormData.name.trim()) {
      newErrors.name = "Le nom de l'entreprise est requis"
    }

    if (!editFormData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    if (editFormData.credit_limit && isNaN(Number(editFormData.credit_limit))) {
      newErrors.credit_limit = "La limite de credit doit etre un nombre"
    }

    if (editFormData.payment_terms_days && isNaN(Number(editFormData.payment_terms_days))) {
      newErrors.payment_terms_days = "Le delai de paiement doit etre un nombre"
    }

    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEditForm()) {
      toast.error("Veuillez corriger les erreurs du formulaire")
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim() || null,
        tax_id: editFormData.tax_id.trim() || null,
        status: editFormData.status,
        tier: editFormData.tier,
        credit_limit: editFormData.credit_limit ? Math.round(Number(editFormData.credit_limit) * 100) : undefined,
        payment_terms: {
          type: editFormData.payment_terms_type,
          days: editFormData.payment_terms_days ? Number(editFormData.payment_terms_days) : 30,
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
        throw new Error(errorData.message || "Echec de la mise a jour de l'entreprise")
      }

      toast.success("Entreprise mise a jour avec succes")
      setShowEditDrawer(false)
      fetchCompany()
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
          <ArrowPath className="h-8 w-8 inline-block animate-spin text-ui-fg-muted" />
          <Text className="text-ui-fg-subtle">Chargement de l'entreprise...</Text>
        </div>
      </Container>
    )
  }

  if (!company) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <ExclamationCircle className="h-12 w-12 text-ui-fg-muted mb-4" />
        <Text className="text-ui-fg-subtle">Entreprise non trouvee</Text>
        <Link to="/b2b-companies" className="mt-4">
          <Button variant="secondary">Retour a la liste</Button>
        </Link>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Edit Company Drawer */}
      <Drawer open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Modifier l'entreprise</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <form id="edit-company-form" onSubmit={handleEditSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <Heading level="h2" className="text-ui-fg-base">
                  Informations generales
                </Heading>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <Label htmlFor="edit-name" className="mb-2 block">
                      Nom de l'entreprise <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      placeholder="Ex: Bijouterie Paris"
                      value={editFormData.name}
                      onChange={(e) => handleEditInputChange("name", e.target.value)}
                      aria-invalid={!!editErrors.name}
                      disabled={submitting}
                    />
                    {editErrors.name && (
                      <Text className="text-ui-fg-error text-sm mt-1">{editErrors.name}</Text>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="edit-email" className="mb-2 block">
                      Email <span className="text-ui-fg-error">*</span>
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="contact@entreprise.fr"
                      value={editFormData.email}
                      onChange={(e) => handleEditInputChange("email", e.target.value)}
                      aria-invalid={!!editErrors.email}
                      disabled={submitting}
                    />
                    {editErrors.email && (
                      <Text className="text-ui-fg-error text-sm mt-1">{editErrors.email}</Text>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="edit-phone" className="mb-2 block">
                      Telephone
                    </Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      placeholder="+33 1 23 45 67 89"
                      value={editFormData.phone}
                      onChange={(e) => handleEditInputChange("phone", e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="col-span-2">
                    <Label htmlFor="edit-tax_id" className="mb-2 block">
                      N. TVA / SIRET
                    </Label>
                    <Input
                      id="edit-tax_id"
                      placeholder="FR12345678901"
                      value={editFormData.tax_id}
                      onChange={(e) => handleEditInputChange("tax_id", e.target.value)}
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
                    <Label htmlFor="edit-status" className="mb-2 block">
                      Statut
                    </Label>
                    <Select
                      value={editFormData.status}
                      onValueChange={(value) => handleEditInputChange("status", value)}
                      disabled={submitting}
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

                  {/* Tier */}
                  <div>
                    <Label htmlFor="edit-tier" className="mb-2 block">
                      Profil client
                    </Label>
                    <Select
                      value={editFormData.tier}
                      onValueChange={(value) => handleEditInputChange("tier", value)}
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
                  <Label htmlFor="edit-credit_limit" className="mb-2 block">
                    Limite de credit (EUR)
                  </Label>
                  <Input
                    id="edit-credit_limit"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={editFormData.credit_limit}
                    onChange={(e) => handleEditInputChange("credit_limit", e.target.value)}
                    aria-invalid={!!editErrors.credit_limit}
                    disabled={submitting}
                  />
                  {editErrors.credit_limit && (
                    <Text className="text-ui-fg-error text-sm mt-1">{editErrors.credit_limit}</Text>
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
                    <Label htmlFor="edit-payment_terms_type" className="mb-2 block">
                      Type de paiement
                    </Label>
                    <Select
                      value={editFormData.payment_terms_type}
                      onValueChange={(value) => handleEditInputChange("payment_terms_type", value)}
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
                    <Label htmlFor="edit-payment_terms_days" className="mb-2 block">
                      Delai (jours)
                    </Label>
                    <Input
                      id="edit-payment_terms_days"
                      type="number"
                      min="0"
                      placeholder="30"
                      value={editFormData.payment_terms_days}
                      onChange={(e) => handleEditInputChange("payment_terms_days", e.target.value)}
                      aria-invalid={!!editErrors.payment_terms_days}
                      disabled={submitting}
                    />
                    {editErrors.payment_terms_days && (
                      <Text className="text-ui-fg-error text-sm mt-1">
                        {editErrors.payment_terms_days}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={handleCloseEditDrawer} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="edit-company-form"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  Mise a jour...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showStatusConfirm}
        onClose={() => {
          setShowStatusConfirm(false)
          setPendingStatus(null)
        }}
        onConfirm={confirmStatusChange}
        title="Confirmer le changement de statut"
        message={getStatusConfirmMessage()}
        confirmText={pendingStatus ? statusLabels[pendingStatus] : "Confirmer"}
        confirmVariant={pendingStatus === "suspended" || pendingStatus === "closed" ? "danger" : "primary"}
        isLoading={updating}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'entreprise"
        message={`Etes-vous sur de vouloir supprimer l'entreprise "${company.name}" ? Cette action est irreversible et toutes les donnees associees seront perdues.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={updating}
      />

      {/* Header */}
      <div className="px-6 py-4">
        <Link to="/b2b-companies" className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base">
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux entreprises</Text>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Heading level="h1">{company.name}</Heading>
              <Badge color={statusColors[company.status]}>
                {statusLabels[company.status]}
              </Badge>
              <Badge color="blue">{getProfileLabel(company.tier)}</Badge>
            </div>
            <Text className="text-ui-fg-subtle mt-1">{company.email}</Text>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleOpenEditDrawer}>
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
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="px-6 py-4">
        <Tabs.List>
          <Tabs.Trigger value="overview">Vue d'ensemble</Tabs.Trigger>
          <Tabs.Trigger value="organisation">Organisation</Tabs.Trigger>
          <Tabs.Trigger value="settings">Parametres</Tabs.Trigger>
          <Tabs.Trigger value="activity">Activite</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Info Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">Informations</Heading>
              <div className="space-y-4">
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Slug</Text>
                  <Text className="font-medium">{company.slug}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Email</Text>
                  <Text className="font-medium">{company.email}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Telephone</Text>
                  <Text className="font-medium">{company.phone || "Non renseigne"}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">N. TVA / SIRET</Text>
                  <Text className="font-medium">{company.tax_id || "Non renseigne"}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Date de creation</Text>
                  <Text className="font-medium">{formatDate(company.created_at)}</Text>
                </div>
              </div>
            </div>

            {/* Payment Terms Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">Conditions de paiement</Heading>
              <div className="space-y-4">
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Type</Text>
                  <Text className="font-medium">
                    {getPaymentTermLabel(company.payment_terms?.type)}
                  </Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Delai</Text>
                  <Text className="font-medium">
                    {company.payment_terms?.days || 30} jours
                  </Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Limite de credit</Text>
                  <Text className="font-medium">
                    {company.credit_limit ? formatCurrency(company.credit_limit) : "Non definie"}
                  </Text>
                </div>
              </div>
            </div>

            {/* Status Actions Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">Actions</Heading>
              <div className="space-y-3">
                {company.status === "pending" && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => requestStatusChange("active")}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-1" />
                    Activer l'entreprise
                  </Button>
                )}
                {company.status === "active" && (
                  <Button
                    variant="secondary"
                    className="w-full text-ui-tag-orange-text"
                    onClick={() => requestStatusChange("suspended")}
                    disabled={updating}
                  >
                    <XCircle className="mr-1" />
                    Suspendre l'entreprise
                  </Button>
                )}
                {company.status === "suspended" && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => requestStatusChange("active")}
                    disabled={updating}
                  >
                    <CheckCircle className="mr-1" />
                    Reactiver l'entreprise
                  </Button>
                )}
                {(company.status === "active" || company.status === "suspended") && (
                  <Button
                    variant="secondary"
                    className="w-full text-ui-tag-red-text"
                    onClick={() => requestStatusChange("closed")}
                    disabled={updating}
                  >
                    <Trash className="mr-1" />
                    Fermer l'entreprise
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="organisation" className="mt-6">
          <OrganizationTab companyId={company.id} />
        </Tabs.Content>

        <Tabs.Content value="settings" className="mt-6">
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">Parametres de l'entreprise</Heading>
            <Text className="text-ui-fg-subtle">
              Les parametres de l'entreprise seront affiches ici.
            </Text>
            <pre className="mt-4 p-4 bg-ui-bg-subtle rounded-lg text-sm overflow-auto">
              {JSON.stringify(company.settings, null, 2) || "{}"}
            </pre>
          </div>
        </Tabs.Content>

        <Tabs.Content value="activity" className="mt-6">
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">Historique d'activite</Heading>
            <Text className="text-ui-fg-subtle">
              L'historique des commandes, devis et transactions sera affiche ici.
            </Text>
          </div>
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export default CompanyDetailPage
