/**
 * Category Customization Widget
 *
 * Allows editing image and icon (picto) for product categories.
 * Displayed in the category details sidebar in admin.
 */

import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Button, Label, toast, Toaster } from "@medusajs/ui";
import { Image, Tag, Check, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { IconPicker } from "../components/icon-picker";
import { ImageUpload } from "../components/image-upload";
import { type CategoryPicto, getCategoryIcon } from "../lib/category-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = any;

// Type workaround for React 18/19 compatibility with Medusa UI
const MContainer: AnyComponent = Container;
const MHeading: AnyComponent = Heading;
const MText: AnyComponent = Text;
const MButton: AnyComponent = Button;
const MLabel: AnyComponent = Label;

interface CategoryMetadata {
  image_url?: string;
  icon?: string;
  name_en?: string;
  [key: string]: unknown;
}

interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description?: string | null;
  metadata?: CategoryMetadata | null;
}

interface CategoryCustomizationWidgetProps {
  data: ProductCategory;
}

const CategoryCustomizationWidget = ({ data }: CategoryCustomizationWidgetProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    data.metadata?.image_url
  );
  const [icon, setIcon] = useState<CategoryPicto | undefined>(
    data.metadata?.icon as CategoryPicto | undefined
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track changes
  useEffect(() => {
    const originalImage = data.metadata?.image_url;
    const originalIcon = data.metadata?.icon as CategoryPicto | undefined;

    setHasChanges(imageUrl !== originalImage || icon !== originalIcon);
  }, [imageUrl, icon, data.metadata]);

  // Reset state when data changes (e.g., navigating to different category)
  useEffect(() => {
    setImageUrl(data.metadata?.image_url);
    setIcon(data.metadata?.icon as CategoryPicto | undefined);
  }, [data.id, data.metadata]);

  const handleSave = async () => {
    setSaving(true);

    try {
      // Build updated metadata, preserving existing fields
      const updatedMetadata: CategoryMetadata = {
        ...(data.metadata || {}),
      };

      // Update or remove image_url
      if (imageUrl) {
        updatedMetadata.image_url = imageUrl;
      } else {
        delete updatedMetadata.image_url;
      }

      // Update or remove icon
      if (icon) {
        updatedMetadata.icon = icon;
      } else {
        delete updatedMetadata.icon;
      }

      const response = await fetch(`/admin/product-categories/${data.id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: updatedMetadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Échec de la mise à jour");
      }

      toast.success("Personnalisation enregistrée");
      setHasChanges(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'enregistrement"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setImageUrl(data.metadata?.image_url);
    setIcon(data.metadata?.icon as CategoryPicto | undefined);
  };

  const currentIcon = getCategoryIcon(icon);
  const CurrentIconComponent = currentIcon.Icon;

  return (
    <MContainer className="p-0">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-ui-bg-subtle rounded-lg">
            <CurrentIconComponent className="w-5 h-5 text-ui-fg-muted" />
          </div>
          <div>
            <MHeading level="h2">Personnalisation</MHeading>
            <MText className="text-ui-fg-subtle text-sm">
              Image et icône de la catégorie
            </MText>
          </div>
        </div>

        {hasChanges && (
          <div className="flex gap-2">
            <MButton
              variant="secondary"
              size="small"
              onClick={handleReset}
              disabled={saving}
            >
              Annuler
            </MButton>
            <MButton
              variant="primary"
              size="small"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-1" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Enregistrer
                </>
              )}
            </MButton>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-6">
        {/* Image Upload Section */}
        <div>
          <MLabel className="mb-2 block">
            <div className="flex items-center gap-2 mb-2">
              <Image className="w-4 h-4" />
              <span>Image de la catégorie</span>
            </div>
          </MLabel>
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            disabled={saving}
            aspectRatio="video"
          />
          <MText className="text-ui-fg-muted text-sm mt-2">
            Cette image sera affichée sur la page catégorie du storefront
          </MText>
        </div>

        {/* Icon Picker Section */}
        <div>
          <MLabel className="mb-2 block">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4" />
              <span>Icône de la catégorie</span>
            </div>
          </MLabel>
          <IconPicker
            value={icon}
            onChange={setIcon}
            disabled={saving}
            placeholder="Sélectionner une icône"
          />
          <MText className="text-ui-fg-muted text-sm mt-2">
            L'icône sera utilisée dans les menus et la navigation
          </MText>
        </div>

        {/* Preview Section */}
        {(imageUrl || icon) && (
          <div className="border-t border-ui-border-base pt-4">
            <MText className="text-ui-fg-muted text-xs uppercase tracking-wider mb-3">
              Aperçu
            </MText>
            <div className="bg-ui-bg-subtle rounded-lg p-4">
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-ui-bg-base">
                    <img
                      src={imageUrl}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-ui-bg-base flex items-center justify-center">
                    <CurrentIconComponent className="w-6 h-6 text-ui-fg-muted" />
                  </div>
                )}
                <div>
                  <MText className="font-medium">{data.name}</MText>
                  <MText className="text-ui-fg-subtle text-sm">
                    {currentIcon.label}
                  </MText>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MContainer>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.before",
});

export default CategoryCustomizationWidget;
