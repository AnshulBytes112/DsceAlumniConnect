package com.dsce.AlumniConnect.migration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MongoDB Schema Migration Manager
 * Handles versioned migrations for MongoDB collections
 * Each migration is run only once and tracked in db.schema_migrations collection
 */
@Slf4j
@Component
public class MongoDbMigrationRunner implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;
    private static final String MIGRATIONS_COLLECTION = "db_schema_migrations";

    public MongoDbMigrationRunner(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Starting MongoDB schema migrations...");
        
        // Ensure migration tracking collection exists
        ensureMigrationsCollection();
        
        // Define all migrations
        List<Migration> migrations = new ArrayList<>();
        migrations.add(new Migration("V1_Initial_Schema", new V1_InitialSchema(mongoTemplate)));
        
        // Run each migration once
        for (Migration migration : migrations) {
            if (!isMigrationApplied(migration.version)) {
                try {
                    log.info("Applying migration: {}", migration.version);
                    migration.migrationScript.execute();
                    recordMigration(migration.version);
                    log.info("Migration completed: {}", migration.version);
                } catch (Exception e) {
                    log.error("Migration failed: {}", migration.version, e);
                    throw new RuntimeException("Migration " + migration.version + " failed", e);
                }
            } else {
                log.debug("Migration already applied: {}", migration.version);
            }
        }
        
        log.info("MongoDB schema migrations completed");
    }

    private void ensureMigrationsCollection() {
        if (!mongoTemplate.collectionExists(MIGRATIONS_COLLECTION)) {
            mongoTemplate.createCollection(MIGRATIONS_COLLECTION);
            log.info("Created migration tracking collection: {}", MIGRATIONS_COLLECTION);
        }
    }

    private boolean isMigrationApplied(String version) {
        SchemaMigration result = mongoTemplate.findOne(
            new Query(),
            SchemaMigration.class,
            MIGRATIONS_COLLECTION
        );
        
        return result != null && version.equals(result.getVersion());
    }

    private void recordMigration(String version) {
        SchemaMigration migration = new SchemaMigration();
        migration.setVersion(version);
        migration.setAppliedAt(LocalDateTime.now());
        mongoTemplate.insert(migration, MIGRATIONS_COLLECTION);
    }

    /**
     * Inner class to represent a migration
     */
    private static class Migration {
        String version;
        MigrationScript migrationScript;

        Migration(String version, MigrationScript migrationScript) {
            this.version = version;
            this.migrationScript = migrationScript;
        }
    }

    /**
     * Interface for migration scripts
     */
    public interface MigrationScript {
        void execute() throws Exception;
    }
}
