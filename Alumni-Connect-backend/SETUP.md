# ⚙️ Setup Guide — Alumni Connect Backend


---

## 🧩 1. Prerequisites

Before starting, ensure you have the following installed on your system:

- **Java 17** or higher
- **Maven** (latest stable version)
- **MongoDB** (either **local** or **Atlas**)
- **Git** for version control
- **An IDE** such as IntelliJ IDEA or VS Code

You can verify installation with:
```
java -version
mvn -v

```
🚀 2. Cloning and Building the Project

Open a terminal and run the following commands:
```
git clone https://github.com/<your-org-or-username>/AlumniConnectBackend.git
cd AlumniConnectBackend
```
Build the project to download dependencies:
```
mvn clean install
```
3. Database Configuration (MongoDB)
▶️ Option A: Using Local MongoDB

Start MongoDB on your system (default port 27017).

Open the Mongo shell and create a database:

▶️ Option B: Using MongoDB Atlas (Cloud)

Go to MongoDB Atlas

Create a free cluster and get the connection string.

It will look like this:
```
mongodb+srv://<username>:<password>@cluster0.mongodb.net/alumni_connect
```
Replace <username> and <password> with your actual credentials.

⚙️ 4. Application Configuration

Navigate to:
src/main/resources/

There are two files:

application.properties — your main configuration file.

application-example.properties — sample file for teammates.

If setting up for the first time, copy the example file:
cp src/main/resources/application-example.properties src/main/resources/application.properties

Then edit application.properties with your database details:
```
spring.application.name=AlumniConnect
server.port=8080
spring.data.mongodb.uri=mongodb://localhost:27017/alumni_connect
```
Or for MongoDB Atlas:
```
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster0.mongodb.net/alumni_connect
```
5.After running the application for the first time, you can customize other settings as needed.

6. Running Tests

To verify the backend setup, run:
```
mvn test
```
If all tests pass, you’ll see:
```
BUILD SUCCESS
```
This confirms your setup is correct.

☁️ 7. GitHub Actions (CI/CD)
.github/workflows/maven.yml

It automatically:

Builds your project

Runs tests

Caches Maven dependencies

This ensures every pull request or commit to the main branch is tested automatically.


🔧 8. Troubleshooting
Issue	Cause	Solution
Whitelabel Error Page	Backend not running or wrong endpoint	Ensure the app is running on port 8080
MongoDB Connection Refused	MongoDB not running locally	Start MongoDB or verify the URI
Tests Failing on GitHub	Invalid test or missing config	Ensure application-example.properties exists and tests don’t depend on environment data

👥 9. Team Guidelines

1) Each teammate must create their own application.properties file using the example provided.

2) Never commit credentials (like MongoDB URIs, passwords, or tokens).

3) Use feature branches and make pull requests to main.

4) Ensure builds pass on GitHub before merging.

5) While creating PR make sure to select the appropriate reviewers and the fix or modification must be properly documented in the description.


