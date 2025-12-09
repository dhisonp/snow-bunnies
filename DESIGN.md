# Design System

## Philosophy

The design of Snow Bunnies follows a **Brutalist** / **Old School Internet** aesthetic. It prioritizes function, high contrast, and structural clarity over modern softness. The interface is characterized by sharp edges, thick borders, and hard shadows.

## Design Tokens

### Radius

- **Default**: `0rem` (Sharp corners everywhere)

### Colors

#### Light Mode

- **Background**: `#f2f2f2` (Muted White) - _Provides separation from content cards._
- **Foreground**: `#000000` (Stark Black)
- **Card Background**: `#ffffff` (Stark White)
- **Border**: `#000000` (High Contrast)
- **Primary**: `#000000`
- **Primary Foreground**: `#ffffff`

#### Dark Mode

- **Background**: `#000000` (Stark Black)
- **Foreground**: `#ffffff` (Stark White)
- **Card Background**: `#000000`
- **Border**: `#ffffff` (High Contrast)
- **Primary**: `#ffffff`
- **Primary Foreground**: `#000000`

#### Crowd Levels

- **Level 1 (Low)**: `#22c55e`
- **Level 2**: `#84cc16`
- **Level 3**: `#eab308`
- **Level 4**: `#f97316`
- **Level 5 (High)**: `#ef4444`

### Shadows

Shadows are "hard" implies no blur radius, creating a distinct second layer look.

- **Card Shadow**: `4px 4px 0px 0px var(--foreground)`
- **Button Shadow**: `2px 2px 0px 0px var(--foreground)`
- **Dialog Shadow**: `8px 8px 0px 0px var(--foreground)`

## Components

### General Rules

1.  **No Rounded Corners**: All components (`Card`, `Button`, `Input`, `Dialog`, etc.) must have `rounded-none`.
2.  **Thick Borders**: Use `border-2` to define component boundaries clearly.
3.  **Compact Spacing**: Padding and gaps are reduced to maintain a dense, information-rich layout.

### Specific Component Styles

- **Buttons**:

  - `border-2`
  - Hard shadow (`2px 2px`)
  - Active state: `translate-x/y-[2px]` and remove shadow to simulate "pressing" a physical button.

- **Inputs / Selects**:

  - `h-8` (Compact height)
  - `border-2`
  - Hard shadow (`2px 2px`) on focus or default state depending on prominence.

- **Cards**:

  - `border-2`
  - Hard shadow (`4px 4px`)
  - White background on muted page background for "pop".

- **Dialogs / Overlays**:
  - Thickest borders and largest hard shadows (`8px 8px`) to indicate highest elevation.
