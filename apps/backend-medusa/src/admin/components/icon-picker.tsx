/**
 * Icon Picker Component
 *
 * A popover-based icon selector with grid layout grouped by category.
 * Used for selecting category pictos/icons in the admin.
 */

import { useState } from "react";
import { Button, Popover, Text } from "@medusajs/ui";
import { ChevronDown } from "lucide-react";
import {
  type CategoryPicto,
  getCategoryIcon,
  getIconsByCategory,
  CATEGORY_GROUP_LABELS,
} from "../lib/category-icons";

// Type workaround for React 18/19 compatibility
type AnyComponent = any;
const MButton: AnyComponent = Button;
const MText: AnyComponent = Text;

interface IconPickerProps {
  value: CategoryPicto | string | undefined;
  onChange: (icon: CategoryPicto) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function IconPicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Sélectionner une icône",
}: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const currentIcon = getCategoryIcon(value);
  const CurrentIconComponent = currentIcon.Icon;
  const iconGroups = getIconsByCategory();

  const handleSelect = (key: CategoryPicto) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <MButton
          variant="secondary"
          disabled={disabled}
          className="w-full justify-between"
          type="button"
        >
          <div className="flex items-center gap-2">
            {value ? (
              <>
                <CurrentIconComponent className="w-5 h-5" />
                <span>{currentIcon.label}</span>
              </>
            ) : (
              <span className="text-ui-fg-muted">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-ui-fg-muted" />
        </MButton>
      </Popover.Trigger>

      <Popover.Content className="w-96 p-0 max-h-[400px] overflow-y-auto" align="start">
        <div className="p-3 border-b border-ui-border-base sticky top-0 bg-ui-bg-base z-10">
          <MText className="text-sm font-medium">Choisir une icône</MText>
        </div>

        <div className="p-3 space-y-4">
          {Object.entries(iconGroups).map(([groupKey, icons]) => {
            if (icons.length === 0) return null;

            return (
              <div key={groupKey}>
                <MText className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-2 block">
                  {CATEGORY_GROUP_LABELS[groupKey]}
                </MText>
                <div className="grid grid-cols-4 gap-2">
                  {icons.map(({ key, def }) => {
                    const IconComponent = def.Icon;
                    const isSelected = value === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelect(key)}
                        className={`
                          flex flex-col items-center gap-1 p-3 rounded-lg border transition-all
                          ${
                            isSelected
                              ? "border-ui-border-interactive bg-ui-bg-interactive text-ui-fg-on-color"
                              : "border-ui-border-base hover:border-ui-border-strong hover:bg-ui-bg-subtle"
                          }
                        `}
                        title={def.label}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${isSelected ? "text-ui-fg-on-color" : ""}`}
                        />
                        <MText
                          className={`text-xs truncate w-full text-center ${
                            isSelected ? "text-ui-fg-on-color" : ""
                          }`}
                        >
                          {def.label}
                        </MText>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {value && (
          <div className="p-3 border-t border-ui-border-base">
            <MButton
              variant="secondary"
              size="small"
              className="w-full"
              onClick={() => {
                onChange("package" as CategoryPicto);
                setOpen(false);
              }}
            >
              Réinitialiser
            </MButton>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}

export default IconPicker;
