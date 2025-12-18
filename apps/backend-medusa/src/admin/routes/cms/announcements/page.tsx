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
  Newspaper,
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
type AnnouncementStatus = "active" | "inactive" | "scheduled" | "expired"

interface Announcement {
  id: string
  message: string
  link_url: string | null
  link_text: string | null
  background_color: string
  text_color: string
  start_date: string | null
  end_date: string | null
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

interface AnnouncementsResponse {
  announcements: Announcement[]
  count: number
  limit: number
  offset: number
}

// Configuration des couleurs des badges selon le statut
const statusColors: Record<AnnouncementStatus, "green" | "orange" | "red" | "grey" | "blue"> = {
  active: "green",
  inactive: "grey",
  scheduled: "blue",
  expired: "red",
}

const statusLabels: Record<AnnouncementStatus, string> = {
  active: "Actif",
  inactive: "Inactif",
  scheduled: "Planifié",
  expired: "Expiré",
}

/**
 * Détermine le statut d'une annonce en fonction de ses dates et de son état actif
 */
const getAnnouncementStatus = (announcement: Announcement): AnnouncementStatus => {
  if (!announcement.is_active) {
    return "inactive"
  }

  const now = new Date()
  const startDate = announcement.start_date ? new Date(announcement.start_date) : null
  const endDate = announcement.end_date ? new Date(announcement.end_date) : null

  // Si une date de fin est définie et dépassée
  if (endDate && now > endDate) {
    return "expired"
  }

  // Si une date de début est définie et pas encore atteinte
  if (startDate && now < startDate) {
    return "scheduled"
  }

  return "active"
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * Formate les dates de validité
 */
const formatDateRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate && !endDate) {
    return "Toujours"
  }

  const parts: string[] = []

  if (startDate) {
    parts.push(`Du ${formatDate(startDate)}`)
  }

  if (endDate) {
    parts.push(`${startDate ? "au" : "Jusqu'au"} ${formatDate(endDate)}`)
  }

  return parts.join(" ")
}

/**
 * Tronque un texte si trop long
 */
const truncateText = (text: string, maxLength: number = 60): string => {
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

const CMSAnnouncementsListPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Delete state
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("limit", "50")

      const response = await fetch(`/admin/cms/announcements?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec du chargement des annonces")
      }

      const data = (await response.json()) as AnnouncementsResponse
      setAnnouncements(data.announcements || [])
      setCount(data.count || 0)
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
      toast.error("Erreur lors du chargement des annonces")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const handleDelete = async () => {
    if (!deletingAnnouncement) return

    setDeleting(true)
    try {
      const response = await fetch(`/admin/cms/announcements/${deletingAnnouncement.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la suppression de l'annonce")
      }

      toast.success("Annonce supprimée avec succès")
      setDeletingAnnouncement(null)
      fetchAnnouncements()
    } catch (error) {
      console.error("Failed to delete announcement:", error)
      toast.error("Erreur lors de la suppression de l'annonce")
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (announcement: Announcement) => {
    setActionLoading(announcement.id)
    try {
      const response = await fetch(`/admin/cms/announcements/${announcement.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !announcement.is_active }),
      })

      if (!response.ok) {
        throw new Error("Échec de la mise à jour")
      }

      toast.success(announcement.is_active ? "Annonce désactivée" : "Annonce activée")
      fetchAnnouncements()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = async (announcement: Announcement) => {
    setActionLoading(announcement.id)
    try {
      const response = await fetch(`/admin/cms/announcements/${announcement.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Échec de la duplication")
      }

      toast.success("Annonce dupliquée avec succès")
      fetchAnnouncements()
    } catch (error) {
      toast.error("Erreur lors de la duplication")
    } finally {
      setActionLoading(null)
    }
  }

  // Tri par priorité décroissante (priorité haute = affiché en premier)
  const sortedAnnouncements = [...announcements].sort((a, b) => b.priority - a.priority)

  const handleMoveUp = async (announcement: Announcement) => {
    // Trouver l'index dans la liste triée
    const currentIndex = sortedAnnouncements.findIndex((a) => a.id === announcement.id)
    if (currentIndex <= 0) return // Déjà en premier

    // Échanger avec l'annonce précédente (priorité plus haute)
    const previousAnnouncement = sortedAnnouncements[currentIndex - 1]

    setActionLoading(announcement.id)
    try {
      // Si les priorités sont égales, on donne une priorité plus haute à l'élément courant
      if (announcement.priority === previousAnnouncement.priority) {
        await fetch(`/admin/cms/announcements/${announcement.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: announcement.priority + 1 }),
        })
      } else {
        // Sinon on échange les priorités
        await Promise.all([
          fetch(`/admin/cms/announcements/${announcement.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: previousAnnouncement.priority }),
          }),
          fetch(`/admin/cms/announcements/${previousAnnouncement.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: announcement.priority }),
          }),
        ])
      }

      fetchAnnouncements()
    } catch (error) {
      toast.error("Erreur lors du déplacement")
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveDown = async (announcement: Announcement) => {
    // Trouver l'index dans la liste triée
    const currentIndex = sortedAnnouncements.findIndex((a) => a.id === announcement.id)
    if (currentIndex >= sortedAnnouncements.length - 1) return // Déjà en dernier

    // Échanger avec l'annonce suivante (priorité plus basse)
    const nextAnnouncement = sortedAnnouncements[currentIndex + 1]

    setActionLoading(announcement.id)
    try {
      // Si les priorités sont égales, on donne une priorité plus basse à l'élément courant
      if (announcement.priority === nextAnnouncement.priority) {
        // On ne peut pas descendre en dessous de 0, donc on monte l'autre élément
        await fetch(`/admin/cms/announcements/${nextAnnouncement.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: nextAnnouncement.priority + 1 }),
        })
      } else {
        // Sinon on échange les priorités
        await Promise.all([
          fetch(`/admin/cms/announcements/${announcement.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: nextAnnouncement.priority }),
          }),
          fetch(`/admin/cms/announcements/${nextAnnouncement.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priority: announcement.priority }),
          }),
        ])
      }

      fetchAnnouncements()
    } catch (error) {
      toast.error("Erreur lors du déplacement")
    } finally {
      setActionLoading(null)
    }
  }

  // Filtrer les annonces par statut (utilise la liste triée)
  const filteredAnnouncements = sortedAnnouncements.filter((announcement) => {
    if (statusFilter === "all") return true
    return getAnnouncementStatus(announcement) === statusFilter
  })

  // Calcul des statistiques
  const activeCount = announcements.filter((a) => getAnnouncementStatus(a) === "active").length
  const inactiveCount = announcements.filter((a) => getAnnouncementStatus(a) === "inactive").length
  const scheduledCount = announcements.filter((a) => getAnnouncementStatus(a) === "scheduled").length
  const expiredCount = announcements.filter((a) => getAnnouncementStatus(a) === "expired").length

  // Helper pour obtenir la position dans la liste triée
  const getPositionInList = (announcement: Announcement): number => {
    return sortedAnnouncements.findIndex((a) => a.id === announcement.id) + 1
  }

  const isFirstInList = (announcement: Announcement): boolean => {
    return sortedAnnouncements.findIndex((a) => a.id === announcement.id) === 0
  }

  const isLastInList = (announcement: Announcement): boolean => {
    return sortedAnnouncements.findIndex((a) => a.id === announcement.id) === sortedAnnouncements.length - 1
  }

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingAnnouncement}
        onClose={() => setDeletingAnnouncement(null)}
        onConfirm={handleDelete}
        title="Supprimer l'annonce"
        message="Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."
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
          <span className="text-ui-fg-base font-medium">Annonces</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h1" className="text-xl font-semibold">
              Annonces
            </Heading>
            <Text className="text-ui-fg-subtle mt-1">
              Gérez les bannières d'annonces promotionnelles de votre site
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchAnnouncements} disabled={loading}>
              <ArrowPath className={loading ? "animate-spin" : ""} />
              Actualiser
            </Button>
            <Link to="/cms/announcements/create">
              <Button variant="primary">
                <Plus />
                Nouvelle annonce
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
            <Text className="text-ui-fg-subtle text-sm">Actives</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-tag-green-text">
              {loading ? "-" : activeCount}
            </Heading>
          </div>
          <div className="rounded-lg border border-ui-border-base p-4">
            <Text className="text-ui-fg-subtle text-sm">Inactives</Text>
            <Heading level="h2" className="text-2xl font-semibold mt-1 text-ui-fg-muted">
              {loading ? "-" : inactiveCount}
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
              <Select.Item value="active">Actif</Select.Item>
              <Select.Item value="inactive">Inactif</Select.Item>
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
              <Text className="text-ui-fg-subtle">Chargement des annonces...</Text>
            </div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ui-bg-subtle mb-4">
              <Newspaper className="text-ui-fg-muted h-8 w-8" />
            </div>
            <Text className="text-ui-fg-base font-medium mb-1">Aucune annonce trouvée</Text>
            <Text className="text-ui-fg-subtle text-sm mb-4">
              {statusFilter !== "all"
                ? "Aucune annonce ne correspond au filtre sélectionné"
                : "Commencez par créer votre première annonce"}
            </Text>
            {statusFilter === "all" && (
              <Link to="/cms/announcements/create">
                <Button variant="secondary">
                  <Plus className="mr-1" />
                  Créer une annonce
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-ui-border-base">
            <Table>
              <Table.Header>
                <Table.Row className="bg-ui-bg-subtle">
                  <Table.HeaderCell className="w-[100px]">Ordre</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[280px]">Message</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[140px]">Lien</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Couleurs</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[100px]">Statut</Table.HeaderCell>
                  <Table.HeaderCell className="min-w-[150px]">Dates</Table.HeaderCell>
                  <Table.HeaderCell className="w-[180px] text-right">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAnnouncements.map((announcement) => {
                  const status = getAnnouncementStatus(announcement)
                  const isLoading = actionLoading === announcement.id
                  return (
                    <Table.Row key={announcement.id} className="hover:bg-ui-bg-subtle-hover">
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveUp(announcement)}
                            disabled={isFirstInList(announcement) || isLoading}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-ui-bg-base disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                            title="Monter (afficher en premier)"
                          >
                            <span className="sr-only">Monter</span>
                            ↑
                          </button>
                          <Text className="font-medium w-6 text-center">{getPositionInList(announcement)}</Text>
                          <button
                            onClick={() => handleMoveDown(announcement)}
                            disabled={isLastInList(announcement) || isLoading}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-ui-bg-base disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
                            title="Descendre (afficher en dernier)"
                          >
                            <span className="sr-only">Descendre</span>
                            ↓
                          </button>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          to={`/cms/announcements/${announcement.id}`}
                          className="font-medium text-ui-fg-base hover:text-ui-fg-interactive transition-colors"
                        >
                          {truncateText(announcement.message)}
                        </Link>
                      </Table.Cell>
                      <Table.Cell>
                        {announcement.link_url ? (
                          <div className="flex flex-col">
                            <Text className="text-ui-fg-subtle text-sm truncate max-w-[130px]">
                              {announcement.link_url}
                            </Text>
                            {announcement.link_text && (
                              <Text className="text-ui-fg-muted text-xs">
                                "{announcement.link_text}"
                              </Text>
                            )}
                          </div>
                        ) : (
                          <Text className="text-ui-fg-muted">-</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-ui-border-base"
                            style={{ backgroundColor: announcement.background_color }}
                            title={`Fond: ${announcement.background_color}`}
                          />
                          <div
                            className="w-6 h-6 rounded border border-ui-border-base"
                            style={{ backgroundColor: announcement.text_color }}
                            title={`Texte: ${announcement.text_color}`}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={statusColors[status]}>{statusLabels[status]}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text className="text-ui-fg-subtle text-sm">
                          {formatDateRange(announcement.start_date, announcement.end_date)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/cms/announcements/${announcement.id}`}>
                            <Button variant="secondary" size="small" disabled={isLoading} title="Voir">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/cms/announcements/${announcement.id}?edit=true`}>
                            <Button variant="secondary" size="small" disabled={isLoading} title="Modifier">
                              <PencilSquare className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleToggleActive(announcement)}
                            disabled={isLoading}
                            title={announcement.is_active ? "Désactiver" : "Activer"}
                          >
                            {announcement.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleDuplicate(announcement)}
                            disabled={isLoading}
                            title="Dupliquer"
                          >
                            <SquareTwoStack className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setDeletingAnnouncement(announcement)}
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

export default CMSAnnouncementsListPage
