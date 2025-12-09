# ESLint & Prettier Setup

This document describes the ESLint and Prettier configuration for this Next.js project.

## Installed Packages

### Development Dependencies

- `prettier` - Code formatter
- `eslint-config-prettier` - Disables ESLint rules that conflict with Prettier
- `eslint-plugin-prettier` - Runs Prettier as an ESLint rule
- `@typescript-eslint/eslint-plugin` - TypeScript-specific linting rules
- `@typescript-eslint/parser` - Allows ESLint to parse TypeScript

## Configuration Files

### `.prettierrc.json`

Prettier configuration with modern defaults:

- 2-space indentation
- Semicolons enabled
- Double quotes
- 80 character line width
- ES5 trailing commas

### `eslint.config.mjs`

ESLint flat config format with:

- Next.js recommended rules (core-web-vitals + TypeScript)
- TypeScript parser and plugin
- Prettier integration
- Custom rules:
  - Unused variables must be prefixed with `_`
  - Warn on `any` types
  - Enforce `import type` for type-only imports
  - Warn on unnecessary JSX curly braces
  - Warn on non-self-closing components
  - Allow `console.warn` and `console.error` only

### `.vscode/settings.json`

VS Code integration:

- Format on save with Prettier
- Auto-fix ESLint issues on save
- TypeScript workspace version

## NPM Scripts

```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all files with Prettier
npm run format:check  # Check if files are formatted
```

## Remaining Issues

The linter found 3 errors that need manual fixing:

1. **app/page.tsx:26** - `loadTrips()` called directly in useEffect (causes cascading renders)
2. **app/page.tsx:76** - Unescaped apostrophe in JSX text
3. **components/TemperatureContext.tsx:26** - `setUnit()` called directly in useEffect

And 12 warnings for unused imports that should be removed.

## Best Practices

1. Run `npm run format` before committing
2. Fix linting errors shown by `npm run lint`
3. Use `import type` for type-only imports
4. Prefix unused variables with `_`
5. Avoid `any` types when possible
