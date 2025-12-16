# ADR-001: Monorepo Structure

## Status

Accepted

**Date:** 2024-12-15

**Deciders:** Engineering Team

## Context

The Maison Bijoux B2B e-commerce platform requires a robust architecture to support multiple applications (web, mobile) and shared packages across different deployment targets. The platform needs to serve both B2C and B2B customers with different experiences while maximizing code reuse.

Key challenges include:
- Managing shared code between web (Next.js) and mobile (React Native/Expo) applications
- Maintaining consistent types, utilities, and UI components across platforms
- Supporting multiple API backends (Sage, Medusa, Shopify Plus, Bridge Laravel)
- Enabling independent deployment of applications while sharing common infrastructure
- Ensuring type safety across the entire codebase

## Decision Drivers

- **Code reuse:** Maximize shared logic between web and mobile platforms
- **Type safety:** Ensure consistent TypeScript types across all packages
- **Independent deployability:** Allow applications to be deployed independently
- **Developer experience:** Fast feedback loops and efficient local development
- **Scalability:** Support future expansion to additional platforms or services
- **Build performance:** Fast incremental builds for large codebases

## Considered Options

### Option 1: Polyrepo (Separate Repositories)

**Description:** Maintain separate repositories for each application and shared packages published to npm.

**Pros:**
- Clear ownership boundaries
- Independent versioning and release cycles
- Smaller repository sizes

**Cons:**
- Complex dependency management
- Difficult to make cross-cutting changes
- Slower development iteration across packages
- Version synchronization overhead

### Option 2: Monorepo with Lerna

**Description:** Single repository using Lerna for package management.

**Pros:**
- Established tooling
- Good npm publishing support
- Single repository for all code

**Cons:**
- Slower builds without caching
- Less active maintenance
- Limited task orchestration capabilities

### Option 3: Monorepo with Turborepo + pnpm

**Description:** Single repository using Turborepo for build orchestration and pnpm for efficient package management.

**Pros:**
- Excellent build caching (local and remote)
- Efficient disk usage with pnpm
- Intelligent task scheduling
- First-class workspace support
- Active development and community

**Cons:**
- Requires initial configuration investment
- Team needs to learn new tooling

## Decision

**Chosen Option:** Monorepo with Turborepo + pnpm

We adopt a monorepo structure using Turborepo for build orchestration and pnpm workspaces for package management. The repository is organized into two main directories:

### Directory Structure

```
monorepo_bijoux_B2B/
├── apps/
│   ├── web/           # Next.js web application (@bijoux/web)
│   └── mobile/        # Expo/React Native mobile app (@bijoux/mobile)
├── packages/
│   ├── api-client/    # Unified API client facade (@maison/api-client)
│   ├── api-core/      # Base API client implementation (@maison/api-core)
│   ├── api-sage/      # Sage ERP adapter (@maison/api-sage)
│   ├── config/        # Shared configuration (@maison/config)
│   ├── config-tailwind/ # Tailwind CSS configuration
│   ├── config-typescript/ # TypeScript configuration
│   ├── hooks/         # Shared React hooks (@maison/hooks)
│   ├── types/         # Shared TypeScript types (@maison/types)
│   ├── ui/            # Web UI components (@maison/ui)
│   ├── ui-mobile/     # Mobile UI components (@maison/ui-mobile)
│   └── utils/         # Shared utilities (@maison/utils)
├── docs/              # Documentation
├── turbo.json         # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json       # Root package.json
```

### Package Naming Convention

- Internal packages use the `@maison/` scope
- Application packages use the `@bijoux/` scope

### Workspace Configuration

The `pnpm-workspace.yaml` defines the workspace structure:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**Rationale:** This option provides the best combination of build performance, developer experience, and scalability. Turborepo's intelligent caching significantly reduces build times, while pnpm's efficient disk usage and strict dependency resolution prevent phantom dependencies.

## Consequences

### Positive

- **Atomic changes:** Cross-cutting changes can be made in a single pull request
- **Consistent tooling:** All projects share the same linting, formatting, and testing configuration
- **Fast builds:** Turborepo's caching dramatically reduces CI/CD times
- **Simplified dependency management:** Internal packages are linked automatically
- **Single source of truth:** Types and utilities are shared without version conflicts
- **Efficient storage:** pnpm's content-addressable storage reduces disk usage

### Negative

- **Repository size:** The repository will grow larger over time
- **CI complexity:** CI pipelines need to handle affected package detection
- **Learning curve:** Team members need to understand monorepo workflows
- **Merge conflicts:** Increased potential for conflicts in frequently modified files

### Neutral

- Requires strict code ownership conventions
- Need for clear package boundary guidelines

## Implementation Notes

### Turborepo Configuration

The `turbo.json` configures task dependencies and caching:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Package Dependencies

Internal packages declare dependencies using workspace protocol:

```json
{
  "dependencies": {
    "@maison/types": "workspace:*",
    "@maison/utils": "workspace:*"
  }
}
```

### Running Tasks

```bash
# Build all packages
pnpm build

# Run dev server for web app
pnpm dev:web

# Run specific package task
pnpm --filter @maison/ui build
```

## Related Decisions

- [ADR-002: API Client Pattern](./002-api-client-pattern.md)

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Monorepo Tools Comparison](https://monorepo.tools/)

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| 2024-12-15 | Engineering Team | Initial draft |
