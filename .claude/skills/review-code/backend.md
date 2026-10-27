# Backend Review — NestJS

Review changes in apps/api.

## Architecture

- Check module boundaries and dependency direction.
- Keep controllers thin.
- Keep business logic in appropriate services.
- Flag circular dependencies.
- Avoid unnecessary abstractions.

## API & Validation

- Validate input at the application boundary.
- Check DTO validation and transformation.
- Check HTTP status codes and error handling.
- Check pagination, filtering and sorting.
- Verify authentication and authorization separately.
- Ensure users cannot access other users' data.

## Prisma & PostgreSQL

- Detect N+1 queries.
- Check transaction boundaries.
- Look for missing indexes on frequently
  filtered or joined columns.
- Check race conditions and unique constraints.
- Review migration compatibility.
- Avoid unbounded queries.
- Check nullable and optional fields.

## Geospatial logic

- Check coordinate ordering (longitude, latitude).
- Verify distance units and coordinate systems.
- Check empty or malformed GPX data.
- Handle invalid geometries.
- Consider large routes and memory usage.
- Check external Overpass API failure handling.

## Background jobs

- Check idempotency and retry behavior.
- Look for duplicate processing.
- Review error handling in BullMQ workers.
- Check external API timeouts.

## Security

- Verify JWT and permission checks.
- Check file upload validation.
- Prevent leaking internal errors or secrets.
- Review access to S3 resources.

## Testing

Identify missing unit, integration or E2E
scenarios for changed behavior.

Focus on real bugs and production risks.
