# MongoDB Schema Migration Guide

## Overview
This project uses a custom MongoDB schema migration system to manage versioned database changes. Unlike SQL databases with tools like Flyway, MongoDB requires application-level schema management.

## Architecture

### Migration Components
- **MongoDbMigrationRunner**: Automatically runs migrations on application startup
- **SchemaMigration**: Tracks which migrations have been applied
- **MigrationScript**: Interface for individual migration implementations

### How It Works
1. Application starts and `MongoDbMigrationRunner` runs
2. Migration tracking collection (`db_schema_migrations`) is created if it doesn't exist
3. Each migration is checked - if not previously applied, it's executed
4. Migration results are recorded to prevent re-execution
5. If any migration fails, application startup fails (fail-fast approach)

## Running Migrations

Migrations run **automatically** on application startup. No manual commands needed.

### Checking Migration Status
Query MongoDB directly:
```bash
db.db_schema_migrations.find().pretty()
```

Example output:
```json
{
  "_id": ObjectId(...),
  "version": "V1_Initial_Schema",
  "appliedAt": ISODate("2026-07-15T18:30:00Z")
}
```

## Creating New Migrations

### Step 1: Create a new migration file
Create `src/main/java/com/dsce/AlumniConnect/migration/V2_YourMigration.java`:

```java
package com.dsce.AlumniConnect.migration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;

@Slf4j
public class V2_YourMigration implements MongoDbMigrationRunner.MigrationScript {
    private final MongoTemplate mongoTemplate;

    public V2_YourMigration(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void execute() throws Exception {
        log.info("Executing V2_YourMigration");
        
        // Your migration logic here
        // e.g., add indexes, create collections, update documents
        
        log.info("V2_YourMigration completed");
    }
}
```

### Step 2: Register the migration
In `MongoDbMigrationRunner.run()`, add to migrations list:
```java
migrations.add(new Migration("V2_YourMigration", new V2_YourMigration(mongoTemplate)));
```

### Step 3: Deploy
The migration will automatically run on next application startup.

## Migration Examples

### Adding an index
```java
mongoTemplate.indexOps("users")
    .ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
```

### Creating a collection
```java
mongoTemplate.createCollection("newCollection");
```

### Updating documents
```java
Query query = new Query(Criteria.where("status").is("inactive"));
Update update = new Update().set("status", "archived");
mongoTemplate.updateMulti(query, update, "users");
```

## Best Practices

1. **Always test migrations locally first** before deploying to production
2. **Make migrations idempotent** - they should be safe to re-run
3. **Use appropriate index strategies** - too many indexes hurt write performance
4. **Document your migrations** with comments
5. **Keep migrations small and focused** - one logical change per migration
6. **Monitor performance** after new index creation
7. **Have a rollback plan** for problematic migrations

## Troubleshooting

### Migration fails on startup
1. Check application logs for detailed error
2. Verify MongoDB is running and accessible
3. Check migration code for syntax/logic errors
4. Remove the failed migration record from `db_schema_migrations` if needed:
   ```bash
   db.db_schema_migrations.deleteOne({ version: "V2_BadMigration" })
   ```

### Migration runs multiple times
Check that migration version string matches exactly. Version strings are case-sensitive.

### Need to re-run a migration
1. Delete the record from `db_schema_migrations`
2. Restart application
3. Fix will re-run

## Monitoring

Enable debug logging to see migration execution:
```yaml
logging:
  level:
    com.dsce.AlumniConnect.migration: DEBUG
```

## Security Considerations

- Keep migration scripts in version control
- Review all migration changes before deploying to production
- Use appropriate MongoDB user permissions (index creation, document updates, etc.)
- Avoid exposing migration errors to clients in production
