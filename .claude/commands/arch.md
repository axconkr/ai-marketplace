---
description: "Architecture and system design using bmad-architect (patterns, scalability, performance)"
gitignored: true
project: true
---

# /arch - Architecture & System Design

Launch the bmad-architect agent for system architecture and technical design decisions.

## Usage

```
/arch <task description>
```

## When to Use

Use `/arch` for architectural decisions:
- Design system architecture
- Choose technology stack
- Plan database schema
- Design API specifications
- Performance optimization strategies
- Security architecture
- Scalability planning

## Examples

### System architecture
```
/arch Design the architecture for a real-time notification system
```

### Database design
```
/arch Design the database schema for agent tags and categories with Prisma
```

### API design
```
/arch Design RESTful API endpoints for agent search and filtering
```

### Performance optimization
```
/arch Create a caching strategy to improve API response times
```

### Security architecture
```
/arch Design authentication and authorization system with JWT and RBAC
```

### Scalability
```
/arch Plan horizontal scaling strategy for handling 100k concurrent users
```

## What bmad-architect Provides

- **Design Patterns**: Repository, Factory, Strategy, Observer, etc.
- **Architecture Styles**: Clean Architecture, Layered, Microservices
- **Performance**: Caching, database optimization, CDN strategies
- **Security**: Authentication, authorization, data protection
- **Scalability**: Horizontal scaling, load balancing, sharding
- **Monitoring**: Logging, metrics, observability

## Expertise Areas

### Patterns & Principles
- SOLID principles
- Design patterns (GoF)
- Clean Architecture
- Domain-Driven Design

### Technology Stack
- Frontend: Next.js, React, TypeScript
- Backend: Node.js, Express, Prisma
- Database: PostgreSQL, Redis
- Infrastructure: Docker, AWS, Kubernetes

### Non-Functional Requirements
- Performance: < 200ms API latency (P95)
- Scalability: 10,000+ concurrent users
- Security: OWASP Top 10 compliance
- Reliability: 99.9% uptime

## Deliverables

Typically includes:
- Architecture diagrams (ASCII art)
- Technology recommendations with trade-offs
- API specifications (endpoints, schemas)
- Database schema (Prisma models)
- Performance targets and strategies
- Security considerations
- Implementation guidelines

## Task

<task>{{TASK}}</task>
