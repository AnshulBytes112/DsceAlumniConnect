package com.dsce.AlumniConnect.migration;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "db_schema_migrations")
public class SchemaMigration {
    private String version;
    private LocalDateTime appliedAt;
}
