import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Select,
  Toaster,
  toast,
} from "@medusajs/ui"
import {
  Photo,
  Plus,
  ArrowPath,
  Trash,
  PencilSquare,
  Eye,
  CheckCircle,
  XCircle,
  SquareTwoStack,
  ArrowLeft,
} from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"

// Types
type SlideStatus = "published" | "draft" | "scheduled" | "expired"

interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  badge: string | null
  image_url: string | null
  gradient: string
  cta_label: string
  cta_href: string
  secondary_cta_label: string | null
  position: number
  is_published: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

interface HeroSlidesResponse {
  slides: HeroSlide[]
  count: number
  limit: number
  offset: number
}

// Configuration des couleurs des badges selon le statut
const statusColors: Record<SlideStatus, "green" | "orange" | "red" | "grey" | "blue"> = {
  published: "green",
  draft: "grey",
  scheduled: "blue",
  expired: "red",
}

const statusLabels: Record<SlideStatus, string> = {
  published: "Publié",
  draft: "Brouillon",
  scheduled: "Planifié",
  expired: "Expiré",
}

/**
 * Détermine le statut d'une slide en fonction de ses dates et de son état publié
 */
const getSlideStatus = (slide: HeroSlide): SlideStatus => {
  if (!slide.is_published) {
    return "draft"
  }

  const now = new Date()
  const startDate = slide.start_date ? new Date(slide.start_date) : null
  const endDate = slide.end_date ? new Date(slide.end_date) : null

  // Si une date de fin est définie et dépassée
  if (endDate && now > endDate) {
    return "expired"
  }

  // Si une date de début est définie et pas encore atteinte
  if (startDate && now < startDate) {
    return "scheduled"
  }

  return "published"
}

/**
 * Formate une date au format français
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

/**
 * Tronque un texte si trop long
 */
const truncateText = (text: string, maxLength: number = 40): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
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

const CMSHeroSlidesPage = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Delete state
  const [deletingSlide, setDeletingSlide] = useState<HeroSlide | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchSlides = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("limit", "50")

      const response = await fetch(`/admin/cms/hero-slides?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec du chargement des slides")
      }

      const data = (await response.json()) as HeroSlidesResponse
      setSlides(data.slides || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch hero slides:", error)
      toast.error("Erreur lors du chargement des slides")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  const handleDelete = async () => {
    if (!deletingSlide) return

    setDeleting(true)
    try {
      const response = await fetch(`/admin/cms/hero-slides/${deletingSlide.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la suppression de la slide")
      }

      toast.success("Slide supprimée avec succès")
      setDeletingSlide(null)
      fetchSlides()
    } catch (error) {
      console.error("Failed to delete hero slide:", error)
      toast.error("Erreur lors de la suppression de la slide")
    } finally {
      setDeleting(false)
    }
  }

  const handleTogglePublish = async (slide: HeroSlide) => {
    setActionLoading(slide.id)
    try {
      const method = slide.is_published ? "DELETE" : "POST"
      const response = await fetch(`/admin/cms/hero-slides/${slide.id}/publish`, {
        method,
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la mise à jour")
      }

      toast.success(slide.is_published ? "Slide dépubliée" : "Slide publiée")
      fetchSlides()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = async (slide: HeroSlide) => {
    setActionLoading(slide.id)
    try {
      const response = await fetch(`/admin/cms/hero-slides/${slide.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la duplication")
      }

      toast.success("Slide dupliquée avec succès")
      fetchSlides()
    } catch (error) {
      toast.error("Erreur lors de la duplication")
    } finally {
      setActionLoading(null)
    }
  }

  /**
   * Réordonne les slides en utilisant l'endpoint /reorder.
   * Cette approche garantit que toutes les positions sont cohérentes.
   */
  const reorderSlides = async (newOrderIds: string[]) => {
    const response = await fetch(`/admin/cms/hero-slides/reorder`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slide_ids: newOrderIds }),
    })

    if (!response.ok) {
      throw new Error("Échec du déplacement")
    }

    return response.json()
  }

  const handleMoveUp = async (slide: HeroSlide) => {
    // Trouver l'index dans la liste triée par position
    const sortedSlides = [...slides].sort((a, b) => a.position - b.position)
    const currentIndex = sortedSlides.findIndex((s) => s.id === slide.id)

    if (currentIndex <= 0) return

    setActionLoading(slide.id)
    try {
      // Échanger avec la slide précédente
      const newOrder = [...sortedSlides]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex - 1]
      newOrder[currentIndex - 1] = temp

      // Mise à jour optimiste du state local pour un affichage immédiat
      const updatedSlides = newOrder.map((s, index) => ({
        ...s,
        position: index,
      }))
      setSlides(updatedSlides)

      // Envoyer le nouvel ordre au backend
      await reorderSlides(newOrder.map((s) => s.id))

      toast.success("Position mise à jour")
    } catch (error) {
      // En cas d'erreur, recharger les données depuis le serveur
      toast.error("Erreur lors du déplacement")
      fetchSlides()
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveDown = async (slide: HeroSlide) => {
    // Trouver l'index dans la liste triée par position
    const sortedSlides = [...slides].sort((a, b) => a.position - b.position)
    const currentIndex = sortedSlides.findIndex((s) => s.id === slide.id)

    if (currentIndex >= sortedSlides.length - 1) return

    setActionLoading(slide.id)
    try {
      // Échanger avec la slide suivante
      const newOrder = [...sortedSlides]
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[currentIndex + 1]
      newOrder[currentIndex + 1] = temp

      // Mise à jour optimiste du state local pour un affichage immédiat
      const updatedSlides = newOrder.map((s, index) => ({
        ...s,
        position: index,
      }))
      setSlides(updatedSlides)

      // Envoyer le nouvel ordre au backend
      await reorderSlides(newOrder.map((s) => s.id))

      toast.success("Position mise à jour")
    } catch (error) {
      // En cas d'erreur, recharger les données depuis le serveur
      toast.error("Erreur lors du déplacement")
      fetchSlides()
    } finally {
      setActionLoading(null)
    }
  }

  // Trier les slides par position et filtrer par statut
  const sortedSlides = [...slides].sort((a, b) => a.position - b.position)
  const filteredSlides = sortedSlides.filter((slide) => {
    if (statusFilter === "all") return true
    return getSlideStatus(slide) === statusFilter
  })

  // Calcul des statistiques
  const publishedCount = slides.filter((s) => getSlideStatus(s) === "published").length
  const draftCount = slides.filter((s) => getSlideStatus(s) === "draft").length
  const scheduledCount = slides.filter((s) => getSlideStatus(s) === "scheduled").length
  const expiredCount = slides.filter((s) => getSlideStatus(s) === "expired").length

  // Calculer si un slide est le premier ou le dernier dans la liste triée
  const isFirstSlide = (slideId: string) => sortedSlides.length > 0 && sortedSlides[0].id === slideId
  const isLastSlide = (slideId: string) => sortedSlides.length > 0 && sortedSlides[sortedSlides.length - 1].id === slideId

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingSlide}
        onClose={() => setDeletingSlide(null)}
        onConfirm={handleDelete}
        title="Supprimer la slide"
        message="Êtes-vous sûr de vouloir supprimer cette slide ? Cette action est irréversible."
        confirmText="Supprimer"
        confirmVariant="danger"
        isLoading={deleting}
      />

      {/* Breadcrumb & Header */}
      <div className="px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link
            to="/cms"
            className="flex items-center gap-1 text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            CMS
          </Link>
          <span className="text-ui-fg-muted">/</span>
          <span className="text-ui-fg-base font-medium">Hero Slides</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-xl font-semibold">
              Hero Slides
            </Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Gérez les slides du carousel d'accueil de votre site
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchSlides} disabled={loading}>
              <ArrowPath className={loading ? "animate-spin" : ""} />
              Actualiser
            </Button>
            <Link to="/cms/hero-slides/create">
              <Button variant="primary">
                <Plus />
                Nouvelle slide
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="rounded-lg border border-ui-border-base p-4 bg-ui-bg-subtle">
            <Text className="text-ui-fg-subtle text-sm">Total</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1">
              {loading ? "-" : count}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text className="text-ui-fg-subtle text-sm">Publiées</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-tag-green-text">
              {loading ? "-" : publishedCount}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text className="text-ui-fg-subtle text-sm">Brouillons</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-fg-muted">
              {loading ? "-" : draftCount}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text className="text-ui-fg-subtle text-sm">Planifiées</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-tag-blue-text">
              {loading ? "-" : scheduledCount}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text className="text-ui-fg-subtle text-sm">Expirées</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-tag-red-text">
              {loading ? "-" : expiredCount}
            </Heading>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex items-center gap-2">
          <Text className="text-ui-fg-subtle text-sm">Filtrer par statut:</Text>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger className="w-[180px]">
              <Select.Value placeholder="Tous les statuts" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Tous les statuts</Select.Item>
              <Select.Item value="published">Publié</Select.Item>
              <Select.Item value="draft">Brouillon</Select.Item>
              <Select.Item value="scheduled">Planifié</Select.Item>
              <Select.Item value="expired">Expiré</Select.Item>
            </Select.Content>
          </Select>
        </div>
        {statusFilter !== "all" && (
          <Button
            variant="secondary"
            size="small"
            onClick={() => setStatusFilter("all")}
          >
            Effacer le filtre
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <ArrowPath className="h-8 w-8 animate-spin text-ui-fg-muted" />
              <Text className="text-ui-fg-subtle">Chargement des slides...</Text>
            </div>
          </div>
        ) : filteredSlides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ui-bg-subtle mb-4">
              <Photo className="text-ui-fg-muted h-8 w-8" />
            </div>
            <Text className="text-ui-fg-base font-medium mb-1">Aucune slide trouvée</Text>
            <Text className="text-ui-fg-subtle text-sm mb-4">
              {statusFilter !== "all"
                ? "Aucune slide ne correspond au filtre sélectionné"
                : "Commencez par créer votre première slide"}
            </Text>
            {statusFilter === "all" && (
              <Link to="/cms/hero-slides/create">
                <Button variant="secondary">
                  <Plus className="mr-1" />
                  Créer une slide
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row className="bg-ui-bg-subtle">
                  <Table.HeaderCell className="w-[80px]">Position</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[220px]">Titre</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Badge</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[140px]">CTA</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Statut</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[120px]">Dates</Table.HeaderCell>
                  <Table.HeaderCell className="w-[200px] text-right">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredSlides.map((slide) => {
                  const status = getSlideStatus(slide)
                  const isLoading = actionLoading === slide.id
                  return (
                    <Table.Row key={slide.id} className="hover:bg-ui-bg-subtle-hover">
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(slide)}
                            disabled={isFirstSlide(slide.id) || isLoading}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-ui-bg-base disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                            title="Monter"
                          >
                            <span className="sr-only">Monter</span>
                            ↑
                          </button>
                          <Text className="font-medium w-6 text-center">{slide.position + 1}</Text>
                          <button
                            onClick={() => handleMoveDown(slide)}
                            disabled={isLastSlide(slide.id) || isLoading}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-ui-bg-base disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                            title="Descendre"
                          >
                            <span className="sr-only">Descendre</span>
                            ↓
                          </button>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col">
                          <Link
                            to={`/cms/hero-slides/${slide.id}`}
                            className="font-medium text-ui-fg-base hover:text-ui-fg-interactive transition-colors"
                          >
                            {truncateText(slide.title)}
                          </Link>
                          {slide.subtitle && (
                            <Text className="text-ui-fg-subtle text-sm">
                              {truncateText(slide.subtitle, 30)}
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {slide.badge ? (
                          <Badge color="orange">{slide.badge}</Badge>
                        ) : (
                          <Text className="text-ui-fg-muted">-</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-ui-fg-subtle text-sm truncate max-w-[130px]">
                          {slide.cta_label}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColors[status]}>{statusLabels[status]}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col text-sm">
                          <Text className="text-ui-fg-subtle">
                            {slide.start_date ? formatDate(slide.start_date) : "Immédiat"}
                          </Text>
                          {slide.end_date && (
                            <Text className="text-ui-fg-muted text-xs">
                              → {formatDate(slide.end_date)}
                            </Text>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/cms/hero-slides/${slide.id}`}>
                            <Button variant="secondary" size="small" disabled={isLoading} title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/cms/hero-slides/${slide.id}?edit=true`}>
                            <Button variant="secondary" size="small" disabled={isLoading} title="Modifier">
                              <PencilSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleTogglePublish(slide)}
                            disabled={isLoading}
                            title={slide.is_published ? "Dépublier" : "Publier"}
                          >
                            {slide.is_published ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleDuplicate(slide)}
                            disabled={isLoading}
                            title="Dupliquer"
                          >
                            <SquareTwoStack className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setDeletingSlide(slide)}
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
        )}
      </div>
    </Container>
  )
}

export default CMSHeroSlidesPage
