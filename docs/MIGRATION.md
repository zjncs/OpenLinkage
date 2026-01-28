# Migration Guide

This document describes the migration from the original folder structure to the new monorepo structure.

## Overview

The project has been reorganized into a clean monorepo structure under the `OpenLinkage/` directory to improve clarity, consistency, and maintainability.

## Migration Mapping

### Applications

| Original Path | New Path | Description |
|--------------|----------|-------------|
| `桌面端/` | `OpenLinkage/apps/desktop/` | Desktop Electron app |
| `mobile-app/` | `OpenLinkage/apps/mobile/` | Mobile Capacitor app |
| `linkage-health/miniprogram/` | `OpenLinkage/apps/miniprogram/` | WeChat mini program |
| `Web端/doctor/` | `OpenLinkage/apps/web/doctor/` | Doctor web portal |
| `Web端/src/` | `OpenLinkage/apps/web/portal/` | User web portal |

### Packages

| Original Path | New Path | Description |
|--------------|----------|-------------|
| `linkage-health/backend/` | `OpenLinkage/packages/backend/` | Express API server |
| `桌面端/server/_core/` + `桌面端/shared/_core/` | `OpenLinkage/packages/core/` | Shared core utilities |
| `Web端/data/` | `OpenLinkage/packages/health-data/` | WellAlly Health system |

## What Changed

### Structure
- All code is now organized under `OpenLinkage/` directory
- Applications are in `apps/` subdirectory
- Shared packages are in `packages/` subdirectory
- Documentation is in `docs/` subdirectory

### File Locations
- All files have been copied to their new locations
- Original files remain in place (not deleted)
- Internal file structures within each app/package are preserved

### Documentation
- Added comprehensive README.md files for:
  - Root monorepo
  - Each application
  - Each package
- Created migration guide (this document)

### Configuration
- Added root `package.json` with workspace configuration
- Added root `.gitignore`
- Individual app/package configurations remain unchanged

## What Stayed the Same

### Code
- All application code is functionally identical
- No logic has been deleted or modified
- Import paths within each app remain the same (relative imports still work)

### Dependencies
- Each app/package retains its own `package.json`
- No dependency changes were made
- Apps can still be run independently

### Build Processes
- Each app's build process remains unchanged
- Development workflows are the same
- Scripts in individual package.json files work as before

## Next Steps

### Immediate Actions
1. Review the new structure in `OpenLinkage/` directory
2. Test each application to ensure it still runs correctly
3. Update any external documentation or deployment scripts

### Future Improvements
1. **Shared Dependencies**: Consider moving common dependencies to root
2. **Import Paths**: Update imports to use workspace references (e.g., `@openlinkage/core`)
3. **Build System**: Set up unified build and test commands
4. **CI/CD**: Update continuous integration to work with monorepo
5. **Package Publishing**: Set up proper package.json for shared packages
6. **Linting**: Add unified linting and formatting configuration
7. **Testing**: Set up monorepo-wide testing infrastructure

## Running Applications

Each application can be run independently from its directory:

### Desktop App
```bash
cd OpenLinkage/apps/desktop
pnpm install
pnpm dev
```

### Mobile App
```bash
cd OpenLinkage/apps/mobile
npm install
npm run dev
```

### Backend
```bash
cd OpenLinkage/packages/backend
npm install
npm run dev
```

### From Root (using workspace scripts)
```bash
cd OpenLinkage
npm run dev:desktop
npm run dev:mobile
npm run dev:backend
```

## Troubleshooting

### Issue: Module not found
- **Cause**: Import paths may need updating if referencing moved files
- **Solution**: Check if imports reference the old structure and update paths

### Issue: Build fails
- **Cause**: Build outputs may reference old paths
- **Solution**: Clean build directories and rebuild from scratch

### Issue: Dependencies not found
- **Cause**: node_modules may need reinstalling
- **Solution**: Delete node_modules and reinstall dependencies

## Rollback

If you need to revert to the original structure:
1. The original folders (`桌面端/`, `mobile-app/`, etc.) are still intact
2. Simply continue using those directories
3. The `OpenLinkage/` directory can be safely deleted

## Questions or Issues

If you encounter any issues with the migration, please:
1. Check this guide for common solutions
2. Review the README.md files in each directory
3. Verify that original files are still intact
4. Test applications in their original locations to confirm they still work

## Summary

This migration provides a cleaner, more maintainable structure while preserving all existing functionality. All code has been preserved, and applications can continue to run independently as before.
