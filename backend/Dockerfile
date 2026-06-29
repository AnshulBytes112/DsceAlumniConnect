# Stage 1: Build Java App
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build Node.js dependencies
FROM node:20-alpine AS node_build
WORKDIR /app/open_resume
COPY open_resume/package.json open_resume/package-lock.json* ./
RUN npm ci || npm install
COPY open_resume ./

# Stage 3: Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Node.js in the JRE image
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/AlumniConnect-0.0.1-SNAPSHOT.jar app.jar
COPY --from=node_build /app/open_resume ./open_resume

# Create directory for uploads
RUN mkdir -p uploads_data

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

