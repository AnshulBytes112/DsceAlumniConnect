# 🎓 Alumni Connect Backend

Backend API for the **Alumni Connect** app — a platform that connects students and alumni.  
Built using **Spring Boot (Java 17)** and **MongoDB**.

---

## 🚀 Features

- RESTful APIs for user login & signup
- Alumni and student profile management
- Scalable backend ready for 10K+ users
- MongoDB support (local or Atlas)
- CI/CD using GitHub Actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| Backend | Spring Boot 3, Java 17 |
| Database | MongoDB / MongoDB Atlas |
| Build Tool | Maven |
| Testing | JUnit |
| Deployment | GitHub Actions (CI) |

---

## ⚙️ Local Setup

Follow [SETUP.md](SETUP.md) for full steps.

Quick summary:

```bash
git clone https://github.com/<your-org>/AlumniConnectBackend.git
cd AlumniConnectBackend
cp src/main/resources/application-example.properties src/main/resources/application.properties
mvn spring-boot:run
