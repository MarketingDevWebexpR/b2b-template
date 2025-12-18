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
} from "@medusajs/ui"
import {
  Tag,
  Plus,
  MagnifyingGlass,
  ArrowPath,
  Trash,
  PencilSquare,
  Eye,
  ArrowLeft,
  ArrowLongUp,
  ArrowLongDown,
  Star,
  StarSolid,
} from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { Link, useSearchParams } from "react-router-dom"

// Types
interface Marque {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  country: string | null
  is_active: boolean
  is_favorite: boolean
  rank: number
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  product_count?: number
}

interface MarquesResponse {
  marques: Marque[]
  count: number
  skip: number
  take: number
}

// Configuration des couleurs des badges selon le statut
const statusColors = {
  active: "green" as const,
  inactive: "grey" as const,
}

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
}

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
        <Heading level="h2" className="mb-4">
          {title}
        </Heading>
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

const PIMMarquesListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [marques, setMarques] = useState<Marque[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)

  // Search and filters from URL params
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all"
  )

  // Pagination
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  )
  const pageSize = 20

  // Delete state
  const [deletingMarque, setDeletingMarque] = useState<Marque | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Action state for reordering
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Favorite toggle state
  const [togglingFavorite, setTogglingFavorite] = useState<string | null>(null)

  // Update URL params when filters change
  const updateSearchParams = useCallback((params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all" || value === "1") {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    setSearchParams(newParams, { replace: true })
  }, [searchParams, setSearchParams])

  const fetchMarques = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("q", search)
      if (statusFilter && statusFilter !== "all") {
        params.append("is_active", statusFilter === "active" ? "true" : "false")
      }
      params.append("skip", String((currentPage - 1) * pageSize))
      params.append("take", String(pageSize))

      const response = await fetch(`/admin/marques?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Echec du chargement des marques")
      }

      const data = (await response.json()) as MarquesResponse
      setMarques(data.marques || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch marques:", error)
      toast.error("Erreur lors du chargement des marques")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, currentPage])

  useEffect(() => {
    fetchMarques()
  }, [fetchMarques])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    updateSearchParams({ q: search, page: null })
    fetchMarques()
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
    updateSearchParams({ status: value, page: null })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    updateSearchParams({ page: newPage.toString() })
  }

  const handleDelete = async () => {
    if (!deletingMarque) return

    setDeleting(true)
    try {
      const response = await fetch(`/admin/marques/${deletingMarque.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { message?: string }
        throw new Error(errorData.message || "Echec de la suppression de la marque")
      }

      toast.success("Marque supprimee avec succes")
      setDeletingMarque(null)
      fetchMarques()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression"
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  // Pagination
  const totalPages = Math.ceil(count / pageSize)

  // Sort marques by rank for display
  const sortedMarques = [...marques].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  // Helper functions for reordering
  const isFirstMarque = (marqueId: string) => sortedMarques.length > 0 && sortedMarques[0].id === marqueId
  const isLastMarque = (marqueId: string) => sortedMarques.length > 0 && sortedMarques[sortedMarques.length - 1].id === marqueId

  /**
   * Reorder marques using the /reorder endpoint.
   */
  const reorderMarques = async (newOrderIds: string[]) => {
    const response = await fetch(`/admin/marques/reorder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marque_ids: newOrderIds }),
    })

    if (!response.ok) {
      throw new Error("Echec du deplacement")
    }

    return response.json()
  }

  const handleMoveUp = async (marque: Marque) => {
    const currentIndex = sortedMarques.findIndex((m) => m.id === marque.id)

    if (currentIndex <= 0) return

    setActionLoading(marque.id)
    try {
      // Swap with previous marque
      const newOrder = [...sortedMarques]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex - 1]
      newOrder[currentIndex - 1] = temp

      // Optimistic update
      const updatedMarques = newOrder.map((m, index) => ({
        ...m,
        rank: index,
      }))
      setMarques(updatedMarques)

      // Send new order to backend
      await reorderMarques(newOrder.map((m) => m.id))

      toast.success("Position mise a jour")
    } catch (error) {
      toast.error("Erreur lors du deplacement")
      fetchMarques()
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveDown = async (marque: Marque) => {
    const currentIndex = sortedMarques.findIndex((m) => m.id === marque.id)

    if (currentIndex >= sortedMarques.length - 1) return

    setActionLoading(marque.id)
    try {
      // Swap with next marque
      const newOrder = [...sortedMarques]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex + 1]
      newOrder[currentIndex + 1] = temp

      // Optimistic update
      const updatedMarques = newOrder.map((m, index) => ({
        ...m,
        rank: index,
      }))
      setMarques(updatedMarques)

      // Send new order to backend
      await reorderMarques(newOrder.map((m) => m.id))

      toast.success("Position mise a jour")
    } catch (error) {
      toast.error("Erreur lors du deplacement")
      fetchMarques()
    } finally {
      setActionLoading(null)
    }
  }

  /**
   * Toggle the favorite status of a marque
   */
  const handleToggleFavorite = async (marque: Marque) => {
    setTogglingFavorite(marque.id)

    // Optimistic update
    const newFavoriteStatus = !marque.is_favorite
    setMarques((prev) =>
      prev.map((m) =>
        m.id === marque.id ? { ...m, is_favorite: newFavoriteStatus } : m
      )
    )

    try {
      const response = await fetch(`/admin/marques/${marque.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: newFavoriteStatus }),
      })

      if (!response.ok) {
        throw new Error("Echec de la mise a jour")
      }

      toast.success(
        newFavoriteStatus
          ? `"${marque.name}" ajoutee aux favoris`
          : `"${marque.name}" retiree des favoris`
      )
    } catch (error) {
      // Revert optimistic update on error
      setMarques((prev) =>
        prev.map((m) =>
          m.id === marque.id ? { ...m, is_favorite: marque.is_favorite } : m
        )
      )
      toast.error("Erreur lors de la mise a jour du favori")
    } finally {
      setTogglingFavorite(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingMarque}
        onClose={() => setDeletingMarque(null)}
        onConfirm={handleDelete}
        title="Supprimer la marque"
        message={`Etes-vous sur de vouloir supprimer la marque "${deletingMarque?.name}" ? Cette action est irreversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={deleting}
      />

      {/* Breadcrumb & Header */}
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            to="/pim"
            className="flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            PIM
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <span className="text-ui-fg-base font-medium">Marques</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-xl font-semibold">
              Marques
            </Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Gerez les marques et fabricants de vos produits
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchMarques} disabled={loading}>
              <ArrowPath className={loading ? "animate-spin" : ""} />
              Actualiser
            </Button>
            <Link to="/pim/marques/create">
              <Button variant="primary">
                <Plus />
                Nouvelle marque
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="Rechercher par nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Text className="text-ui-fg-subtle text-sm">Statut:</Text>
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <Select.Trigger className="w-[180px]">
              <Select.Value placeholder="Tous les statuts" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Tous</Select.Item>
              <Select.Item value="active">Actif</Select.Item>
              <Select.Item value="inactive">Inactif</Select.Item>
            </Select.Content>
          </Select>
        </div>

        {(search || statusFilter !== "all") && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setSearch("")
              setStatusFilter("all")
              setCurrentPage(1)
              updateSearchParams({ q: null, status: null, page: null })
            }}
          >
            Effacer les filtres
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <ArrowPath className="h-8 w-8 animate-spin text-ui-fg-muted" />
              <Text className="text-ui-fg-subtle">Chargement des marques...</Text>
            </div>
          </div>
        ) : marques.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ui-bg-subtle mb-4">
              <Tag className="text-ui-fg-muted h-8 w-8" />
            </div>
            <Text className="text-ui-fg-base font-medium mb-1">Aucune marque trouvee</Text>
            <Text className="text-ui-fg-subtle text-sm mb-4">
              {search || statusFilter !== "all"
                ? "Aucune marque ne correspond aux criteres de recherche"
                : "Commencez par creer votre premiere marque"}
            </Text>
            {!search && statusFilter === "all" && (
              <Link to="/pim/marques/create">
                <Button variant="secondary">
                  <Plus className="mr-1" />
                  Creer une marque
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-ui-border-base">
              <Table>
                <Table.Header>
                  <Table.Row className="bg-ui-bg-subtle">
                    <Table.HeaderCell className="w-[60px]">Logo</Table.HeaderCell>
                    <Table.HeaderCell className="min-w-[180px]">Nom</Table.HeaderCell>
                    <Table.HeaderCell className="min-w-[120px]">Pays</Table.HeaderCell>
                    <Table.HeaderCell className="min-w-[100px]">Produits</Table.HeaderCell>
                    <Table.HeaderCell className="min-w-[100px]">Statut</Table.HeaderCell>
                    <Table.HeaderCell className="w-[80px] text-center">Favori</Table.HeaderCell>
                    <Table.HeaderCell className="w-[100px]">Position</Table.HeaderCell>
                    <Table.HeaderCell className="w-[160px] text-right">Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedMarques.map((marque) => {
                    const isLoading = actionLoading === marque.id
                    return (
                      <Table.Row key={marque.id} className="hover:bg-ui-bg-subtle-hover">
                        <Table.Cell>
                          {marque.logo_url ? (
                            <img
                              src={marque.logo_url}
                              alt={`Logo ${marque.name}`}
                              className="w-10 h-10 object-contain rounded border border-ui-border-base bg-ui-bg-subtle"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded border border-ui-border-base bg-ui-bg-subtle flex items-center justify-center">
                              <Tag className="h-5 w-5 text-ui-fg-muted" />
                            </div>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-col">
                            <Link
                              to={`/pim/marques/${marque.id}`}
                              className="font-medium text-ui-fg-base hover:text-ui-fg-interactive transition-colors"
                            >
                              {marque.name}
                            </Link>
                            <Text className="text-ui-fg-subtle text-sm truncate max-w-[160px]">
                              {marque.slug}
                            </Text>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Text className="text-ui-fg-subtle">
                            {marque.country || "-"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color="grey">
                            {marque.product_count ?? 0} produit{(marque.product_count ?? 0) !== 1 ? "s" : ""}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={marque.is_active ? statusColors.active : statusColors.inactive}>
                            {marque.is_active ? statusLabels.active : statusLabels.inactive}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFavorite(marque)}
                              disabled={togglingFavorite === marque.id || isLoading}
                              className={`p-1.5 rounded-md transition-all duration-200 ${
                                marque.is_favorite
                                  ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                  : "text-ui-fg-muted hover:text-amber-500 hover:bg-ui-bg-subtle-hover"
                              } ${togglingFavorite === marque.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                              title={marque.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                              {marque.is_favorite ? (
                                <StarSolid className="h-5 w-5" />
                              ) : (
                                <Star className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleMoveUp(marque)}
                              disabled={isFirstMarque(marque.id) || isLoading}
                              title="Monter"
                            >
                              <ArrowLongUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => handleMoveDown(marque)}
                              disabled={isLastMarque(marque.id) || isLoading}
                              title="Descendre"
                            >
                              <ArrowLongDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/pim/marques/${marque.id}`}>
                              <Button variant="secondary" size="small" disabled={isLoading} title="Voir">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/pim/marques/${marque.id}?edit=true`}>
                              <Button variant="secondary" size="small" disabled={isLoading} title="Modifier">
                                <PencilSquare className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => setDeletingMarque(marque)}
                              disabled={isLoading}
                              className="text-ui-tag-red-text hover:text-ui-tag-red-text"
                              title="Supprimer"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Text className="text-ui-fg-subtle text-sm">
                  Page {currentPage} sur {totalPages} ({count} marques)
                </Text>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    Precedent
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  )
}

export default PIMMarquesListPage
