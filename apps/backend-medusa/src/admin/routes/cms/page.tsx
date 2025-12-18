import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  Text,
  Badge,
  Toaster,
} from "@medusajs/ui"
import { Photo, Newspaper, ChevronRight, ArrowPath } from "@medusajs/icons"
import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"

// Types
interface ContentStats {
  heroSlides: {
    total: number
    published: number
    draft: number
  }
  announcements: {
    total: number
    active: number
    inactive: number
  }
}

interface HeroSlidesResponse {
  slides: Array<{ id: string; is_published: boolean }>
  count: number
}

interface AnnouncementsResponse {
  announcements: Array<{ id: string; is_active: boolean }>
  count: number
}

/**
 * CMS Dashboard - Page principale de gestion du contenu
 * Affiche une grille de cards pour accéder aux différentes typologies de contenu
 */
const CMSDashboardPage = () => {
  const [stats, setStats] = useState<ContentStats>({
    heroSlides: { total: 0, published: 0, draft: 0 },
    announcements: { total: 0, active: 0, inactive: 0 },
  })
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch hero slides and announcements in parallel
      const [slidesRes, announcementsRes] = await Promise.all([
        fetch("/admin/cms/hero-slides?limit=100", { credentials: "include" }),
        fetch("/admin/cms/announcements?limit=100", { credentials: "include" }),
      ])

      const slidesData = slidesRes.ok
        ? ((await slidesRes.json()) as HeroSlidesResponse)
        : { slides: [], count: 0 }

      const announcementsData = announcementsRes.ok
        ? ((await announcementsRes.json()) as AnnouncementsResponse)
        : { announcements: [], count: 0 }

      const slides = slidesData.slides || []
      const announcements = announcementsData.announcements || []

      setStats({
        heroSlides: {
          total: slidesData.count || slides.length,
          published: slides.filter((s) => s.is_published).length,
          draft: slides.filter((s) => !s.is_published).length,
        },
        announcements: {
          total: announcementsData.count || announcements.length,
          active: announcements.filter((a) => a.is_active).length,
          inactive: announcements.filter((a) => !a.is_active).length,
        },
      })
    } catch (error) {
      console.error("Failed to fetch CMS stats:", error)
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
          Gestion du Contenu (CMS)
        </Heading>
        <Text className="text-ui-fg-subtle mt-2">
          Gérez le contenu dynamique de votre site e-commerce : carousel d'accueil, bannières d'annonces et plus encore.
        </Text>
      </div>

      {/* Content Cards Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Slides Card */}
          <Link
            to="/cms/hero-slides"
            className="group relative rounded-xl border border-ui-border-base bg-ui-bg-base p-6 hover:border-ui-border-interactive hover:shadow-elevation-card-hover transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Heading level="h2" className="text-lg font-semibold">
                    Hero Slides
                  </Heading>
                  {loading ? (
                    <ArrowPath className="h-4 w-4 animate-spin text-ui-fg-muted" />
                  ) : (
                    <Badge color="grey" size="small">
                      {stats.heroSlides.total}
                    </Badge>
                  )}
                </div>
                <Text className="text-ui-fg-subtle mt-1">
                  Gérez le carousel d'images de la page d'accueil
                </Text>

                {/* Stats */}
                {!loading && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-tag-green-icon" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.heroSlides.published} publiée{stats.heroSlides.published > 1 ? "s" : ""}
                      </Text>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-fg-muted" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.heroSlides.draft} brouillon{stats.heroSlides.draft > 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-ui-fg-muted group-hover:text-ui-fg-base group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>

          {/* Announcements Card */}
          <Link
            to="/cms/announcements"
            className="group relative rounded-xl border border-ui-border-base bg-ui-bg-base p-6 hover:border-ui-border-interactive hover:shadow-elevation-card-hover transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Heading level="h2" className="text-lg font-semibold">
                    Annonces
                  </Heading>
                  {loading ? (
                    <ArrowPath className="h-4 w-4 animate-spin text-ui-fg-muted" />
                  ) : (
                    <Badge color="grey" size="small">
                      {stats.announcements.total}
                    </Badge>
                  )}
                </div>
                <Text className="text-ui-fg-subtle mt-1">
                  Gérez les bannières d'annonces promotionnelles
                </Text>

                {/* Stats */}
                {!loading && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-tag-green-icon" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.announcements.active} active{stats.announcements.active > 1 ? "s" : ""}
                      </Text>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-ui-fg-muted" />
                      <Text className="text-sm text-ui-fg-subtle">
                        {stats.announcements.inactive} inactive{stats.announcements.inactive > 1 ? "s" : ""}
                      </Text>
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-ui-fg-muted group-hover:text-ui-fg-base group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="px-6 py-6">
        <Heading level="h2" className="text-lg font-semibold mb-4">
          Actions rapides
        </Heading>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/cms/hero-slides/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover hover:border-ui-border-strong transition-all text-sm font-medium"
          >
            <Photo className="h-4 w-4" />
            Nouvelle slide
          </Link>
          <Link
            to="/cms/announcements/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-base-hover hover:border-ui-border-strong transition-all text-sm font-medium"
          >
            <Newspaper className="h-4 w-4" />
            Nouvelle annonce
          </Link>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "CMS",
  icon: Newspaper,
})

export default CMSDashboardPage
