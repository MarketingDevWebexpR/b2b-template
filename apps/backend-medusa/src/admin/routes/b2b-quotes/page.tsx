import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Button, Badge, Table, Input, Select, Toaster } from "@medusajs/ui"
import { DocumentText, MagnifyingGlass, ChatBubbleLeftRight } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type QuoteStatus = "draft" | "submitted" | "under_review" | "responded" | "negotiating" | "accepted" | "rejected" | "expired" | "converted" | "cancelled"

interface Quote {
  id: string
  quote_number: string
  company_id: string
  requester_id: string
  assigned_to_id: string | null
  status: QuoteStatus
  title: string | null
  totals: {
    subtotal?: number
    total?: number
    currency_code?: string
  }
  valid_until: string | null
  submitted_at: string | null
  responded_at: string | null
  created_at: string
}

interface QuotesResponse {
  quotes: Quote[]
  count: number
  limit: number
  offset: number
}

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
  under_review: "En révision",
  responded: "Répondu",
  negotiating: "En négociation",
  accepted: "Accepté",
  rejected: "Rejeté",
  expired: "Expiré",
  converted: "Converti",
  cancelled: "Annulé",
}

const B2BQuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const fetchQuotes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()

      if (statusFilter) {
        params.append("status", statusFilter)
      }

      params.append("limit", "50")

      const response = await fetch(`/admin/b2b/quotes?${params}`, {
        credentials: "include",
      })
      const data: QuotesResponse = await response.json()
      setQuotes(data.quotes || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch quotes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotes()
  }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchQuotes()
  }

  const formatCurrency = (amount: number, currency = "EUR") => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amount / 100)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
    }).format(new Date(date))
  }

  const pendingCount = quotes.filter(q =>
    ["submitted", "under_review", "responded", "negotiating"].includes(q.status)
  ).length

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Devis B2B</Heading>
          <Text className="text-ui-fg-subtle">
            Gérez les demandes de devis et les négociations
          </Text>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 px-6 py-4">
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Total devis</Text>
          <Heading level="h2">{count}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">En attente</Text>
          <Heading level="h2" className="text-ui-tag-orange-text">{pendingCount}</Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Acceptés</Text>
          <Heading level="h2" className="text-ui-tag-green-text">
            {quotes.filter(q => q.status === "accepted").length}
          </Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Convertis</Text>
          <Heading level="h2" className="text-ui-tag-green-text">
            {quotes.filter(q => q.status === "converted").length}
          </Heading>
        </div>
        <div className="rounded-lg border border-ui-border-base p-4">
          <Text className="text-ui-fg-subtle text-sm">Expirés</Text>
          <Heading level="h2" className="text-ui-tag-red-text">
            {quotes.filter(q => q.status === "expired").length}
          </Heading>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
              <Input
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger className="w-40">
              <Select.Value placeholder="Statut" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="">Tous les statuts</Select.Item>
              {Object.entries(statusLabels).map(([value, label]) => (
                <Select.Item key={value} value={value}>{label}</Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {/* Table Content */}
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Text className="text-ui-fg-subtle">Chargement...</Text>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <DocumentText className="text-ui-fg-muted mb-4 h-12 w-12" />
              <Text className="text-ui-fg-subtle">Aucun devis trouvé</Text>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>N° Devis</Table.HeaderCell>
                  <Table.HeaderCell>Titre</Table.HeaderCell>
                  <Table.HeaderCell>Statut</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                  <Table.HeaderCell>Soumis le</Table.HeaderCell>
                  <Table.HeaderCell>Valide jusqu'au</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {quotes.map((quote) => (
                  <Table.Row key={quote.id}>
                    <Table.Cell>
                      <Text className="font-mono font-medium">{quote.quote_number}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{quote.title || "-"}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={statusColors[quote.status]}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className="font-medium">
                        {quote.totals?.total
                          ? formatCurrency(quote.totals.total, quote.totals.currency_code)
                          : "-"}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{formatDate(quote.submitted_at)}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text className={
                        quote.valid_until && new Date(quote.valid_until) < new Date()
                          ? "text-ui-tag-red-text"
                          : ""
                      }>
                        {formatDate(quote.valid_until)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-2">
                        <Link to={`/app/b2b-quotes/${quote.id}`}>
                          <Button variant="secondary" size="small">
                            Voir
                          </Button>
                        </Link>
                        {["submitted", "under_review"].includes(quote.status) && (
                          <Link to={`/app/b2b-quotes/${quote.id}/respond`}>
                            <Button variant="primary" size="small">
                              <ChatBubbleLeftRight className="mr-1" />
                              Répondre
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Devis B2B",
  icon: DocumentText,
})

export default B2BQuotesPage
