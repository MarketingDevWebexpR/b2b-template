# Luxury Welcome Toast - Design Specification

**Component:** `LuxuryWelcomeToast`
**Version:** 1.0.0
**Designer:** UI Design System
**Platform:** React Native / Expo

---

## Overview

A sophisticated welcome notification for the Maison Bijoux luxury jewelry application. This toast appears when a user successfully logs in, providing an elegant, on-brand greeting experience that reinforces the premium nature of the brand.

---

## 1. Layout & Positioning

### Dimensions
| Property | Value | Notes |
|----------|-------|-------|
| Width | `100% - 40px` | 20px margin on each side |
| Max Width | `400px` | Prevents over-stretching on tablets |
| Min Height | `72px` | Accommodates content with breathing room |
| Border Radius | `16px` | Matches `RADIUS.lg` from design tokens |

### Positioning
| Property | Value | Notes |
|----------|-------|-------|
| Position | `absolute` | Fixed at top of screen |
| Top | `SafeArea.top + 12px` | Respects notch/status bar |
| Horizontal | `centered` | Centered with `alignItems: 'center'` |
| Z-Index | `500` | Toast level per design system |

### Internal Spacing
| Element | Padding | Notes |
|---------|---------|-------|
| Container | `16px vertical, 16px horizontal` | Standard card padding |
| Accent Bar Offset | `+4px left padding` | Space between bar and content |
| Greeting Row | `4px bottom margin` | Tight spacing to tagline |

---

## 2. Colors & Visual Design

### Color Palette
```
Background:     #fffcf7 (Cream) - with 95% glass effect on iOS
Border:         rgba(212, 201, 189, 0.4) - Taupe at 40% opacity
Text Primary:   #2b333f (Charcoal)
Text Secondary: #b8a99a (Stone)
Accent:         #f67828 (Hermes Orange)
Progress Bar:   #f67828 at 70% opacity
```

### Visual Hierarchy
```
┌─────────────────────────────────────────────────┐
│█ Bienvenue, Marie Dupont              ✨        │
│  Votre experience joailliere vous attend        │
│▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────────────┘
 │                                        │
 └─ 3px Accent Bar (Hermes)      Progress Bar ─┘
```

### Shadow Specification
```css
shadowColor: '#2b333f'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.12
shadowRadius: 16
elevation: 8 (Android)
```

---

## 3. Typography

### Greeting Text
| Property | Value | Token |
|----------|-------|-------|
| Font Family | PlayfairDisplay-Medium | `FONTS.displayMedium` |
| Font Size | 18px | Custom |
| Color | #2b333f | `COLORS.charcoal` |
| Letter Spacing | 0.2 | Custom |

### User Name
| Property | Value | Token |
|----------|-------|-------|
| Font Family | PlayfairDisplay-SemiBold | `FONTS.displaySemiBold` |
| Font Size | 18px | Custom |
| Color | #f67828 | `COLORS.hermes` |
| Letter Spacing | 0.3 | Custom |

### Tagline
| Property | Value | Token |
|----------|-------|-------|
| Font Family | Inter-Regular | `FONTS.body` |
| Font Size | 14px | `FONT_SIZES.small` |
| Color | #b8a99a | `COLORS.stone` |
| Letter Spacing | 0.3 | Custom |

---

## 4. Animation Specification

### Entry Animation
```
Timing:     500ms
Easing:     cubic-bezier(0.16, 1, 0.3, 1) - Luxury ease-out

Properties animated:
├── translateY: -120px → 0px
├── opacity: 0 → 1 (over 300ms)
└── scale: 0.96 → 1 (spring: damping=20, stiffness=150)
```

### Shimmer Effect
```
Trigger:    200ms after entry starts
Duration:   1200ms
Movement:   -100% → 200% horizontal translate
Opacity:    0 → 0.6 → 0.6 → 0
Style:      Skewed 20° white band (40% opacity)
```

### Accent Bar Glow
```
Trigger:    300ms after entry
Animation:
├── Phase 1: opacity 0 → 1, shadowRadius 4 → 12 (400ms ease-out)
└── Phase 2: opacity 1 → 0.3, shadowRadius 12 → 4 (600ms ease-in-out)
```

### Progress Bar
```
Duration:   Matches autoDismissMs (default 3000ms)
Animation:  width 0% → 100% (linear)
Purpose:    Visual indicator of auto-dismiss countdown
```

### Exit Animation
```
Timing:     300ms
Easing:     cubic-bezier(0.4, 0, 1, 1) - Accelerate

Properties animated:
├── translateY: 0px → -30px (slight lift)
├── opacity: 1 → 0
└── scale: 1 → 0.98
```

---

## 5. Decorative Elements

### Left Accent Bar
| Property | Value |
|----------|-------|
| Width | 3px |
| Height | Container height - 24px (12px top/bottom) |
| Color | #f67828 (Hermes) |
| Border Radius | 2px (right side only) |
| Glow | Animated orange shadow |

### Sparkle Icon
| Property | Value |
|----------|-------|
| Icon | Sparkles from lucide-react-native |
| Size | 20px |
| Color | #f67828 (Hermes) |
| Stroke Width | 1.5 |
| Opacity | 0.9 |
| Position | Right side of greeting row |

### Glass Effect (iOS)
| Property | Value |
|----------|-------|
| Blur Intensity | 60 |
| Tint | light |
| Background Overlay | rgba(255, 252, 247, 0.95) |

---

## 6. Interaction Behavior

### Auto-Dismiss
- Default duration: 3000ms (3.5s recommended for luxury feel)
- Progress bar provides visual countdown
- Can be configured via `autoDismissMs` prop

### Manual Dismiss
- Tap anywhere on toast to dismiss immediately
- Exit animation plays before `onDismiss` callback

### Haptic Feedback
| Event | Pattern |
|-------|---------|
| Entry | `premiumElegantConfirm` - Signature luxury double-tap |
| Dismiss | `feedbackToast` - Soft confirmation |

---

## 7. Accessibility

### ARIA Properties
```jsx
accessibilityRole="alert"
accessibilityLiveRegion="polite"
accessibilityLabel={`Bienvenue ${userName}. ${tagline}. Appuyez pour fermer.`}
accessibilityHint="Touchez pour fermer la notification"
```

### Motion Sensitivity
- Animations respect system reduce motion settings
- Graceful fallback to instant show/hide without animation

### Touch Target
- Entire toast is tappable (minimum 72px height)
- Exceeds 44px minimum touch target requirement

---

## 8. Usage Example

```tsx
import { useToast } from '@/context/ToastContext';

function LoginScreen() {
  const { showWelcomeToast } = useToast();

  const handleLoginSuccess = (user: User) => {
    // Navigate to home
    router.replace('/(tabs)');

    // Show welcome toast after navigation
    setTimeout(() => {
      showWelcomeToast({
        userName: user.name,
        tagline: 'Votre experience joailliere vous attend',
        autoDismissMs: 3500,
      });
    }, 500);
  };
}
```

---

## 9. Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | boolean | - | Controls visibility |
| `userName` | string | - | User's display name |
| `onDismiss` | () => void | - | Called when dismissed |
| `autoDismissMs` | number | 3000 | Auto-dismiss duration |
| `tagline` | string | "Votre experience..." | Secondary message |
| `testID` | string | "luxury-welcome-toast" | For testing |

---

## 10. Design Rationale

### Why These Choices?

**Slide-in from Top:** Follows platform conventions for notifications. Users naturally expect alerts at the top of the screen.

**French Greeting:** Reinforces the French luxury heritage of the Maison Bijoux brand. "Bienvenue" feels more personal and elegant than "Welcome."

**Hermes Orange Accent:** The signature brand color draws attention without overwhelming. The accent bar creates visual interest while the user name in orange feels personalized.

**Subtle Shimmer:** Evokes the sparkle of jewelry. This micro-delight reinforces the premium positioning without being distracting.

**Progress Bar:** Provides users with a sense of control and timing. They know when the toast will disappear, reducing cognitive load.

**Glass Effect:** Modern iOS aesthetic that suggests quality and attention to detail. Falls back gracefully on Android.

**PlayfairDisplay Font:** Elegant serif typography that matches the luxury jewelry context. Contrasts with Inter body text for hierarchy.

---

## 11. Files Created

```
apps/mobile/
├── components/toast/
│   ├── LuxuryWelcomeToast.tsx    # Main component
│   ├── ToastContainer.tsx         # Root-level renderer
│   └── index.ts                   # Exports
├── context/
│   └── ToastContext.tsx           # State management
└── docs/
    └── DESIGN_SPEC_WELCOME_TOAST.md  # This document
```

---

## 12. Future Enhancements

1. **Variants:** Success, error, and info toast variants with consistent styling
2. **Queue System:** Handle multiple toasts with stacking/queuing
3. **Swipe to Dismiss:** Gesture-based dismissal
4. **Rich Content:** Support for images/thumbnails in toasts
5. **Action Buttons:** Optional CTA buttons within toast
