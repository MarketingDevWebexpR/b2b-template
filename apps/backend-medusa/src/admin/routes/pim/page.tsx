import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Toaster,
} from "@medusajs/ui"
import { Tag, ChevronRight, ArrowPath, SquaresPlus } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"

// Types
interface PIMStats {
  marques: {
    total: number
    active: number
    inactive: number
  }
  // Future: attributs, specifications, categories, etc.
}

interface MarquesResponse {
  marques: Array<{ id: string; is_active: boolean }>
  count: number
}

/**
 * PIM Dashboard - Page principale de gestion des referentiels produits
 * Affiche une grille de cards pour acceder aux differentes typologies de donnees produit
 *
 * Sections planifiees:
 * - Marques (Brands) - Implemente
 * - Attributs produits (Future)
 * - Specifications techniques (Future)
 * - Categories personnalisees (Future)
 * - Materiaux et compositions (Future)
 */
const PIMDashboardPage = () => {
  const [stats, setStats] = useState<PIMStats>({
    marques: { total: 0, active: 0, inactive: 0 },
    // Future sections stats will be added here
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch marques stats
      // Future: Add parallel fetches for other PIM sections (attributs, specs, etc.)
      const [marquesRes] = await Promise.all([
        fetch("/admin/marques?take=100", { credentials: "include" }),
        // Future API calls:
        // fetch("/admin/pim/attributs?take=100", { credentials: "include" }),
        // fetch("/admin/pim/specifications?take=100", { credentials: "include" }),
      ])

      const marquesData = marquesRes.ok
        ? ((await marquesRes.json()) as MarquesResponse)
        : { marques: [], count: 0 }

      const marques = marquesData.marques || []

      setStats({
        marques: {
          total: marquesData.count || marques.length,
          active: marques.filter((m) => m.is_active).length,
          inactive: marques.filter((m) => !m.is_active).length,
        },
        // Future sections stats
      })
    } catch (error) {
      console.error("Failed to fetch PIM stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <Container className="divide-y p-0">
      <Toaster />

      {/* Header */}
      <div className="px-6 py-6">
        <Heading level="h1" className="text-2xl font-semibold">
          Gestion des Referentiels Produits (PIM)
        </Heading>
        <Text className="text-ui-fg-subtle mt-2">
          Gerez les donnees de reference de vos produits : marques, attributs, specifications et plus encore.
        </Text>
      </div>

      {/* Content Cards Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Marques Card */}
          <Link
            to="/pim/marques"
            className="group relative rounded-xl border border-ui-border-base bg-ui-bg-base p-6 hover:border-ui-border-interactive hover:shadow-elevation-card-hover transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ui-bg-subtle">
                    <Tag className="h-5 w-5 text-ui-fg-subtle" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Heading level="h2" className="text-lg font-semibold">
                      Marques
                    </Heading>
                    {loading ? (
                      <ArrowPath className="h-4 w-4 animate-spin text-ui-fg-muted" />
                    ) : (
                      <Badge color="grey" size="small">
                        {stats.marques.total}
                      </Badge>
                    )}
                  </div>
                </div>
                <Text className="text-ui-fg-subtle mt-1">
                  Gerez les marques et fabricants de vos produits
                </Text>

                {/* Stats */}
                {!loading && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-tag-green-icon" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.marques.active} active{stats.marques.active > 1 ? "s" : ""}
                      </Text>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-fg-muted" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.marques.inactive} inactive{stats.marques.inactive > 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-ui-fg-muted group-hover:text-ui-fg-base group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          {/*
           * Future PIM Section Cards - Uncomment and implement as needed
           *
           * Attributs Produits Card
           * <Link to="/pim/attributs" className="...">
           *   <Heading>Attributs</Heading>
           *   <Text>Definissez les attributs personnalises de vos produits</Text>
           * </Link>
           *
           * Specifications Card
           * <Link to="/pim/specifications" className="...">
           *   <Heading>Specifications</Heading>
           *   <Text>Gerez les specifications techniques detaillees</Text>
           * </Link>
           *
           * Materiaux Card
           * <Link to="/pim/materiaux" className="...">
           *   <Heading>Materiaux</Heading>
           *   <Text>Cataloguez les materiaux et compositions</Text>
           * </Link>
           */}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="px-6 py-6">
        <Heading level="h2" className="text-lg font-semibold mb-4">
          Actions rapides
        </Heading>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/pim/marques/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover hover:border-ui-border-strong transition-all text-sm font-medium"
          >
            <Tag className="h-4 w-4" />
            Nouvelle marque
          </Link>
          {/*
           * Future Quick Actions - Uncomment as sections are implemented
           *
           * <Link to="/pim/attributs/create" className="...">
           *   <ListBullet className="h-4 w-4" />
           *   Nouvel attribut
           * </Link>
           *
           * <Link to="/pim/specifications/create" className="...">
           *   <DocumentText className="h-4 w-4" />
           *   Nouvelle specification
           * </Link>
           */}
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "PIM",
  icon: SquaresPlus,
})

export default PIMDashboardPage
