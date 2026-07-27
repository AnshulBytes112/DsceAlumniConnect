package com.dsce.AlumniConnect.migration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;

/**
 * V1 Initial Schema Migration
 * Creates indexes on collections for optimal query performance
 */
@Slf4j
public class V1_InitialSchema implements MongoDbMigrationRunner.MigrationScript {

    private final MongoTemplate mongoTemplate;

    public V1_InitialSchema(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void execute() throws Exception {
        log.info("Executing V1_InitialSchema migration");
        
        // Ensure collections exist with indexes
        ensureUserCollection();
        ensureEventCollection();
        ensurePostCollection();
        ensureCommentCollection();
        ensureJobPostCollection();
        ensureDiscussionGroupCollection();
        
        log.info("V1_InitialSchema migration completed - all indexes created");
    }

    private void ensureUserCollection() {
        // Email index for authentication
        mongoTemplate.indexOps("users")
            .ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
        
        // USN index for alumni tracking
        mongoTemplate.indexOps("users")
            .ensureIndex(new Index().on("usn", Sort.Direction.ASC));
        
        // Graduation batch index for alumni lookup
        mongoTemplate.indexOps("users")
            .ensureIndex(new Index().on("graduationBatch", Sort.Direction.ASC));
        
        log.debug("Created indexes on users collection");
    }

    private void ensureEventCollection() {
        // Featured events index
        mongoTemplate.indexOps("events")
            .ensureIndex(new Index().on("featured", Sort.Direction.DESC));
        
        // Event category index
        mongoTemplate.indexOps("events")
            .ensureIndex(new Index().on("category", Sort.Direction.ASC));
        
        // Created date for sorting
        mongoTemplate.indexOps("events")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        
        log.debug("Created indexes on events collection");
    }

    private void ensurePostCollection() {
        // Poster ID for user's posts
        mongoTemplate.indexOps("posts")
            .ensureIndex(new Index().on("posterId", Sort.Direction.ASC));
        
        // Created date for timeline
        mongoTemplate.indexOps("posts")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        
        // Like count for trending
        mongoTemplate.indexOps("posts")
            .ensureIndex(new Index().on("likes", Sort.Direction.DESC));
        
        log.debug("Created indexes on posts collection");
    }

    private void ensureCommentCollection() {
        // Post ID for comments on a post
        mongoTemplate.indexOps("comments")
            .ensureIndex(new Index().on("postId", Sort.Direction.ASC));
        
        // Commenter ID
        mongoTemplate.indexOps("comments")
            .ensureIndex(new Index().on("commenterId", Sort.Direction.ASC));
        
        // Created date
        mongoTemplate.indexOps("comments")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        
        log.debug("Created indexes on comments collection");
    }

    private void ensureJobPostCollection() {
        // Posted by ID for user's job posts
        mongoTemplate.indexOps("jobPosts")
            .ensureIndex(new Index().on("postedById", Sort.Direction.ASC));
        
        // Active status for listings
        mongoTemplate.indexOps("jobPosts")
            .ensureIndex(new Index().on("active", Sort.Direction.DESC));
        
        // Created date for sorting
        mongoTemplate.indexOps("jobPosts")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        
        // Job type and company for search
        mongoTemplate.indexOps("jobPosts")
            .ensureIndex(new Index().on("type", Sort.Direction.ASC));
        
        mongoTemplate.indexOps("jobPosts")
            .ensureIndex(new Index().on("company", Sort.Direction.ASC));
        
        log.debug("Created indexes on jobPosts collection");
    }

    private void ensureDiscussionGroupCollection() {
        // Group name for searching
        mongoTemplate.indexOps("discussionGroups")
            .ensureIndex(new Index().on("name", Sort.Direction.ASC));
        
        // Created date
        mongoTemplate.indexOps("discussionGroups")
            .ensureIndex(new Index().on("createdAt", Sort.Direction.DESC));
        
        // Active status
        mongoTemplate.indexOps("discussionGroups")
            .ensureIndex(new Index().on("active", Sort.Direction.DESC));
        
        log.debug("Created indexes on discussionGroups collection");
    }
}
