/**
 * Dynamic OpenGraph Image Generation
 *
 * Generates branded OG images for social sharing using @vercel/og.
 * Supports products, categories, and brands with customized layouts.
 *
 * Usage:
 * - /api/og?type=product&slug=gold-ring&image=https://...
 * - /api/og?type=category&slug=colliers&name=Colliers
 * - /api/og?type=brand&slug=cartier&name=Cartier
 *
 * @see https://vercel.com/docs/functions/og-image-generation
 * @packageDocumentation
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// ============================================================================
// Configuration
// ============================================================================

export const runtime = 'edge';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';
const SITE_NAME = 'WebexpR Pro';

// Image dimensions (standard OG image size)
const WIDTH = 1200;
const HEIGHT = 630;

// Brand colors
const COLORS = {
  primary: '#0A0A0A', // Dark background
  secondary: '#C9A86C', // Gold accent
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
};

// ============================================================================
// Types
// ============================================================================

type OgType = 'product' | 'category' | 'brand' | 'default';

interface OgParams {
  type: OgType;
  slug: string;
  name?: string;
  image?: string;
  description?: string;
  price?: string;
  brand?: string;
  count?: string;
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse parameters
    const params: OgParams = {
      type: (searchParams.get('type') as OgType) || 'default',
      slug: searchParams.get('slug') || '',
      name: searchParams.get('name') || undefined,
      image: searchParams.get('image') || undefined,
      description: searchParams.get('description') || undefined,
      price: searchParams.get('price') || undefined,
      brand: searchParams.get('brand') || undefined,
      count: searchParams.get('count') || undefined,
    };

    // Generate image based on type
    switch (params.type) {
      case 'product':
        return generateProductImage(params);
      case 'category':
        return generateCategoryImage(params);
      case 'brand':
        return generateBrandImage(params);
      default:
        return generateDefaultImage(params);
    }
  } catch (error) {
    console.error('[OG Image] Error generating image:', error);

    // Return a fallback image on error
    return generateDefaultImage({
      type: 'default',
      slug: '',
      name: SITE_NAME,
    });
  }
}

// ============================================================================
// Image Generators
// ============================================================================

/**
 * Generate OG image for product pages
 */
function generateProductImage(params: OgParams) {
  const { name, image, price, brand, description } = params;
  const displayName = name || 'Produit';
  const displayBrand = brand || SITE_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: COLORS.primary,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Left side - Product image */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={displayName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '16px',
              }}
            />
          ) : (
            <div
              style={{
                width: '400px',
                height: '400px',
                backgroundColor: COLORS.lightGray,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="120"
                height="120"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.gray}
                strokeWidth="1.5"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right side - Product info */}
        <div
          style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 60px 60px 20px',
          }}
        >
          {/* Brand */}
          <div
            style={{
              color: COLORS.secondary,
              fontSize: '24px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '16px',
            }}
          >
            {displayBrand}
          </div>

          {/* Product name */}
          <div
            style={{
              color: COLORS.white,
              fontSize: displayName.length > 40 ? '36px' : '48px',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '24px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayName}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                color: COLORS.gray,
                fontSize: '20px',
                lineHeight: 1.5,
                marginBottom: '24px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </div>
          )}

          {/* Price */}
          {price && (
            <div
              style={{
                color: COLORS.secondary,
                fontSize: '36px',
                fontWeight: 700,
              }}
            >
              {price}
            </div>
          )}

          {/* Site branding */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: COLORS.secondary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              W
            </div>
            <div style={{ color: COLORS.white, fontSize: '18px', fontWeight: 500 }}>
              {SITE_NAME}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

/**
 * Generate OG image for category pages
 */
function generateCategoryImage(params: OgParams) {
  const { name, image, count, description } = params;
  const displayName = name || 'Collection';
  const productCount = count ? parseInt(count, 10) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: COLORS.primary,
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background image with overlay */}
        {image && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
            }}
          >
            <img
              src={image}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.3,
              }}
            />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            textAlign: 'center',
          }}
        >
          {/* Category label */}
          <div
            style={{
              color: COLORS.secondary,
              fontSize: '20px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '4px',
              marginBottom: '24px',
            }}
          >
            Collection
          </div>

          {/* Category name */}
          <div
            style={{
              color: COLORS.white,
              fontSize: displayName.length > 20 ? '64px' : '80px',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            {displayName}
          </div>

          {/* Description or product count */}
          {description ? (
            <div
              style={{
                color: COLORS.gray,
                fontSize: '24px',
                maxWidth: '800px',
                lineHeight: 1.5,
              }}
            >
              {description}
            </div>
          ) : productCount !== undefined ? (
            <div
              style={{
                color: COLORS.gray,
                fontSize: '24px',
              }}
            >
              {productCount} produits disponibles
            </div>
          ) : null}

          {/* Site branding */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: COLORS.secondary,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '18px',
              }}
            >
              W
            </div>
            <div style={{ color: COLORS.white, fontSize: '16px', fontWeight: 500 }}>
              {SITE_NAME}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

/**
 * Generate OG image for brand pages
 */
function generateBrandImage(params: OgParams) {
  const { name, image, count, description } = params;
  const displayName = name || 'Marque';
  const productCount = count ? parseInt(count, 10) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: COLORS.white,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Left side - Brand info */}
        <div
          style={{
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px',
            backgroundColor: COLORS.primary,
          }}
        >
          {/* Brand label */}
          <div
            style={{
              color: COLORS.secondary,
              fontSize: '18px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '20px',
            }}
          >
            Marque Partenaire
          </div>

          {/* Brand name */}
          <div
            style={{
              color: COLORS.white,
              fontSize: displayName.length > 15 ? '56px' : '72px',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            {displayName}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                color: COLORS.gray,
                fontSize: '22px',
                lineHeight: 1.5,
                marginBottom: '24px',
                maxWidth: '500px',
              }}
            >
              {description}
            </div>
          )}

          {/* Product count */}
          {productCount !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: COLORS.secondary,
                fontSize: '20px',
                fontWeight: 500,
              }}
            >
              <span>{productCount}</span>
              <span style={{ color: COLORS.gray }}>produits disponibles</span>
            </div>
          )}

          {/* Site branding */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: COLORS.secondary,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '20px',
              }}
            >
              W
            </div>
            <div style={{ color: COLORS.white, fontSize: '18px', fontWeight: 500 }}>
              {SITE_NAME}
            </div>
          </div>
        </div>

        {/* Right side - Logo/Image */}
        <div
          style={{
            width: '40%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.lightGray,
            padding: '60px',
          }}
        >
          {image ? (
            <img
              src={image}
              alt={displayName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div
              style={{
                width: '200px',
                height: '200px',
                backgroundColor: COLORS.white,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                fontWeight: 700,
                color: COLORS.primary,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}

/**
 * Generate default OG image (fallback)
 */
function generateDefaultImage(params: OgParams) {
  const { name } = params;
  const displayName = name || SITE_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.primary,
          fontFamily: 'Inter, sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
            backgroundColor: COLORS.secondary,
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              color: COLORS.primary,
              fontSize: '60px',
              fontWeight: 700,
            }}
          >
            W
          </span>
        </div>

        {/* Site name */}
        <div
          style={{
            color: COLORS.white,
            fontSize: '56px',
            fontWeight: 700,
            marginBottom: '16px',
          }}
        >
          {displayName}
        </div>

        {/* Tagline */}
        <div
          style={{
            color: COLORS.secondary,
            fontSize: '28px',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '4px',
          }}
        >
          Grossiste Bijoux B2B
        </div>

        {/* Description */}
        <div
          style={{
            color: COLORS.gray,
            fontSize: '22px',
            marginTop: '32px',
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.5,
          }}
        >
          Plateforme professionnelle pour grossistes en bijoux de luxe
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}
