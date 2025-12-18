import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, Button } from "@medusajs/ui"
import { Tag, ArrowUpRightOnBox, PencilSquare } from "@medusajs/icons"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any

// Type workaround for React 18/19 compatibility with Medusa UI
const MContainer: AnyComponent = Container
const MHeading: AnyComponent = Heading
const MText: AnyComponent = Text
const MBadge: AnyComponent = Badge
const MButton: AnyComponent = Button
const MLink: AnyComponent = Link
const MTag: AnyComponent = Tag
const MArrowUpRightOnBox: AnyComponent = ArrowUpRightOnBox
const MPencilSquare: AnyComponent = PencilSquare

interface Marque {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  country?: string | null
  website_url?: string | null
  is_active: boolean
}

interface ProductMarqueResponse {
  marque: Marque | null
}

const ProductBrandWidget = ({ data }: { data: { id: string } }) => {
  const productId = data.id
  const [marque, setMarque] = useState<Marque | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarque = async () => {
      try {
        // Fetch product with marque link
        const response = await fetch(`/admin/products/${productId}?fields=marque.*`, {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setMarque(data.product?.marque || null)
        }
      } catch (error) {
        console.error("Failed to fetch product brand:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMarque()
  }, [productId])

  if (loading) {
    return (
      <MContainer className="p-4">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-neutral-200 rounded" />
            <div className="h-3 w-16 bg-neutral-200 rounded" />
          </div>
        </div>
      </MContainer>
    )
  }

  if (!marque) {
    return (
      <MContainer className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-lg">
              <MTag className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <MText className="text-sm text-neutral-500">Aucune marque associée</MText>
            </div>
          </div>
          <MLink to="/pim/marques">
            <MButton variant="secondary" size="small">
              Gérer les marques
            </MButton>
          </MLink>
        </div>
      </MContainer>
    )
  }

  // Generate initials for fallback
  const getInitials = (name: string): string => {
    const words = name.trim().split(/\s+/)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <MContainer className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo or Initials */}
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg overflow-hidden">
            {marque.logo_url ? (
              <img
                src={marque.logo_url}
                alt={marque.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-blue-700">
                {getInitials(marque.name)}
              </span>
            )}
          </div>

          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2">
              <MHeading level="h3" className="text-base font-semibold">
                {marque.name}
              </MHeading>
              <MBadge color={marque.is_active ? "green" : "grey"} size="small">
                {marque.is_active ? "Actif" : "Inactif"}
              </MBadge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {marque.country && (
                <MText className="text-sm text-neutral-500">{marque.country}</MText>
              )}
              {marque.website_url && (
                <a
                  href={marque.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <MArrowUpRightOnBox className="w-3 h-3" />
                  Site web
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <MLink to={`/pim/marques/${marque.id}`}>
          <MButton variant="secondary" size="small">
            <MPencilSquare className="w-4 h-4 mr-1" />
            Voir la marque
          </MButton>
        </MLink>
      </div>
    </MContainer>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.side.before",
})

export default ProductBrandWidget
