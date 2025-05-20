# Microservices RBAC Backend System

## Overview
This project implements a scalable Role-Based Access Control (RBAC) system with microservices architecture using Node.js, TypeScript, Prisma, PostgreSQL, Redis, RabbitMQ, and Docker.

---

## Services
- **Auth Service:** User signup, login, JWT auth with refresh tokens, Redis token storage, bcrypt password hashing, RBAC middleware
- **User Service:** Manage user profiles, admin user listing
- **Role & Permission Service:** CRUD roles/permissions, assign roles to users, assign permissions to roles (Admin only)

---

## Tech Stack
- Node.js + TypeScript + Express
- Mongodb ORM + PostgreSQL
- Redis for caching and token storage
- RabbitMQ for inter-service communication
- JWT + Refresh tokens for authentication
- Docker & Docker Compose for containerization

---

### Environment Variables
Create `.env` files inside each service folder with these variables:

```env
# Example for Auth Service
DATABASE_URL=postgresql://user:password@postgres:5432/authdb
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://rabbitmq
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
```
API Documentation

    Postman collection is included at in main directory as rbac-microservice.postman_collection.json

Key Features

    JWT authentication with refresh tokens stored in Redis
    Dynamic Role and Permission CRUD with Prisma models
    RabbitMQ event publishing for user and role updates
    RBAC middleware to protect APIs based on roles/permissions
    Containerized microservices with Docker Compose orchestration

How to Use

    Register new user via Auth service
    Admin can create roles and permissions via Role & Permission service
    Assign roles to users
    Access protected endpoints based on assigned roles


