/**
 * SearchFilters Component
 * A luxury bottom sheet with filters for search refinement
 * Features price range slider, category selection, material filters, and sort options
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  X,
  Check,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react-native';
import type { Category } from '@bijoux/types';
import { springConfigs, timingConfigs, durations } from '../../constants/animations';
import { hapticFeedback, debouncedHaptic } from '../../constants/haptics';

// Design tokens
const COLORS = {
  background: '#fffcf7',
  backgroundBeige: '#f8f5f0',
  charcoal: '#2b333f',
  hermes: '#f67828',
  hermesLight: '#fff7ed',
  taupe: '#d4c9bd',
  stone: '#b8a99a',
  sand: '#f0ebe3',
  white: '#ffffff',
  muted: '#696969',
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filter Types
export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  materials: string[];
  sortBy: SortOption;
}

export type SortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'name-asc'
  | 'name-desc';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  categories: Category[];
  minPrice?: number;
  maxPrice?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Sort options configuration
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'name-asc', label: 'Nom A-Z' },
  { value: 'name-desc', label: 'Nom Z-A' },
];

// Material options
const MATERIAL_OPTIONS = [
  { id: 'or-jaune', label: 'Or jaune' },
  { id: 'or-blanc', label: 'Or blanc' },
  { id: 'or-rose', label: 'Or rose' },
  { id: 'argent', label: 'Argent' },
  { id: 'platine', label: 'Platine' },
  { id: 'diamant', label: 'Diamant' },
  { id: 'perle', label: 'Perle' },
  { id: 'rubis', label: 'Rubis' },
  { id: 'saphir', label: 'Saphir' },
  { id: 'emeraude', label: 'Émeraude' },
];

// Price range presets
const PRICE_PRESETS = [
  { label: 'Moins de 500', min: 0, max: 500 },
  { label: '500 - 1000', min: 500, max: 1000 },
  { label: '1000 - 2500', min: 1000, max: 2500 },
  { label: '2500 - 5000', min: 2500, max: 5000 },
  { label: 'Plus de 5000', min: 5000, max: 100000 },
];

// Collapsible Section Component
function FilterSection({
  title,
  children,
  defaultExpanded = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 1 : 0);
  const contentHeight = useSharedValue(defaultExpanded ? 1 : 0);

  useEffect(() => {
    rotation.value = withSpring(isExpanded ? 1 : 0, springConfigs.button);
    contentHeight.value = withSpring(isExpanded ? 1 : 0, springConfigs.gentle);
  }, [isExpanded]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    maxHeight: interpolate(contentHeight.value, [0, 1], [0, 500]),
  }));

  const toggleExpanded = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <View style={styles.section}>
      <Pressable style={styles.sectionHeader} onPress={toggleExpanded}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Animated.View style={iconStyle}>
          <ChevronDown size={20} color={COLORS.charcoal} strokeWidth={1.5} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.sectionContent, contentStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

// Chip Component
function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    backgroundColor.value = withSpring(selected ? 1 : 0, springConfigs.button);
  }, [selected]);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, springConfigs.snap);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, springConfigs.button);
  }, []);

  const handlePress = useCallback(() => {
    debouncedHaptic(hapticFeedback.quantityChange);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolate(
      backgroundColor.value,
      [0, 1],
      [0, 1]
    ) === 1 ? COLORS.charcoal : COLORS.white,
    borderColor: interpolate(
      backgroundColor.value,
      [0, 1],
      [0, 1]
    ) === 1 ? COLORS.charcoal : COLORS.taupe,
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[styles.chip, animatedStyle]}
    >
      <Text
        style={[styles.chipText, selected && styles.chipTextSelected]}
      >
        {label}
      </Text>
      {selected && (
        <Animated.View entering={FadeIn.duration(150)} style={styles.chipCheck}>
          <Check size={12} color={COLORS.white} strokeWidth={2.5} />
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

// Radio Option Component
function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const indicatorScale = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    indicatorScale.value = withSpring(selected ? 1 : 0, springConfigs.button);
  }, [selected]);

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.98, springConfigs.snap);
    setTimeout(() => {
      scale.value = withSpring(1, springConfigs.button);
    }, 100);
    debouncedHaptic(hapticFeedback.quantityChange);
    onPress();
  }, [onPress]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: indicatorScale.value }],
    opacity: indicatorScale.value,
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[styles.radioOption, containerStyle]}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        <Animated.View style={[styles.radioInner, indicatorStyle]} />
      </View>
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// Price Range Selector
function PriceRangeSelector({
  selectedRange,
  onRangeSelect,
}: {
  selectedRange: [number, number];
  onRangeSelect: (range: [number, number]) => void;
}) {
  const isPresetSelected = useCallback(
    (preset: typeof PRICE_PRESETS[0]) =>
      selectedRange[0] === preset.min && selectedRange[1] === preset.max,
    [selectedRange]
  );

  return (
    <View style={styles.priceRangeContainer}>
      {PRICE_PRESETS.map((preset) => (
        <FilterChip
          key={preset.label}
          label={`${preset.label} EUR`}
          selected={isPresetSelected(preset)}
          onPress={() => onRangeSelect([preset.min, preset.max])}
        />
      ))}
    </View>
  );
}

export function SearchFilters({
  visible,
  onClose,
  filters,
  onApplyFilters,
  categories,
  minPrice = 0,
  maxPrice = 100000,
}: SearchFiltersProps) {
  // Local filter state
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Reset local state when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localFilters.priceRange[0] !== minPrice || localFilters.priceRange[1] !== maxPrice) {
      count++;
    }
    count += localFilters.categories.length;
    count += localFilters.materials.length;
    if (localFilters.sortBy !== 'relevance') {
      count++;
    }
    return count;
  }, [localFilters, minPrice, maxPrice]);

  // Handlers
  const handleCategoryToggle = useCallback((categoryId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  }, []);

  const handleMaterialToggle = useCallback((materialId: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      materials: prev.materials.includes(materialId)
        ? prev.materials.filter((id) => id !== materialId)
        : [...prev.materials, materialId],
    }));
  }, []);

  const handleSortChange = useCallback((sortOption: SortOption) => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: sortOption,
    }));
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: range,
    }));
  }, []);

  const handleReset = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    setLocalFilters({
      priceRange: [minPrice, maxPrice],
      categories: [],
      materials: [],
      sortBy: 'relevance',
    });
  }, [minPrice, maxPrice]);

  const handleApply = useCallback(() => {
    debouncedHaptic(hapticFeedback.addToCartSuccess);
    onApplyFilters(localFilters);
    onClose();
  }, [localFilters, onApplyFilters, onClose]);

  const handleClose = useCallback(() => {
    debouncedHaptic(hapticFeedback.softConfirm);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.duration(200)}
        style={styles.sheet}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <SlidersHorizontal size={20} color={COLORS.charcoal} strokeWidth={1.5} />
            <Text style={styles.headerTitle}>Filtres</Text>
            {activeFilterCount > 0 && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </Animated.View>
            )}
          </View>
          <Pressable
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Fermer les filtres"
            accessibilityRole="button"
          >
            <X size={24} color={COLORS.charcoal} strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Filters Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Sort Options */}
          <FilterSection title="Trier par">
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => (
                <RadioOption
                  key={option.value}
                  label={option.label}
                  selected={localFilters.sortBy === option.value}
                  onPress={() => handleSortChange(option.value)}
                />
              ))}
            </View>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Prix">
            <PriceRangeSelector
              selectedRange={localFilters.priceRange}
              onRangeSelect={handlePriceRangeChange}
            />
          </FilterSection>

          {/* Categories */}
          {categories.length > 0 && (
            <FilterSection title="Catégories">
              <View style={styles.chipsContainer}>
                {categories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    selected={localFilters.categories.includes(category.id)}
                    onPress={() => handleCategoryToggle(category.id)}
                  />
                ))}
              </View>
            </FilterSection>
          )}

          {/* Materials */}
          <FilterSection title="Matières">
            <View style={styles.chipsContainer}>
              {MATERIAL_OPTIONS.map((material) => (
                <FilterChip
                  key={material.id}
                  label={material.label}
                  selected={localFilters.materials.includes(material.id)}
                  onPress={() => handleMaterialToggle(material.id)}
                />
              ))}
            </View>
          </FilterSection>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Pressable
            style={styles.resetButton}
            onPress={handleReset}
            accessibilityLabel="Réinitialiser les filtres"
            accessibilityRole="button"
          >
            <RotateCcw size={18} color={COLORS.charcoal} strokeWidth={1.5} />
            <Text style={styles.resetButtonText}>Réinitialiser</Text>
          </Pressable>

          <Pressable
            style={styles.applyButton}
            onPress={handleApply}
            accessibilityLabel="Appliquer les filtres"
            accessibilityRole="button"
          >
            <Text style={styles.applyButtonText}>Appliquer</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },

  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.taupe,
    borderRadius: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 20,
    color: COLORS.charcoal,
    marginLeft: 10,
  },

  filterBadge: {
    backgroundColor: COLORS.hermes,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },

  filterBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: COLORS.white,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingVertical: 8,
  },

  section: {
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },

  sectionTitle: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 16,
    color: COLORS.charcoal,
  },

  sectionContent: {
    paddingBottom: 16,
    overflow: 'hidden',
  },

  sortOptions: {
    gap: 4,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.taupe,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  radioOuterSelected: {
    borderColor: COLORS.hermes,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.hermes,
  },

  radioLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.charcoal,
  },

  radioLabelSelected: {
    fontFamily: 'Inter-Medium',
    color: COLORS.charcoal,
  },

  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    borderColor: COLORS.taupe,
  },

  chipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.charcoal,
  },

  chipTextSelected: {
    fontFamily: 'Inter-Medium',
    color: COLORS.white,
  },

  chipCheck: {
    marginLeft: 6,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.sand,
    backgroundColor: COLORS.background,
  },

  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.taupe,
    marginRight: 12,
  },

  resetButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.charcoal,
    marginLeft: 8,
  },

  applyButton: {
    flex: 1,
    backgroundColor: COLORS.hermes,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});

export default SearchFilters;
