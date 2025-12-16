import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Tabs,
  Table,
  Textarea,
  Toaster,
  toast,
  Input,
  Label,
  Select,
} from "@medusajs/ui"
import {
  ArrowLeft,
  ChatBubbleLeftRight,
  Clock,
  User,
  Buildings,
  CheckCircle,
  XCircle,
  PaperClip,
  PencilSquare,
} from "@medusajs/icons"
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"

// Types
type QuoteStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "responded"
  | "negotiating"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "cancelled"

type MessageSenderType = "customer" | "admin" | "system"
type MessageType = "text" | "price_update" | "terms_update" | "status_change" | "attachment" | "internal"
type HistoryEventType =
  | "created"
  | "updated"
  | "submitted"
  | "reviewed"
  | "responded"
  | "counter_offered"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "cancelled"
  | "item_added"
  | "item_removed"
  | "item_updated"
  | "terms_changed"
  | "assigned"
  | "reminder_sent"
  | "approval_required"
  | "approval_completed"

interface QuoteTotals {
  subtotal?: number
  discount_amount?: number
  discount_percentage?: number
  shipping_amount?: number
  tax_amount?: number
  total?: number
  currency_code?: string
}

interface QuoteTerms {
  payment_terms?: { type: string; days: number }
  delivery_terms?: string
  shipping_method?: string
  incoterms?: string
  minimum_order_value?: number
}

interface QuoteItem {
  id: string
  quote_id: string
  variant_id: string
  product_id: string | null
  title: string
  variant_title: string | null
  sku: string | null
  quantity: number
  min_quantity: number | null
  original_unit_price: number
  requested_unit_price: number | null
  offered_unit_price: number | null
  final_unit_price: number | null
  discount_percentage: number
  line_total: number
  currency_code: string
  notes: string | null
  sort_order: number
  created_at: string
}

interface QuoteMessage {
  id: string
  quote_id: string
  sender_type: MessageSenderType
  sender_id: string
  sender_name: string | null
  message_type: MessageType
  content: string
  attachments: { url: string; filename: string; mimetype: string; size: number }[] | null
  is_internal: boolean
  is_read: boolean
  read_at: string | null
  created_at: string
}

interface QuoteHistory {
  id: string
  quote_id: string
  event_type: HistoryEventType
  actor_type: string
  actor_id: string | null
  actor_name: string | null
  description: string
  previous_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  changed_fields: string[] | null
  created_at: string
}

interface Quote {
  id: string
  quote_number: string
  company_id: string
  requester_id: string
  assigned_to_id: string | null
  status: QuoteStatus
  title: string | null
  notes: string | null
  totals: QuoteTotals
  terms: QuoteTerms
  valid_until: string | null
  submitted_at: string | null
  responded_at: string | null
  decided_at: string | null
  converted_at: string | null
  order_id: string | null
  cart_id: string | null
  region_id: string | null
  version: number
  rejection_reason: string | null
  created_at: string
  updated_at: string
  items: QuoteItem[]
  messages: QuoteMessage[]
  history: QuoteHistory[]
}

// Status configuration
const statusColors: Record<QuoteStatus, "green" | "orange" | "red" | "grey" | "blue" | "purple"> = {
  draft: "grey",
  submitted: "orange",
  under_review: "blue",
  responded: "purple",
  negotiating: "orange",
  accepted: "green",
  rejected: "red",
  expired: "grey",
  converted: "green",
  cancelled: "grey",
}

const statusLabels: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  under_review: "En revision",
  responded: "Repondu",
  negotiating: "En negociation",
  accepted: "Accepte",
  rejected: "Rejete",
  expired: "Expire",
  converted: "Converti",
  cancelled: "Annule",
}

const historyEventLabels: Record<HistoryEventType, string> = {
  created: "Devis cree",
  updated: "Devis modifie",
  submitted: "Devis soumis",
  reviewed: "Revision commencee",
  responded: "Reponse envoyee",
  counter_offered: "Contre-offre",
  accepted: "Devis accepte",
  rejected: "Devis rejete",
  expired: "Devis expire",
  converted: "Converti en commande",
  cancelled: "Devis annule",
  item_added: "Article ajoute",
  item_removed: "Article supprime",
  item_updated: "Article modifie",
  terms_changed: "Conditions modifiees",
  assigned: "Commercial assigne",
  reminder_sent: "Rappel envoye",
  approval_required: "Approbation requise",
  approval_completed: "Approbation terminee",
}

const senderTypeLabels: Record<MessageSenderType, string> = {
  customer: "Client",
  admin: "Commercial",
  system: "Systeme",
}

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Message form state
  const [newMessage, setNewMessage] = useState("")
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Assign form state
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [assignToId, setAssignToId] = useState("")

  // Reject form state
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")

  const fetchQuote = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/admin/b2b/quotes/${id}`, {
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error("Failed to fetch quote")
      }
      const data = await response.json()
      setQuote(data.quote)
    } catch (error) {
      console.error("Failed to fetch quote:", error)
      toast.error("Erreur lors du chargement du devis")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchQuote()
    }
  }, [id])

  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(date))
  }

  const formatShortDate = (date: string | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date))
  }

  // Handle status update
  const handleStatusUpdate = async (newStatus: QuoteStatus, additionalData?: Record<string, unknown>) => {
    if (!quote) return

    setUpdating(true)
    try {
      const response = await fetch(`/admin/b2b/quotes/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          ...additionalData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update quote")
      }

      toast.success(`Statut mis a jour: ${statusLabels[newStatus]}`)
      fetchQuote()
    } catch (error) {
      console.error("Failed to update quote status:", error)
      toast.error("Erreur lors de la mise a jour du statut")
    } finally {
      setUpdating(false)
      setShowRejectForm(false)
      setRejectionReason("")
    }
  }

  // Handle assign
  const handleAssign = async () => {
    if (!assignToId.trim()) {
      toast.error("Veuillez entrer l'ID du commercial")
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/admin/b2b/quotes/${id}/assign`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned_to_id: assignToId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign quote")
      }

      toast.success("Commercial assigne avec succes")
      setShowAssignForm(false)
      setAssignToId("")
      fetchQuote()
    } catch (error) {
      console.error("Failed to assign quote:", error)
      toast.error("Erreur lors de l'assignation")
    } finally {
      setUpdating(false)
    }
  }

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Le message ne peut pas etre vide")
      return
    }

    setSendingMessage(true)
    try {
      const response = await fetch(`/admin/b2b/quotes/${id}/messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          is_internal: isInternalNote,
          message_type: isInternalNote ? "internal" : "text",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast.success(isInternalNote ? "Note interne ajoutee" : "Message envoye")
      setNewMessage("")
      setIsInternalNote(false)
      fetchQuote()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Erreur lors de l'envoi du message")
    } finally {
      setSendingMessage(false)
    }
  }

  // Determine available actions based on status
  const getAvailableActions = () => {
    if (!quote) return []

    const actions: { label: string; action: () => void; variant: "primary" | "secondary" | "danger" }[] = []

    switch (quote.status) {
      case "submitted":
        actions.push({
          label: "Commencer la revision",
          action: () => handleStatusUpdate("under_review"),
          variant: "primary",
        })
        break
      case "under_review":
        actions.push({
          label: "Repondre au devis",
          action: () => (window.location.href = `/app/b2b-quotes/${id}/respond`),
          variant: "primary",
        })
        break
      case "responded":
      case "negotiating":
        actions.push({
          label: "Accepter le devis",
          action: () => handleStatusUpdate("accepted"),
          variant: "primary",
        })
        break
    }

    // Add reject action for pending quotes
    if (["submitted", "under_review", "responded", "negotiating"].includes(quote.status)) {
      actions.push({
        label: "Rejeter le devis",
        action: () => setShowRejectForm(true),
        variant: "danger",
      })
    }

    return actions
  }

  if (loading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <Text>Chargement...</Text>
      </Container>
    )
  }

  if (!quote) {
    return (
      <Container className="flex flex-col items-center justify-center py-12">
        <Text className="text-ui-fg-subtle">Devis non trouve</Text>
        <Link to="/app/b2b-quotes" className="mt-4">
          <Button variant="secondary">Retour a la liste</Button>
        </Link>
      </Container>
    )
  }

  const availableActions = getAvailableActions()
  const currencyCode = quote.totals.currency_code || "EUR"
  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date()

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/app/b2b-quotes"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux devis</Text>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Heading level="h1">{quote.quote_number}</Heading>
              <Badge color={statusColors[quote.status]}>{statusLabels[quote.status]}</Badge>
              {isExpired && quote.status !== "expired" && (
                <Badge color="red">Expire</Badge>
              )}
              {quote.version > 1 && (
                <Badge color="grey">v{quote.version}</Badge>
              )}
            </div>
            {quote.title && (
              <Text className="text-ui-fg-subtle mt-1">{quote.title}</Text>
            )}
          </div>

          <div className="flex gap-2">
            {!quote.assigned_to_id && (
              <Button variant="secondary" onClick={() => setShowAssignForm(true)}>
                <User className="mr-1" />
                Assigner
              </Button>
            )}
            {availableActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant === "danger" ? "secondary" : action.variant}
                onClick={action.action}
                disabled={updating}
                className={action.variant === "danger" ? "text-ui-tag-red-text" : ""}
              >
                {action.variant === "danger" ? (
                  <XCircle className="mr-1" />
                ) : action.variant === "primary" ? (
                  <CheckCircle className="mr-1" />
                ) : null}
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="flex items-center gap-6 mt-4 text-sm text-ui-fg-subtle">
          <div className="flex items-center gap-2">
            <Buildings className="h-4 w-4" />
            <Text size="small">Entreprise: {quote.company_id}</Text>
          </div>
          {quote.assigned_to_id && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <Text size="small">Assigne a: {quote.assigned_to_id}</Text>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Text size="small">
              Valide jusqu'au:{" "}
              <span className={isExpired ? "text-ui-tag-red-text" : ""}>
                {formatShortDate(quote.valid_until)}
              </span>
            </Text>
          </div>
        </div>
      </div>

      {/* Assign Form Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <Heading level="h2" className="mb-4">
              Assigner un commercial
            </Heading>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assign-to">ID du commercial</Label>
                <Input
                  id="assign-to"
                  value={assignToId}
                  onChange={(e) => setAssignToId(e.target.value)}
                  placeholder="user_01..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAssignForm(false)
                    setAssignToId("")
                  }}
                >
                  Annuler
                </Button>
                <Button variant="primary" onClick={handleAssign} disabled={updating}>
                  Assigner
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Form Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <Heading level="h2" className="mb-4">
              Rejeter le devis
            </Heading>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Motif du rejet</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Entrez le motif du rejet..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason("")
                  }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={() =>
                    handleStatusUpdate("rejected", { rejection_reason: rejectionReason })
                  }
                  disabled={updating}
                  className="bg-ui-tag-red-bg text-ui-tag-red-text hover:bg-ui-tag-red-bg-hover"
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="px-6 py-4">
        <Tabs.List>
          <Tabs.Trigger value="overview">Vue d'ensemble</Tabs.Trigger>
          <Tabs.Trigger value="items">
            Articles
            {quote.items.length > 0 && (
              <Badge color="grey" className="ml-2">
                {quote.items.length}
              </Badge>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="messages">
            Messages
            {quote.messages.length > 0 && (
              <Badge color="blue" className="ml-2">
                {quote.messages.length}
              </Badge>
            )}
          </Tabs.Trigger>
          <Tabs.Trigger value="history">Historique</Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="mt-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Info Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Informations
              </Heading>
              <div className="space-y-4">
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Numero de devis</Text>
                  <Text className="font-mono font-medium">{quote.quote_number}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Statut</Text>
                  <Badge color={statusColors[quote.status]}>{statusLabels[quote.status]}</Badge>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Entreprise</Text>
                  <Text className="font-medium">{quote.company_id}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Demandeur</Text>
                  <Text className="font-medium">{quote.requester_id}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Commercial assigne</Text>
                  <Text className="font-medium">{quote.assigned_to_id || "Non assigne"}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Date de creation</Text>
                  <Text className="font-medium">{formatDate(quote.created_at)}</Text>
                </div>
                {quote.submitted_at && (
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de soumission</Text>
                    <Text className="font-medium">{formatDate(quote.submitted_at)}</Text>
                  </div>
                )}
                {quote.responded_at && (
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Date de reponse</Text>
                    <Text className="font-medium">{formatDate(quote.responded_at)}</Text>
                  </div>
                )}
                {quote.order_id && (
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Commande liee</Text>
                    <Link to={`/app/orders/${quote.order_id}`}>
                      <Text className="font-medium text-ui-fg-interactive hover:underline">
                        {quote.order_id}
                      </Text>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Totaux
              </Heading>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Text className="text-ui-fg-subtle">Sous-total</Text>
                  <Text className="font-medium">
                    {quote.totals.subtotal !== undefined
                      ? formatCurrency(quote.totals.subtotal, currencyCode)
                      : "-"}
                  </Text>
                </div>
                {quote.totals.discount_amount !== undefined && quote.totals.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <Text className="text-ui-fg-subtle">
                      Remise
                      {quote.totals.discount_percentage
                        ? ` (${quote.totals.discount_percentage}%)`
                        : ""}
                    </Text>
                    <Text className="font-medium text-ui-tag-green-text">
                      -{formatCurrency(quote.totals.discount_amount, currencyCode)}
                    </Text>
                  </div>
                )}
                {quote.totals.shipping_amount !== undefined && (
                  <div className="flex justify-between">
                    <Text className="text-ui-fg-subtle">Livraison</Text>
                    <Text className="font-medium">
                      {formatCurrency(quote.totals.shipping_amount, currencyCode)}
                    </Text>
                  </div>
                )}
                {quote.totals.tax_amount !== undefined && (
                  <div className="flex justify-between">
                    <Text className="text-ui-fg-subtle">TVA</Text>
                    <Text className="font-medium">
                      {formatCurrency(quote.totals.tax_amount, currencyCode)}
                    </Text>
                  </div>
                )}
                <div className="border-t border-ui-border-base pt-4">
                  <div className="flex justify-between">
                    <Text className="font-semibold">Total</Text>
                    <Text className="text-xl font-bold">
                      {quote.totals.total !== undefined
                        ? formatCurrency(quote.totals.total, currencyCode)
                        : "-"}
                    </Text>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Conditions
              </Heading>
              <div className="space-y-4">
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Conditions de paiement</Text>
                  <Text className="font-medium">
                    {quote.terms.payment_terms
                      ? `${quote.terms.payment_terms.type} - ${quote.terms.payment_terms.days} jours`
                      : "Non definies"}
                  </Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Conditions de livraison</Text>
                  <Text className="font-medium">{quote.terms.delivery_terms || "Non definies"}</Text>
                </div>
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Methode d'expedition</Text>
                  <Text className="font-medium">{quote.terms.shipping_method || "Non definie"}</Text>
                </div>
                {quote.terms.incoterms && (
                  <div>
                    <Text className="text-ui-fg-subtle text-sm">Incoterms</Text>
                    <Text className="font-medium">{quote.terms.incoterms}</Text>
                  </div>
                )}
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Validite</Text>
                  <Text
                    className={`font-medium ${isExpired ? "text-ui-tag-red-text" : ""}`}
                  >
                    {quote.valid_until ? formatDate(quote.valid_until) : "Non definie"}
                  </Text>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                Notes
              </Heading>
              {quote.notes ? (
                <Text className="whitespace-pre-wrap">{quote.notes}</Text>
              ) : (
                <Text className="text-ui-fg-subtle">Aucune note</Text>
              )}
              {quote.rejection_reason && (
                <div className="mt-4 p-4 bg-ui-tag-red-bg rounded-lg">
                  <Text className="text-ui-tag-red-text font-medium">Motif du rejet:</Text>
                  <Text className="text-ui-tag-red-text mt-1">{quote.rejection_reason}</Text>
                </div>
              )}
            </div>
          </div>
        </Tabs.Content>

        {/* Items Tab */}
        <Tabs.Content value="items" className="mt-6">
          <div className="rounded-lg border border-ui-border-base overflow-hidden">
            {quote.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Text className="text-ui-fg-subtle">Aucun article dans ce devis</Text>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Produit</Table.HeaderCell>
                    <Table.HeaderCell>Variante / SKU</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Quantite</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Prix original</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Prix demande</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Prix offert</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Prix final</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Total ligne</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {quote.items.map((item) => (
                    <Table.Row key={item.id}>
                      <Table.Cell>
                        <Text className="font-medium">{item.title}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          {item.variant_title && (
                            <Text className="text-sm">{item.variant_title}</Text>
                          )}
                          {item.sku && (
                            <Text className="text-ui-fg-subtle text-sm font-mono">{item.sku}</Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text className="font-medium">{item.quantity}</Text>
                        {item.min_quantity && (
                          <Text className="text-ui-fg-subtle text-xs">
                            Min: {item.min_quantity}
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text>{formatCurrency(item.original_unit_price, item.currency_code)}</Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text className={item.requested_unit_price ? "" : "text-ui-fg-subtle"}>
                          {item.requested_unit_price
                            ? formatCurrency(item.requested_unit_price, item.currency_code)
                            : "-"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text
                          className={
                            item.offered_unit_price ? "text-ui-tag-purple-text" : "text-ui-fg-subtle"
                          }
                        >
                          {item.offered_unit_price
                            ? formatCurrency(item.offered_unit_price, item.currency_code)
                            : "-"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text
                          className={
                            item.final_unit_price ? "font-medium text-ui-tag-green-text" : "text-ui-fg-subtle"
                          }
                        >
                          {item.final_unit_price
                            ? formatCurrency(item.final_unit_price, item.currency_code)
                            : "-"}
                        </Text>
                        {item.discount_percentage > 0 && (
                          <Text className="text-ui-tag-green-text text-xs">
                            -{item.discount_percentage}%
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <Text className="font-semibold">
                          {formatCurrency(item.line_total, item.currency_code)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>

          {/* Items Summary */}
          {quote.items.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="w-80 rounded-lg border border-ui-border-base p-4 space-y-2">
                <div className="flex justify-between">
                  <Text className="text-ui-fg-subtle">Total articles</Text>
                  <Text className="font-medium">{quote.items.length}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-ui-fg-subtle">Quantite totale</Text>
                  <Text className="font-medium">
                    {quote.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Text>
                </div>
                <div className="flex justify-between border-t border-ui-border-base pt-2">
                  <Text className="font-semibold">Sous-total</Text>
                  <Text className="font-bold">
                    {formatCurrency(
                      quote.items.reduce((sum, item) => sum + item.line_total, 0),
                      currencyCode
                    )}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </Tabs.Content>

        {/* Messages Tab */}
        <Tabs.Content value="messages" className="mt-6">
          <div className="space-y-6">
            {/* Message Thread */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                <ChatBubbleLeftRight className="inline mr-2" />
                Fil de discussion
              </Heading>

              {quote.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <ChatBubbleLeftRight className="h-12 w-12 text-ui-fg-muted mb-4" />
                  <Text className="text-ui-fg-subtle">Aucun message</Text>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {quote.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 rounded-lg ${
                        message.sender_type === "admin"
                          ? "bg-ui-bg-subtle ml-8"
                          : message.sender_type === "system"
                          ? "bg-ui-tag-blue-bg mx-4"
                          : "bg-ui-bg-base border border-ui-border-base mr-8"
                      } ${message.is_internal ? "border-l-4 border-l-ui-tag-orange-bg" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            color={
                              message.sender_type === "admin"
                                ? "blue"
                                : message.sender_type === "system"
                                ? "grey"
                                : "green"
                            }
                          >
                            {senderTypeLabels[message.sender_type]}
                          </Badge>
                          <Text className="font-medium text-sm">
                            {message.sender_name || message.sender_id}
                          </Text>
                          {message.is_internal && (
                            <Badge color="orange">Note interne</Badge>
                          )}
                        </div>
                        <Text className="text-ui-fg-subtle text-sm">
                          {formatShortDate(message.created_at)}
                        </Text>
                      </div>
                      <Text className="whitespace-pre-wrap">{message.content}</Text>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-ui-fg-interactive hover:underline"
                            >
                              <PaperClip className="h-4 w-4" />
                              {attachment.filename}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Message Form */}
            <div className="rounded-lg border border-ui-border-base p-6">
              <Heading level="h2" className="mb-4">
                <PencilSquare className="inline mr-2" />
                Nouveau message
              </Heading>
              <div className="space-y-4">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ecrivez votre message..."
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-ui-border-base"
                    />
                    <Text className="text-sm">Note interne (non visible par le client)</Text>
                  </label>
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    <ChatBubbleLeftRight className="mr-1" />
                    {sendingMessage ? "Envoi..." : isInternalNote ? "Ajouter la note" : "Envoyer"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* History Tab */}
        <Tabs.Content value="history" className="mt-6">
          <div className="rounded-lg border border-ui-border-base p-6">
            <Heading level="h2" className="mb-4">
              <Clock className="inline mr-2" />
              Historique des modifications
            </Heading>

            {quote.history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Clock className="h-12 w-12 text-ui-fg-muted mb-4" />
                <Text className="text-ui-fg-subtle">Aucun historique</Text>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-ui-border-base" />

                <div className="space-y-6">
                  {quote.history.map((event, idx) => (
                    <div key={event.id} className="relative flex gap-4 pl-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2 w-4 h-4 rounded-full border-2 bg-white ${
                          event.event_type === "created"
                            ? "border-ui-tag-green-icon"
                            : event.event_type === "rejected" || event.event_type === "cancelled"
                            ? "border-ui-tag-red-icon"
                            : event.event_type === "accepted" || event.event_type === "converted"
                            ? "border-ui-tag-green-icon"
                            : "border-ui-tag-blue-icon"
                        }`}
                      />

                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              color={
                                event.event_type === "rejected" || event.event_type === "cancelled"
                                  ? "red"
                                  : event.event_type === "accepted" || event.event_type === "converted"
                                  ? "green"
                                  : "blue"
                              }
                            >
                              {historyEventLabels[event.event_type] || event.event_type}
                            </Badge>
                            <Text className="text-sm text-ui-fg-subtle">
                              par {event.actor_name || event.actor_type}
                            </Text>
                          </div>
                          <Text className="text-sm text-ui-fg-subtle">
                            {formatShortDate(event.created_at)}
                          </Text>
                        </div>
                        <Text className="mt-1">{event.description}</Text>

                        {/* Show changed fields if available */}
                        {event.changed_fields && event.changed_fields.length > 0 && (
                          <div className="mt-2 text-sm text-ui-fg-subtle">
                            <Text className="text-xs">
                              Champs modifies: {event.changed_fields.join(", ")}
                            </Text>
                          </div>
                        )}

                        {/* Show new values if available */}
                        {event.new_values && Object.keys(event.new_values).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm text-ui-fg-interactive cursor-pointer hover:underline">
                              Voir les details
                            </summary>
                            <pre className="mt-2 p-2 bg-ui-bg-subtle rounded text-xs overflow-auto">
                              {JSON.stringify(event.new_values, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export default QuoteDetailPage
