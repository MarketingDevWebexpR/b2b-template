/**
 * B2B Approval Request Detail Page
 *
 * Admin page for viewing and managing individual approval requests.
 * Displays request details, approval progress timeline, linked entity info,
 * and provides action buttons based on request status.
 *
 * @packageDocumentation
 */

import { Container, Heading, Text, Button, Badge, Textarea, Toaster, toast } from "@medusajs/ui"
import { CheckCircle, XCircle, ArrowLeft, Clock, ArrowUpRightOnBox, User, Buildings, ExclamationCircle, ArrowPath } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"

// ==========================================
// TYPE DEFINITIONS
// ==========================================

type RequestStatus = "pending" | "in_review" | "approved" | "rejected" | "escalated" | "expired"
type EntityType = "order" | "quote" | "return" | "credit"
type StepStatus = "pending" | "approved" | "rejected" | "escalated" | "delegated" | "expired"
type StepAction = "approve" | "reject" | "escalate" | "delegate" | "request_info"

interface ApprovalStep {
  id: string
  request_id: string
  level: number
  status: StepStatus
  action: StepAction | null
  assigned_approver_ids: string[]
  acted_by_id: string | null
  acted_at: string | null
  notes: string | null
  delegated_to_id: string | null
  delegation_reason: string | null
  due_at: string | null
  created_at: string
}

interface ApprovalWorkflow {
  id: string
  company_id: string
  name: string
  entity_type: EntityType
  trigger: string
  trigger_threshold: number | null
  levels: WorkflowLevel[]
  priority: number
  is_active: boolean
  escalation_hours: number
  expiration_hours: number
}

interface WorkflowLevel {
  level: number
  approverType: "manager" | "director" | "specific" | "role"
  approverIds?: string[]
  roleName?: string
  amountThreshold?: number
}

interface ApprovalRequest {
  id: string
  request_number: string
  company_id: string
  entity_type: EntityType
  entity_id: string
  entity_amount: number | null
  entity_currency: string
  requester_id: string
  requester_notes: string | null
  workflow_id: string
  status: RequestStatus
  current_level: number
  total_levels: number
  due_at: string | null
  submitted_at: string
  decided_at: string | null
  final_approver_id: string | null
  final_notes: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  steps?: ApprovalStep[]
  workflow?: ApprovalWorkflow
}

// ==========================================
// CONSTANTS
// ==========================================

const statusColors: Record<RequestStatus, "green" | "orange" | "red" | "grey" | "blue" | "purple"> = {
  pending: "orange",
  in_review: "blue",
  approved: "green",
  rejected: "red",
  escalated: "purple",
  expired: "grey",
}

const statusLabels: Record<RequestStatus, string> = {
  pending: "En attente",
  in_review: "En cours de revision",
  approved: "Approuve",
  rejected: "Rejete",
  escalated: "Escalade",
  expired: "Expire",
}

const entityLabels: Record<EntityType, string> = {
  order: "Commande",
  quote: "Devis",
  return: "Retour",
  credit: "Credit",
}

const entityColors: Record<EntityType, "blue" | "purple" | "orange" | "green"> = {
  order: "blue",
  quote: "purple",
  return: "orange",
  credit: "green",
}

const stepStatusLabels: Record<StepStatus, string> = {
  pending: "En attente",
  approved: "Approuve",
  rejected: "Rejete",
  escalated: "Escalade",
  delegated: "Delegue",
  expired: "Expire",
}

const stepStatusColors: Record<StepStatus, "green" | "orange" | "red" | "grey" | "blue" | "purple"> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  escalated: "purple",
  delegated: "blue",
  expired: "grey",
}

const approverTypeLabels: Record<string, string> = {
  manager: "Manager",
  director: "Directeur",
  specific: "Approbateur specifique",
  role: "Role",
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const formatCurrency = (amount: number | null, currency = "EUR") => {
  if (amount === null || amount === undefined) return "-"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount / 100)
}

const formatDate = (date: string | null) => {
  if (!date) return "-"
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date))
}

const formatRelativeTime = (date: string | null) => {
  if (!date) return ""
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  const hours = Math.round(diff / (1000 * 60 * 60))
  const days = Math.round(hours / 24)

  if (diff < 0) {
    if (days < -1) return `Expire depuis ${Math.abs(days)} jours`
    if (hours < -1) return `Expire depuis ${Math.abs(hours)} heures`
    return "Expire"
  }

  if (days > 1) return `Dans ${days} jours`
  if (hours > 1) return `Dans ${hours} heures`
  return "Bientot"
}

const isOverdue = (date: string | null) => {
  if (!date) return false
  return new Date(date) < new Date()
}

// ==========================================
// MAIN COMPONENT
// ==========================================

const ApprovalRequestDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [request, setRequest] = useState<ApprovalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionNotes, setActionNotes] = useState("")

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const fetchRequest = useCallback(async () => {
    if (!id) return

    setLoading(true)
    try {
      const response = await fetch(`/admin/b2b/approvals/requests/${id}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch request")
      }

      const data = await response.json()
      setRequest(data.request)
    } catch (error) {
      console.error("Failed to fetch request:", error)
      toast.error("Erreur lors du chargement de la demande")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleAction = async (action: "approve" | "reject" | "escalate", notes?: string) => {
    if (!request) return

    setActionLoading(true)
    try {
      const response = await fetch(`/admin/b2b/approvals/requests/${request.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "escalated",
          admin_notes: notes || actionNotes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Action failed")
      }

      const actionLabels = {
        approve: "approuvee",
        reject: "rejetee",
        escalate: "escaladee",
      }

      toast.success(`Demande ${actionLabels[action]} avec succes`)
      setShowRejectModal(false)
      setRejectionReason("")
      setActionNotes("")
      fetchRequest()
    } catch (error) {
      console.error("Action failed:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'action")
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = () => handleAction("approve")
  const handleReject = () => handleAction("reject", rejectionReason)
  const handleEscalate = () => handleAction("escalate")

  const handleCancel = async () => {
    if (!request) return

    if (!window.confirm("Etes-vous sur de vouloir annuler cette demande ?")) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/admin/b2b/approvals/requests/${request.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to cancel request")
      }

      toast.success("Demande annulee")
      fetchRequest()
    } catch (error) {
      console.error("Cancel failed:", error)
      toast.error("Erreur lors de l'annulation")
    } finally {
      setActionLoading(false)
    }
  }

  // ==========================================
  // RENDER HELPERS
  // ==========================================

  const renderApprovalProgress = () => {
    if (!request) return null

    const { current_level, total_levels, status } = request
    const progressPercentage = status === "approved"
      ? 100
      : Math.max(0, ((current_level - 1) / total_levels) * 100)

    return (
      <div className="rounded-lg border border-ui-border-base p-6">
        <Heading level="h2" className="mb-4">Progression de l'approbation</Heading>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <Text className="text-ui-fg-subtle text-sm">
              Niveau {current_level} sur {total_levels}
            </Text>
            <Text className="text-sm font-medium">
              {Math.round(progressPercentage)}%
            </Text>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ui-bg-subtle">
            <div
              className={`h-full transition-all duration-500 ${
                status === "approved"
                  ? "bg-ui-tag-green-bg"
                  : status === "rejected"
                  ? "bg-ui-tag-red-bg"
                  : "bg-ui-tag-blue-bg"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Level indicators */}
        <div className="flex items-center justify-between">
          {Array.from({ length: total_levels }).map((_, index) => {
            const level = index + 1
            const isCompleted = level < current_level || status === "approved"
            const isCurrent = level === current_level && !["approved", "rejected"].includes(status)
            const isPending = level > current_level

            return (
              <div key={level} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? "bg-ui-tag-green-bg text-ui-tag-green-text"
                      : isCurrent
                      ? "bg-ui-tag-blue-bg text-ui-tag-blue-text"
                      : isPending
                      ? "bg-ui-bg-subtle text-ui-fg-muted"
                      : "bg-ui-bg-subtle text-ui-fg-muted"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    level
                  )}
                </div>
                <Text className="text-xs mt-1 text-ui-fg-subtle">
                  Niveau {level}
                </Text>
              </div>
            )
          })}
        </div>

        {/* Workflow info */}
        {request.workflow && (
          <div className="mt-4 pt-4 border-t border-ui-border-base">
            <Text className="text-ui-fg-subtle text-sm">
              Workflow: <span className="font-medium text-ui-fg-base">{request.workflow.name}</span>
            </Text>
          </div>
        )}
      </div>
    )
  }

  const renderApprovalTimeline = () => {
    if (!request?.steps || request.steps.length === 0) {
      return (
        <div className="rounded-lg border border-ui-border-base p-6">
          <Heading level="h2" className="mb-4">Historique des approbations</Heading>
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="w-8 h-8 text-ui-fg-muted mb-2" />
            <Text className="text-ui-fg-subtle">Aucune etape enregistree</Text>
          </div>
        </div>
      )
    }

    // Sort steps by level and creation date
    const sortedSteps = [...request.steps].sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    return (
      <div className="rounded-lg border border-ui-border-base p-6">
        <Heading level="h2" className="mb-4">Historique des approbations</Heading>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ui-border-base" />

          {/* Timeline items */}
          <div className="space-y-6">
            {sortedSteps.map((step, index) => (
              <div key={step.id} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                    step.status === "approved"
                      ? "bg-ui-tag-green-bg border-ui-tag-green-border"
                      : step.status === "rejected"
                      ? "bg-ui-tag-red-bg border-ui-tag-red-border"
                      : step.status === "pending"
                      ? "bg-ui-tag-orange-bg border-ui-tag-orange-border"
                      : step.status === "escalated"
                      ? "bg-ui-tag-purple-bg border-ui-tag-purple-border"
                      : step.status === "delegated"
                      ? "bg-ui-tag-blue-bg border-ui-tag-blue-border"
                      : "bg-ui-bg-subtle border-ui-border-base"
                  }`}
                />

                {/* Step content */}
                <div className="bg-ui-bg-subtle rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color={stepStatusColors[step.status]}>
                        {stepStatusLabels[step.status]}
                      </Badge>
                      <Text className="text-sm font-medium">
                        Niveau {step.level}
                      </Text>
                    </div>
                    {step.acted_at && (
                      <Text className="text-xs text-ui-fg-subtle">
                        {formatDate(step.acted_at)}
                      </Text>
                    )}
                  </div>

                  {/* Actor info */}
                  {step.acted_by_id && (
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-ui-fg-muted" />
                      <Text className="text-sm text-ui-fg-subtle">
                        Traite par: <span className="font-mono">{step.acted_by_id}</span>
                      </Text>
                    </div>
                  )}

                  {/* Delegation info */}
                  {step.delegated_to_id && (
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRightOnBox className="w-4 h-4 text-ui-fg-muted" />
                      <Text className="text-sm text-ui-fg-subtle">
                        Delegue a: <span className="font-mono">{step.delegated_to_id}</span>
                        {step.delegation_reason && (
                          <span className="ml-2">- {step.delegation_reason}</span>
                        )}
                      </Text>
                    </div>
                  )}

                  {/* Notes */}
                  {step.notes && (
                    <div className="mt-2 p-2 bg-ui-bg-base rounded border border-ui-border-base">
                      <Text className="text-sm">{step.notes}</Text>
                    </div>
                  )}

                  {/* Assigned approvers */}
                  {step.status === "pending" && step.assigned_approver_ids?.length > 0 && (
                    <div className="mt-2">
                      <Text className="text-xs text-ui-fg-subtle">
                        Approbateurs assignes: {step.assigned_approver_ids.length}
                      </Text>
                    </div>
                  )}

                  {/* Due date warning */}
                  {step.status === "pending" && step.due_at && (
                    <div className={`mt-2 flex items-center gap-1 ${
                      isOverdue(step.due_at) ? "text-ui-tag-red-text" : "text-ui-fg-subtle"
                    }`}>
                      <Clock className="w-3 h-3" />
                      <Text className="text-xs">
                        Echeance: {formatDate(step.due_at)} ({formatRelativeTime(step.due_at)})
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Submission event */}
            <div className="relative pl-10">
              <div className="absolute left-2 w-4 h-4 rounded-full bg-ui-bg-base border-2 border-ui-border-base" />
              <div className="bg-ui-bg-subtle rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Text className="text-sm font-medium">Demande soumise</Text>
                  <Text className="text-xs text-ui-fg-subtle">
                    {formatDate(request.submitted_at)}
                  </Text>
                </div>
                {request.requester_notes && (
                  <div className="mt-2 p-2 bg-ui-bg-base rounded border border-ui-border-base">
                    <Text className="text-sm">{request.requester_notes}</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderLinkedEntity = () => {
    if (!request) return null

    const entityLinks: Record<EntityType, string> = {
      order: `/app/orders/${request.entity_id}`,
      quote: `/app/b2b-quotes/${request.entity_id}`,
      return: `/app/returns/${request.entity_id}`,
      credit: `/app/credits/${request.entity_id}`,
    }

    return (
      <div className="rounded-lg border border-ui-border-base p-6">
        <Heading level="h2" className="mb-4">Entite liee</Heading>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Text className="text-ui-fg-subtle">Type</Text>
            <Badge color={entityColors[request.entity_type]}>
              {entityLabels[request.entity_type]}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Text className="text-ui-fg-subtle">Identifiant</Text>
            <Text className="font-mono text-sm">{request.entity_id}</Text>
          </div>

          {request.entity_amount !== null && (
            <div className="flex items-center justify-between">
              <Text className="text-ui-fg-subtle">Montant</Text>
              <Text className="text-xl font-bold">
                {formatCurrency(request.entity_amount, request.entity_currency)}
              </Text>
            </div>
          )}

          <Link
            to={entityLinks[request.entity_type]}
            className="flex items-center gap-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
          >
            <ArrowUpRightOnBox className="w-4 h-4" />
            <Text className="text-sm">Voir {entityLabels[request.entity_type].toLowerCase()}</Text>
          </Link>
        </div>
      </div>
    )
  }

  const renderActionButtons = () => {
    if (!request) return null

    const canTakeAction = ["pending", "in_review"].includes(request.status)
    const canEscalate = canTakeAction && request.current_level < request.total_levels
    const canCancel = !["approved", "rejected", "cancelled"].includes(request.status)

    if (!canTakeAction && !canCancel) {
      return (
        <div className="rounded-lg border border-ui-border-base p-6">
          <Heading level="h2" className="mb-4">Actions</Heading>
          <div className="flex flex-col items-center justify-center py-4">
            <Text className="text-ui-fg-subtle">
              Cette demande est deja {statusLabels[request.status].toLowerCase()}
            </Text>
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-ui-border-base p-6">
        <Heading level="h2" className="mb-4">Actions</Heading>

        {/* Action notes */}
        {canTakeAction && (
          <div className="mb-4">
            <label htmlFor="action-notes" className="block text-sm text-ui-fg-subtle mb-2">
              Notes (optionnel)
            </label>
            <Textarea
              id="action-notes"
              placeholder="Ajouter des notes pour cette action..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className="space-y-3">
          {canTakeAction && (
            <>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle className="mr-2" />
                Approuver
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <XCircle className="mr-2" />
                Rejeter
              </Button>

              {canEscalate && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleEscalate}
                  disabled={actionLoading}
                >
                  <ArrowUpRightOnBox className="mr-2" />
                  Escalader
                </Button>
              )}
            </>
          )}

          {canCancel && (
            <Button
              variant="danger"
              className="w-full"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              <ExclamationCircle className="mr-2" />
              Annuler la demande
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderRejectModal = () => {
    if (!showRejectModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-ui-bg-base rounded-lg shadow-xl p-6 w-full max-w-md">
          <Heading level="h2" className="mb-4">Rejeter la demande</Heading>

          <div className="mb-4">
            <label htmlFor="rejection-reason" className="block text-sm text-ui-fg-subtle mb-2">
              Raison du rejet <span className="text-ui-tag-red-text">*</span>
            </label>
            <Textarea
              id="rejection-reason"
              placeholder="Expliquez la raison du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false)
                setRejectionReason("")
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              {actionLoading ? "Traitement..." : "Confirmer le rejet"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // LOADING & ERROR STATES
  // ==========================================

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <ArrowPath className="w-8 h-8 text-ui-fg-muted animate-spin" />
          <Text>Chargement...</Text>
        </div>
      </Container>
    )
  }

  if (!request) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <ExclamationCircle className="w-12 h-12 text-ui-fg-muted mb-4" />
        <Text className="text-ui-fg-subtle mb-4">Demande d'approbation non trouvee</Text>
        <Link to="/app/b2b-approvals">
          <Button variant="secondary">
            <ArrowLeft className="mr-2" />
            Retour aux approbations
          </Button>
        </Link>
      </Container>
    )
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Reject Modal */}
      {renderRejectModal()}

      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/app/b2b-approvals"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux approbations</Text>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <Heading level="h1">{request.request_number}</Heading>
              <Badge color={entityColors[request.entity_type]}>
                {entityLabels[request.entity_type]}
              </Badge>
              <Badge color={statusColors[request.status]}>
                {statusLabels[request.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-ui-fg-subtle">
              {request.entity_amount !== null && (
                <Text className="text-lg font-semibold text-ui-fg-base">
                  {formatCurrency(request.entity_amount, request.entity_currency)}
                </Text>
              )}
              <Text className="text-sm">
                Soumise le {formatDate(request.submitted_at)}
              </Text>
            </div>
          </div>

          {/* Due date indicator */}
          {request.due_at && ["pending", "in_review"].includes(request.status) && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isOverdue(request.due_at)
                  ? "bg-ui-tag-red-bg text-ui-tag-red-text"
                  : "bg-ui-tag-orange-bg text-ui-tag-orange-text"
              }`}
            >
              <Clock className="w-4 h-4" />
              <div>
                <Text className="text-xs font-medium">Echeance</Text>
                <Text className="text-sm">{formatRelativeTime(request.due_at)}</Text>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requester info */}
      <div className="px-6 py-4 bg-ui-bg-subtle">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-ui-fg-muted" />
            <Text className="text-sm">
              Demandeur: <span className="font-mono">{request.requester_id}</span>
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Buildings className="w-4 h-4 text-ui-fg-muted" />
            <Text className="text-sm">
              Entreprise: <span className="font-mono">{request.company_id}</span>
            </Text>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Progress and Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {renderApprovalProgress()}
            {renderApprovalTimeline()}
          </div>

          {/* Right column - Entity info and Actions */}
          <div className="space-y-6">
            {renderLinkedEntity()}
            {renderActionButtons()}

            {/* Metadata */}
            {request.metadata && Object.keys(request.metadata).length > 0 && (
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">Metadonnees</Heading>
                <pre className="p-3 bg-ui-bg-subtle rounded text-xs overflow-auto max-h-48">
                  {JSON.stringify(request.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Final decision info */}
            {["approved", "rejected"].includes(request.status) && (
              <div className="rounded-lg border border-ui-border-base p-6">
                <Heading level="h2" className="mb-4">Decision finale</Heading>
                <div className="space-y-3">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de decision</Text>
                    <Text className="font-medium">{formatDate(request.decided_at)}</Text>
                  </div>
                  {request.final_approver_id && (
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Decideur</Text>
                      <Text className="font-mono text-sm">{request.final_approver_id}</Text>
                    </div>
                  )}
                  {request.final_notes && (
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Notes</Text>
                      <div className="mt-1 p-2 bg-ui-bg-subtle rounded">
                        <Text className="text-sm">{request.final_notes}</Text>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}

export default ApprovalRequestDetailPage
