import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Tabs,
  Input,
  Toaster,
  toast,
  Drawer,
  Label,
  Textarea,
  Select,
} from "@medusajs/ui"
import { ArrowLeft, Plus, PencilSquare, Trash, ExclamationCircle, ArrowPath, XCircle } from "@medusajs/icons"
import { useState, useCallback } from "react"
import { Link } from "react-router-dom"

// ==========================================
// TYPES
// ==========================================

type BadgeColor = "green" | "orange" | "red" | "blue" | "purple" | "grey"

interface ReferenceItem {
  code: string
  label: string
  description?: string
  color?: BadgeColor
  defaultDays?: number
  companiesCount: number
}

interface CustomerProfile extends ReferenceItem {
  color: BadgeColor
}

interface CompanyStatus extends ReferenceItem {
  color: BadgeColor
}

interface PaymentTerm extends ReferenceItem {
  defaultDays: number
}

// ==========================================
// DEFAULT DATA
// ==========================================

const defaultCustomerProfiles: CustomerProfile[] = [
  {
    code: "detaillant",
    label: "Detaillant",
    description: "Client detaillant avec volumes standards",
    color: "grey",
    companiesCount: 12,
  },
  {
    code: "grossiste",
    label: "Grossiste",
    description: "Client grossiste avec volumes importants",
    color: "blue",
    companiesCount: 5,
  },
  {
    code: "distributeur",
    label: "Distributeur",
    description: "Distributeur agree avec conditions specifiques",
    color: "orange",
    companiesCount: 3,
  },
  {
    code: "partenaire_strategique",
    label: "Partenaire strategique",
    description: "Partenaire strategique avec privileges etendus",
    color: "purple",
    companiesCount: 1,
  },
]

const defaultCompanyStatuses: CompanyStatus[] = [
  {
    code: "pending",
    label: "En attente",
    description: "Entreprise en attente de validation",
    color: "orange",
    companiesCount: 4,
  },
  {
    code: "active",
    label: "Actif",
    description: "Entreprise active pouvant passer des commandes",
    color: "green",
    companiesCount: 15,
  },
  {
    code: "suspended",
    label: "Suspendu",
    description: "Entreprise temporairement suspendue",
    color: "red",
    companiesCount: 2,
  },
  {
    code: "inactive",
    label: "Inactif",
    description: "Entreprise inactive",
    color: "grey",
    companiesCount: 0,
  },
  {
    code: "closed",
    label: "Ferme",
    description: "Entreprise definitivement fermee",
    color: "grey",
    companiesCount: 0,
  },
]

const defaultPaymentTerms: PaymentTerm[] = [
  {
    code: "prepaid",
    label: "Paiement anticipe",
    description: "Paiement avant expedition",
    defaultDays: 0,
    companiesCount: 3,
  },
  {
    code: "due_on_receipt",
    label: "A reception",
    description: "Paiement a reception de la facture",
    defaultDays: 0,
    companiesCount: 2,
  },
  {
    code: "net_15",
    label: "Net 15 jours",
    description: "Paiement sous 15 jours",
    defaultDays: 15,
    companiesCount: 4,
  },
  {
    code: "net_30",
    label: "Net 30 jours",
    description: "Paiement sous 30 jours",
    defaultDays: 30,
    companiesCount: 8,
  },
  {
    code: "net_45",
    label: "Net 45 jours",
    description: "Paiement sous 45 jours",
    defaultDays: 45,
    companiesCount: 2,
  },
  {
    code: "net_60",
    label: "Net 60 jours",
    description: "Paiement sous 60 jours",
    defaultDays: 60,
    companiesCount: 1,
  },
  {
    code: "net_90",
    label: "Net 90 jours",
    description: "Paiement sous 90 jours",
    defaultDays: 90,
    companiesCount: 1,
  },
]

const colorOptions: { value: BadgeColor; label: string }[] = [
  { value: "green", label: "Vert" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Rouge" },
  { value: "blue", label: "Bleu" },
  { value: "purple", label: "Violet" },
  { value: "grey", label: "Gris" },
]

// ==========================================
// CONFIRMATION DIALOG COMPONENT
// ==========================================

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: "primary" | "danger"
  isLoading?: boolean
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationDialogProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ui-bg-overlay">
      <div className="bg-ui-bg-base border border-ui-border-base rounded-lg p-6 w-full max-w-md shadow-elevation-modal">
        <div className="flex items-center gap-3 mb-4">
          <ExclamationCircle className="h-6 w-6 text-ui-tag-red-icon" />
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
// CUSTOMER PROFILES TAB
// ==========================================

interface ProfileFormData {
  code: string
  label: string
  description: string
  color: BadgeColor
}

const initialProfileFormData: ProfileFormData = {
  code: "",
  label: "",
  description: "",
  color: "grey",
}

interface CustomerProfilesTabProps {
  profiles: CustomerProfile[]
  onAdd: (profile: CustomerProfile) => void
  onUpdate: (code: string, profile: CustomerProfile) => void
  onDelete: (code: string) => void
}

const CustomerProfilesTab = ({ profiles, onAdd, onUpdate, onDelete }: CustomerProfilesTabProps) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingProfile, setEditingProfile] = useState<CustomerProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>(initialProfileFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleOpenDrawer = (profile?: CustomerProfile) => {
    if (profile) {
      setEditingProfile(profile)
      setFormData({
        code: profile.code,
        label: profile.label,
        description: profile.description || "",
        color: profile.color,
      })
    } else {
      setEditingProfile(null)
      setFormData(initialProfileFormData)
    }
    setErrors({})
    setShowDrawer(true)
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
    setEditingProfile(null)
    setFormData(initialProfileFormData)
    setErrors({})
  }

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis"
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Le code ne peut contenir que des lettres minuscules, chiffres et underscores"
    } else if (!editingProfile && profiles.some((p) => p.code === formData.code)) {
      newErrors.code = "Ce code existe deja"
    }

    if (!formData.label.trim()) {
      newErrors.label = "Le libelle est requis"
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newProfile: CustomerProfile = {
      code: formData.code.trim(),
      label: formData.label.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      companiesCount: editingProfile?.companiesCount || 0,
    }

    if (editingProfile) {
      onUpdate(editingProfile.code, newProfile)
      toast.success("Profil client mis a jour")
    } else {
      onAdd(newProfile)
      toast.success("Profil client cree")
    }

    setSubmitting(false)
    handleCloseDrawer()
  }

  const handleRequestDelete = (code: string) => {
    const profile = profiles.find((p) => p.code === code)
    if (profile && profile.companiesCount > 0) {
      toast.error(`Impossible de supprimer: ${profile.companiesCount} entreprise(s) utilisent ce profil`)
      return
    }
    setDeletingCode(code)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCode) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    onDelete(deletingCode)
    toast.success("Profil client supprime")

    setSubmitting(false)
    setShowDeleteConfirm(false)
    setDeletingCode(null)
  }

  const canModify = useCallback(
    (code: string): boolean => {
      const profile = profiles.find((p) => p.code === code)
      return !profile || profile.companiesCount === 0
    },
    [profiles]
  )

  return (
    <>
      {/* Drawer */}
      <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editingProfile ? "Modifier le profil client" : "Nouveau profil client"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="profile-code" className="mb-2 block">
                  Code <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="profile-code"
                  placeholder="ex: detaillant_premium"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toLowerCase())}
                  aria-invalid={!!errors.code}
                  disabled={submitting || !!editingProfile}
                />
                {errors.code && <Text className="text-ui-fg-error text-sm mt-1">{errors.code}</Text>}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Identifiant unique (minuscules, chiffres, underscores)
                </Text>
              </div>

              <div>
                <Label htmlFor="profile-label" className="mb-2 block">
                  Libelle <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="profile-label"
                  placeholder="ex: Detaillant Premium"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  aria-invalid={!!errors.label}
                  disabled={submitting}
                />
                {errors.label && <Text className="text-ui-fg-error text-sm mt-1">{errors.label}</Text>}
              </div>

              <div>
                <Label htmlFor="profile-description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="profile-description"
                  placeholder="Description du profil client..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="profile-color" className="mb-2 block">
                  Couleur du badge
                </Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange("color", value)}
                  disabled={submitting}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionner une couleur" />
                  </Select.Trigger>
                  <Select.Content>
                    {colorOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge color={option.value} className="w-4 h-4 p-0" />
                          {option.label}
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="pt-4">
                <Text className="text-ui-fg-subtle text-sm">Apercu:</Text>
                <div className="mt-2">
                  <Badge color={formData.color}>{formData.label || "Libelle"}</Badge>
                </div>
              </div>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={handleCloseDrawer} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" form="profile-form" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  {editingProfile ? "Mise a jour..." : "Creation..."}
                </>
              ) : editingProfile ? (
                "Enregistrer"
              ) : (
                "Creer"
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingCode(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le profil client"
        message={`Etes-vous sur de vouloir supprimer ce profil client ? Cette action est irreversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={submitting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h2">Profils clients types</Heading>
          <Text className="text-ui-fg-subtle">
            Definissez les differents profils de clients B2B (anciennement "tier")
          </Text>
        </div>
        <Button variant="primary" onClick={() => handleOpenDrawer()}>
          <Plus className="mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-ui-border-base overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-32">Code</Table.HeaderCell>
              <Table.HeaderCell>Libelle</Table.HeaderCell>
              <Table.HeaderCell className="w-64">Description</Table.HeaderCell>
              <Table.HeaderCell className="w-32">Badge</Table.HeaderCell>
              <Table.HeaderCell className="w-40">Entreprises</Table.HeaderCell>
              <Table.HeaderCell className="w-24"></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {profiles.map((profile) => (
              <Table.Row key={profile.code} className="hover:bg-ui-bg-subtle-hover">
                <Table.Cell>
                  <code className="text-sm bg-ui-bg-subtle px-1.5 py-0.5 rounded">{profile.code}</code>
                </Table.Cell>
                <Table.Cell>
                  <Text className="font-medium">{profile.label}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text className="text-ui-fg-subtle text-sm truncate max-w-[200px]">
                    {profile.description || "-"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={profile.color}>{profile.label}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={profile.companiesCount > 0 ? "blue" : "grey"}>
                    {profile.companiesCount} entreprise{profile.companiesCount !== 1 ? "s" : ""}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleOpenDrawer(profile)}
                      disabled={!canModify(profile.code)}
                      title={!canModify(profile.code) ? "Modification impossible: profil utilise" : "Modifier"}
                    >
                      <PencilSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleRequestDelete(profile.code)}
                      disabled={!canModify(profile.code)}
                      className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                      title={!canModify(profile.code) ? "Suppression impossible: profil utilise" : "Supprimer"}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  )
}

// ==========================================
// COMPANY STATUSES TAB
// ==========================================

interface StatusFormData {
  code: string
  label: string
  description: string
  color: BadgeColor
}

const initialStatusFormData: StatusFormData = {
  code: "",
  label: "",
  description: "",
  color: "grey",
}

interface CompanyStatusesTabProps {
  statuses: CompanyStatus[]
  onAdd: (status: CompanyStatus) => void
  onUpdate: (code: string, status: CompanyStatus) => void
  onDelete: (code: string) => void
}

const CompanyStatusesTab = ({ statuses, onAdd, onUpdate, onDelete }: CompanyStatusesTabProps) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingStatus, setEditingStatus] = useState<CompanyStatus | null>(null)
  const [formData, setFormData] = useState<StatusFormData>(initialStatusFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof StatusFormData, string>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleOpenDrawer = (status?: CompanyStatus) => {
    if (status) {
      setEditingStatus(status)
      setFormData({
        code: status.code,
        label: status.label,
        description: status.description || "",
        color: status.color,
      })
    } else {
      setEditingStatus(null)
      setFormData(initialStatusFormData)
    }
    setErrors({})
    setShowDrawer(true)
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
    setEditingStatus(null)
    setFormData(initialStatusFormData)
    setErrors({})
  }

  const handleInputChange = (field: keyof StatusFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StatusFormData, string>> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis"
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Le code ne peut contenir que des lettres minuscules, chiffres et underscores"
    } else if (!editingStatus && statuses.some((s) => s.code === formData.code)) {
      newErrors.code = "Ce code existe deja"
    }

    if (!formData.label.trim()) {
      newErrors.label = "Le libelle est requis"
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
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newStatus: CompanyStatus = {
      code: formData.code.trim(),
      label: formData.label.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      companiesCount: editingStatus?.companiesCount || 0,
    }

    if (editingStatus) {
      onUpdate(editingStatus.code, newStatus)
      toast.success("Statut mis a jour")
    } else {
      onAdd(newStatus)
      toast.success("Statut cree")
    }

    setSubmitting(false)
    handleCloseDrawer()
  }

  const handleRequestDelete = (code: string) => {
    const status = statuses.find((s) => s.code === code)
    if (status && status.companiesCount > 0) {
      toast.error(`Impossible de supprimer: ${status.companiesCount} entreprise(s) utilisent ce statut`)
      return
    }
    setDeletingCode(code)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCode) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    onDelete(deletingCode)
    toast.success("Statut supprime")

    setSubmitting(false)
    setShowDeleteConfirm(false)
    setDeletingCode(null)
  }

  const canModify = useCallback(
    (code: string): boolean => {
      const status = statuses.find((s) => s.code === code)
      return !status || status.companiesCount === 0
    },
    [statuses]
  )

  return (
    <>
      {/* Drawer */}
      <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>{editingStatus ? "Modifier le statut" : "Nouveau statut"}</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <form id="status-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="status-code" className="mb-2 block">
                  Code <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="status-code"
                  placeholder="ex: en_revision"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toLowerCase())}
                  aria-invalid={!!errors.code}
                  disabled={submitting || !!editingStatus}
                />
                {errors.code && <Text className="text-ui-fg-error text-sm mt-1">{errors.code}</Text>}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Identifiant unique (minuscules, chiffres, underscores)
                </Text>
              </div>

              <div>
                <Label htmlFor="status-label" className="mb-2 block">
                  Libelle <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="status-label"
                  placeholder="ex: En revision"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  aria-invalid={!!errors.label}
                  disabled={submitting}
                />
                {errors.label && <Text className="text-ui-fg-error text-sm mt-1">{errors.label}</Text>}
              </div>

              <div>
                <Label htmlFor="status-description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="status-description"
                  placeholder="Description du statut..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status-color" className="mb-2 block">
                  Couleur du badge
                </Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange("color", value)}
                  disabled={submitting}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Selectionner une couleur" />
                  </Select.Trigger>
                  <Select.Content>
                    {colorOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge color={option.value} className="w-4 h-4 p-0" />
                          {option.label}
                        </div>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>

              <div className="pt-4">
                <Text className="text-ui-fg-subtle text-sm">Apercu:</Text>
                <div className="mt-2">
                  <Badge color={formData.color}>{formData.label || "Libelle"}</Badge>
                </div>
              </div>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={handleCloseDrawer} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" form="status-form" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  {editingStatus ? "Mise a jour..." : "Creation..."}
                </>
              ) : editingStatus ? (
                "Enregistrer"
              ) : (
                "Creer"
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingCode(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer le statut"
        message={`Etes-vous sur de vouloir supprimer ce statut ? Cette action est irreversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={submitting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h2">Statuts entreprise</Heading>
          <Text className="text-ui-fg-subtle">
            Definissez les differents statuts possibles pour une entreprise B2B
          </Text>
        </div>
        <Button variant="primary" onClick={() => handleOpenDrawer()}>
          <Plus className="mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-ui-border-base overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-32">Code</Table.HeaderCell>
              <Table.HeaderCell>Libelle</Table.HeaderCell>
              <Table.HeaderCell className="w-64">Description</Table.HeaderCell>
              <Table.HeaderCell className="w-32">Badge</Table.HeaderCell>
              <Table.HeaderCell className="w-40">Entreprises</Table.HeaderCell>
              <Table.HeaderCell className="w-24"></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {statuses.map((status) => (
              <Table.Row key={status.code} className="hover:bg-ui-bg-subtle-hover">
                <Table.Cell>
                  <code className="text-sm bg-ui-bg-subtle px-1.5 py-0.5 rounded">{status.code}</code>
                </Table.Cell>
                <Table.Cell>
                  <Text className="font-medium">{status.label}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text className="text-ui-fg-subtle text-sm truncate max-w-[200px]">
                    {status.description || "-"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={status.color}>{status.label}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={status.companiesCount > 0 ? "blue" : "grey"}>
                    {status.companiesCount} entreprise{status.companiesCount !== 1 ? "s" : ""}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleOpenDrawer(status)}
                      disabled={!canModify(status.code)}
                      title={!canModify(status.code) ? "Modification impossible: statut utilise" : "Modifier"}
                    >
                      <PencilSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleRequestDelete(status.code)}
                      disabled={!canModify(status.code)}
                      className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                      title={!canModify(status.code) ? "Suppression impossible: statut utilise" : "Supprimer"}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  )
}

// ==========================================
// PAYMENT TERMS TAB
// ==========================================

interface PaymentTermFormData {
  code: string
  label: string
  description: string
  defaultDays: string
}

const initialPaymentTermFormData: PaymentTermFormData = {
  code: "",
  label: "",
  description: "",
  defaultDays: "30",
}

interface PaymentTermsTabProps {
  terms: PaymentTerm[]
  onAdd: (term: PaymentTerm) => void
  onUpdate: (code: string, term: PaymentTerm) => void
  onDelete: (code: string) => void
}

const PaymentTermsTab = ({ terms, onAdd, onUpdate, onDelete }: PaymentTermsTabProps) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null)
  const [formData, setFormData] = useState<PaymentTermFormData>(initialPaymentTermFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentTermFormData, string>>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingCode, setDeletingCode] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleOpenDrawer = (term?: PaymentTerm) => {
    if (term) {
      setEditingTerm(term)
      setFormData({
        code: term.code,
        label: term.label,
        description: term.description || "",
        defaultDays: term.defaultDays.toString(),
      })
    } else {
      setEditingTerm(null)
      setFormData(initialPaymentTermFormData)
    }
    setErrors({})
    setShowDrawer(true)
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
    setEditingTerm(null)
    setFormData(initialPaymentTermFormData)
    setErrors({})
  }

  const handleInputChange = (field: keyof PaymentTermFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PaymentTermFormData, string>> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis"
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = "Le code ne peut contenir que des lettres minuscules, chiffres et underscores"
    } else if (!editingTerm && terms.some((t) => t.code === formData.code)) {
      newErrors.code = "Ce code existe deja"
    }

    if (!formData.label.trim()) {
      newErrors.label = "Le libelle est requis"
    }

    if (formData.defaultDays && isNaN(Number(formData.defaultDays))) {
      newErrors.defaultDays = "Le delai doit etre un nombre"
    } else if (Number(formData.defaultDays) < 0) {
      newErrors.defaultDays = "Le delai ne peut pas etre negatif"
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
    await new Promise((resolve) => setTimeout(resolve, 300))

    const newTerm: PaymentTerm = {
      code: formData.code.trim(),
      label: formData.label.trim(),
      description: formData.description.trim() || undefined,
      defaultDays: Number(formData.defaultDays) || 0,
      companiesCount: editingTerm?.companiesCount || 0,
    }

    if (editingTerm) {
      onUpdate(editingTerm.code, newTerm)
      toast.success("Condition de paiement mise a jour")
    } else {
      onAdd(newTerm)
      toast.success("Condition de paiement creee")
    }

    setSubmitting(false)
    handleCloseDrawer()
  }

  const handleRequestDelete = (code: string) => {
    const term = terms.find((t) => t.code === code)
    if (term && term.companiesCount > 0) {
      toast.error(`Impossible de supprimer: ${term.companiesCount} entreprise(s) utilisent cette condition`)
      return
    }
    setDeletingCode(code)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCode) return

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))

    onDelete(deletingCode)
    toast.success("Condition de paiement supprimee")

    setSubmitting(false)
    setShowDeleteConfirm(false)
    setDeletingCode(null)
  }

  const canModify = useCallback(
    (code: string): boolean => {
      const term = terms.find((t) => t.code === code)
      return !term || term.companiesCount === 0
    },
    [terms]
  )

  return (
    <>
      {/* Drawer */}
      <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editingTerm ? "Modifier la condition de paiement" : "Nouvelle condition de paiement"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="overflow-y-auto">
            <form id="payment-term-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="term-code" className="mb-2 block">
                  Code <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="term-code"
                  placeholder="ex: net_120"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toLowerCase())}
                  aria-invalid={!!errors.code}
                  disabled={submitting || !!editingTerm}
                />
                {errors.code && <Text className="text-ui-fg-error text-sm mt-1">{errors.code}</Text>}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Identifiant unique (minuscules, chiffres, underscores)
                </Text>
              </div>

              <div>
                <Label htmlFor="term-label" className="mb-2 block">
                  Libelle <span className="text-ui-fg-error">*</span>
                </Label>
                <Input
                  id="term-label"
                  placeholder="ex: Net 120 jours"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  aria-invalid={!!errors.label}
                  disabled={submitting}
                />
                {errors.label && <Text className="text-ui-fg-error text-sm mt-1">{errors.label}</Text>}
              </div>

              <div>
                <Label htmlFor="term-description" className="mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="term-description"
                  placeholder="Description de la condition de paiement..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={submitting}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="term-days" className="mb-2 block">
                  Delai par defaut (jours)
                </Label>
                <Input
                  id="term-days"
                  type="number"
                  min="0"
                  placeholder="30"
                  value={formData.defaultDays}
                  onChange={(e) => handleInputChange("defaultDays", e.target.value)}
                  aria-invalid={!!errors.defaultDays}
                  disabled={submitting}
                />
                {errors.defaultDays && (
                  <Text className="text-ui-fg-error text-sm mt-1">{errors.defaultDays}</Text>
                )}
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Nombre de jours avant echeance (0 pour paiement immediat)
                </Text>
              </div>
            </form>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={handleCloseDrawer} disabled={submitting}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" form="payment-term-form" disabled={submitting}>
              {submitting ? (
                <>
                  <ArrowPath className="animate-spin mr-1" />
                  {editingTerm ? "Mise a jour..." : "Creation..."}
                </>
              ) : editingTerm ? (
                "Enregistrer"
              ) : (
                "Creer"
              )}
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setDeletingCode(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Supprimer la condition de paiement"
        message={`Etes-vous sur de vouloir supprimer cette condition de paiement ? Cette action est irreversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={submitting}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level="h2">Conditions de paiement</Heading>
          <Text className="text-ui-fg-subtle">
            Definissez les differents types de conditions de paiement disponibles
          </Text>
        </div>
        <Button variant="primary" onClick={() => handleOpenDrawer()}>
          <Plus className="mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-ui-border-base overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-32">Code</Table.HeaderCell>
              <Table.HeaderCell>Libelle</Table.HeaderCell>
              <Table.HeaderCell className="w-64">Description</Table.HeaderCell>
              <Table.HeaderCell className="w-32">Delai</Table.HeaderCell>
              <Table.HeaderCell className="w-40">Entreprises</Table.HeaderCell>
              <Table.HeaderCell className="w-24"></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {terms.map((term) => (
              <Table.Row key={term.code} className="hover:bg-ui-bg-subtle-hover">
                <Table.Cell>
                  <code className="text-sm bg-ui-bg-subtle px-1.5 py-0.5 rounded">{term.code}</code>
                </Table.Cell>
                <Table.Cell>
                  <Text className="font-medium">{term.label}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text className="text-ui-fg-subtle text-sm truncate max-w-[200px]">
                    {term.description || "-"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={term.defaultDays === 0 ? "green" : "blue"}>
                    {term.defaultDays === 0 ? "Immediat" : `${term.defaultDays} jours`}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge color={term.companiesCount > 0 ? "blue" : "grey"}>
                    {term.companiesCount} entreprise{term.companiesCount !== 1 ? "s" : ""}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleOpenDrawer(term)}
                      disabled={!canModify(term.code)}
                      title={!canModify(term.code) ? "Modification impossible: condition utilisee" : "Modifier"}
                    >
                      <PencilSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => handleRequestDelete(term.code)}
                      disabled={!canModify(term.code)}
                      className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                      title={!canModify(term.code) ? "Suppression impossible: condition utilisee" : "Supprimer"}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

const ReferentielPage = () => {
  // State for reference data (simulating local storage until API is ready)
  const [customerProfiles, setCustomerProfiles] = useState<CustomerProfile[]>(defaultCustomerProfiles)
  const [companyStatuses, setCompanyStatuses] = useState<CompanyStatus[]>(defaultCompanyStatuses)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>(defaultPaymentTerms)

  // Customer Profiles handlers
  const handleAddProfile = (profile: CustomerProfile) => {
    setCustomerProfiles((prev) => [...prev, profile])
  }

  const handleUpdateProfile = (code: string, profile: CustomerProfile) => {
    setCustomerProfiles((prev) => prev.map((p) => (p.code === code ? profile : p)))
  }

  const handleDeleteProfile = (code: string) => {
    setCustomerProfiles((prev) => prev.filter((p) => p.code !== code))
  }

  // Company Statuses handlers
  const handleAddStatus = (status: CompanyStatus) => {
    setCompanyStatuses((prev) => [...prev, status])
  }

  const handleUpdateStatus = (code: string, status: CompanyStatus) => {
    setCompanyStatuses((prev) => prev.map((s) => (s.code === code ? status : s)))
  }

  const handleDeleteStatus = (code: string) => {
    setCompanyStatuses((prev) => prev.filter((s) => s.code !== code))
  }

  // Payment Terms handlers
  const handleAddPaymentTerm = (term: PaymentTerm) => {
    setPaymentTerms((prev) => [...prev, term])
  }

  const handleUpdatePaymentTerm = (code: string, term: PaymentTerm) => {
    setPaymentTerms((prev) => prev.map((t) => (t.code === code ? term : t)))
  }

  const handleDeletePaymentTerm = (code: string) => {
    setPaymentTerms((prev) => prev.filter((t) => t.code !== code))
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/b2b-companies"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux entreprises</Text>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <Heading level="h1">Referentiel</Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Gerez les donnees de reference pour les entreprises B2B
            </Text>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs defaultValue="profiles">
          <Tabs.List>
            <Tabs.Trigger value="profiles">
              Profils clients ({customerProfiles.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="statuses">
              Statuts ({companyStatuses.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="payment-terms">
              Conditions de paiement ({paymentTerms.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="profiles" className="mt-6">
            <CustomerProfilesTab
              profiles={customerProfiles}
              onAdd={handleAddProfile}
              onUpdate={handleUpdateProfile}
              onDelete={handleDeleteProfile}
            />
          </Tabs.Content>

          <Tabs.Content value="statuses" className="mt-6">
            <CompanyStatusesTab
              statuses={companyStatuses}
              onAdd={handleAddStatus}
              onUpdate={handleUpdateStatus}
              onDelete={handleDeleteStatus}
            />
          </Tabs.Content>

          <Tabs.Content value="payment-terms" className="mt-6">
            <PaymentTermsTab
              terms={paymentTerms}
              onAdd={handleAddPaymentTerm}
              onUpdate={handleUpdatePaymentTerm}
              onDelete={handleDeletePaymentTerm}
            />
          </Tabs.Content>
        </Tabs>
      </div>
    </Container>
  )
}

export default ReferentielPage
