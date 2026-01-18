---
description: "Quick development tasks using bmad-developer (code implementation, refactoring, testing)"
gitignored: true
project: true
---

# /dev - Quick Developer Tasks

Launch the bmad-developer agent for quick development tasks without full orchestration.

## Usage

```
/dev <task description>
```

## When to Use

Use `/dev` for simpler tasks that don't require full planning:
- Implement a specific function or component
- Fix a simple bug
- Write tests for existing code
- Refactor a specific file or module
- Add type definitions

For complex features requiring planning and design, use `/bmad` instead.

## Examples

### Implement a specific function
```
/dev Implement user authentication middleware in src/lib/auth.ts
```

### Fix a bug
```
/dev Fix the login redirect issue in src/app/login/page.tsx
```

### Write tests
```
/dev Write unit tests for the search function in src/lib/search.ts
```

### Refactor code
```
/dev Refactor the AgentCard component to use the new design system
```

### Add types
```
/dev Add TypeScript types for the Agent API responses
```

## What bmad-developer Provides

- **Full-stack expertise**: React/Next.js, Node.js, TypeScript, Prisma
- **Code quality**: Type coverage > 95%, test coverage > 80%
- **Best practices**: SOLID principles, clean code, proper error handling
- **Testing**: Unit tests, integration tests
- **Documentation**: Code comments, JSDoc

## Quality Standards

All implementations include:
- ✅ TypeScript strict mode compliance
- ✅ ESLint rule adherence
- ✅ Proper error handling
- ✅ Input validation (Zod schemas)
- ✅ Security best practices
- ✅ Performance optimization

## Task

<task>{{TASK}}</task>
