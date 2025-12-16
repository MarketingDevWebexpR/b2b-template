import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge, Table, Tabs, Toaster, toast } from "@medusajs/ui"
import { CheckCircle, XCircle, Clock, ShieldCheck } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type RequestStatus = "pending" | "in_review" | "approved" | "rejected" | "escalated" | "expired"
type EntityType = "order" | "quote" | "return" | "credit"

interface ApprovalRequest {
  id: string
  request_number: string
  company_id: string
  entity_type: EntityType
  entity_id: string
  entity_amount: number | null
  requester_id: string
  workflow_id: string
  status: RequestStatus
  current_level: number
  total_levels: number
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
  levels: unknown[]
  priority: number
  is_active: boolean
  created_at: string
}

interface RequestsResponse {
  requests: ApprovalRequest[]
}

interface WorkflowsResponse {
  workflows: ApprovalWorkflow[]
}

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
  in_review: "En révision",
  approved: "Approuvé",
  rejected: "Rejeté",
  escalated: "Escaladé",
  expired: "Expiré",
}

const entityLabels: Record<EntityType, string> = {
  order: "Commande",
  quote: "Devis",
  return: "Retour",
  credit: "Crédit",
}

const entityColors: Record<EntityType, "blue" | "purple" | "orange" | "green"> = {
  order: "blue",
  quote: "purple",
  return: "orange",
  credit: "green",
}

const B2BApprovalsPage = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("requests")

  const fetchRequests = async () => {
    try {
      const response = await fetch("/admin/b2b/approvals/requests", {
        credentials: "include",
      })
      const data = (await response.json()) as RequestsResponse
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Failed to fetch requests:", error)
    }
  }

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("/admin/b2b/approvals/workflows", {
        credentials: "include",
      })
      const data = (await response.json()) as WorkflowsResponse
      setWorkflows(data.workflows || [])
    } catch (error) {
      console.error("Failed to fetch workflows:", error)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([fetchRequests(), fetchWorkflows()])
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/admin/b2b/approvals/requests/${requestId}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!response.ok) throw new Error("Failed to approve")

      toast.success("Demande approuvée")
      fetchRequests()
    } catch (error) {
      toast.error("Erreur lors de l'approbation")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/admin/b2b/approvals/requests/${requestId}/action`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: "Rejeté par l'administrateur" }),
      })

      if (!response.ok) throw new Error("Failed to reject")

      toast.success("Demande rejetée")
      fetchRequests()
    } catch (error) {
      toast.error("Erreur lors du rejet")
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-"
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

  const pendingRequests = requests.filter(r => ["pending", "in_review"].includes(r.status))

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Approbations B2B</Heading>
          <Text className="text-ui-fg-subtle">
            Gérez les workflows d'approbation et les demandes en attente
          </Text>
        </div>
        <Link to="/app/b2b-approvals/workflows/create">
          <Button variant="primary">
            Nouveau workflow
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">En attente</Text>
          <Heading level="h2" className="text-ui-tag-orange-text">{pendingRequests.length}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Approuvées</Text>
          <Heading level="h2" className="text-ui-tag-green-text">
            {requests.filter(r => r.status === "approved").length}
          </Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Rejetées</Text>
          <Heading level="h2" className="text-ui-tag-red-text">
            {requests.filter(r => r.status === "rejected").length}
          </Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Workflows actifs</Text>
          <Heading level="h2">{workflows.filter(w => w.is_active).length}</Heading>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="requests">
              Demandes
              {pendingRequests.length > 0 && (
                <Badge color="orange" className="ml-2">{pendingRequests.length}</Badge>
              )}
            </Tabs.Trigger>
            <Tabs.Trigger value="workflows">Workflows</Tabs.Trigger>
          </Tabs.List>

          {/* Requests Tab */}
          <Tabs.Content value="requests" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Text className="text-ui-fg-subtle">Chargement...</Text>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShieldCheck className="text-ui-fg-muted mb-4 h-12 w-12" />
                <Text className="text-ui-fg-subtle">Aucune demande d'approbation</Text>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>N° Demande</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Montant</Table.HeaderCell>
                    <Table.HeaderCell>Statut</Table.HeaderCell>
                    <Table.HeaderCell>Niveau</Table.HeaderCell>
                    <Table.HeaderCell>Échéance</Table.HeaderCell>
                    <Table.HeaderCell>Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {requests.map((request) => (
                    <Table.Row key={request.id}>
                      <Table.Cell>
                        <Link to={`/app/b2b-approvals/${request.id}`}>
                          <Text className="font-mono font-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
                            {request.request_number}
                          </Text>
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={entityColors[request.entity_type]}>
                          {entityLabels[request.entity_type]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="font-medium">{formatCurrency(request.entity_amount)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: request.total_levels }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 w-4 rounded ${
                                  i < request.current_level
                                    ? "bg-ui-tag-green-bg"
                                    : "bg-ui-bg-subtle"
                                }`}
                              />
                            ))}
                          </div>
                          <Text className="text-sm">
                            {request.current_level}/{request.total_levels}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-ui-fg-muted" />
                          <Text className={
                            request.due_at && new Date(request.due_at) < new Date()
                              ? "text-ui-tag-red-text"
                              : ""
                          }>
                            {formatDate(request.due_at)}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {["pending", "in_review"].includes(request.status) && (
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleApprove(request.id)}
                            >
                              <CheckCircle />
                              Approuver
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleReject(request.id)}
                            >
                              <XCircle />
                              Rejeter
                            </Button>
                          </div>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>

          {/* Workflows Tab */}
          <Tabs.Content value="workflows" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Text className="text-ui-fg-subtle">Chargement...</Text>
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShieldCheck className="text-ui-fg-muted mb-4 h-12 w-12" />
                <Text className="text-ui-fg-subtle">Aucun workflow configuré</Text>
                <Link to="/app/b2b-approvals/workflows/create" className="mt-4">
                  <Button variant="secondary">Créer un workflow</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nom</Table.HeaderCell>
                    <Table.HeaderCell>Type d'entité</Table.HeaderCell>
                    <Table.HeaderCell>Déclencheur</Table.HeaderCell>
                    <Table.HeaderCell>Niveaux</Table.HeaderCell>
                    <Table.HeaderCell>Priorité</Table.HeaderCell>
                    <Table.HeaderCell>Statut</Table.HeaderCell>
                    <Table.HeaderCell></Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {workflows.map((workflow) => (
                    <Table.Row key={workflow.id}>
                      <Table.Cell>
                        <Text className="font-medium">{workflow.name}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={entityColors[workflow.entity_type]}>
                          {entityLabels[workflow.entity_type]}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="capitalize">
                          {workflow.trigger.replace("_", " ")}
                          {workflow.trigger_threshold && (
                            <span className="ml-1">
                              (&gt; {formatCurrency(workflow.trigger_threshold)})
                            </span>
                          )}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{workflow.levels?.length || 0} niveau(x)</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{workflow.priority}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={workflow.is_active ? "green" : "grey"}>
                          {workflow.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Link to={`/app/b2b-approvals/workflows/${workflow.id}`}>
                          <Button variant="secondary" size="small">
                            Configurer
                          </Button>
                        </Link>
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
  label: "Approbations B2B",
  icon: ShieldCheck,
})

export default B2BApprovalsPage
