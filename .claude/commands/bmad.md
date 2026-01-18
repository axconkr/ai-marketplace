---
description: "Execute complex development tasks using BMAD orchestration (default: bmad-orchestrator agent)"
gitignored: true
project: true
---

# /bmad - BMAD Orchestrator

Launch the BMAD Orchestrator to handle complex development tasks with automatic agent coordination.

## Usage

```
/bmad <task description>
```

## What it does

The BMAD Orchestrator will:
1. Analyze your task and break it down into phases
2. Select appropriate specialized agents (Developer, Architect, PM, UX Designer)
3. Execute tasks in parallel when possible (3-5x speed improvement)
4. Apply document sharding for 90% token savings
5. Track progress with todo lists
6. Deliver high-quality, tested, and documented results

## Workflow Phases

### Phase 1: Analysis (optional)
- Requirements gathering
- User needs analysis
- Pain points identification

### Phase 2: Planning
- PRD creation (Product Manager)
- Architecture design (Architect)
- UI/UX design (UX Designer)
- Plan review (Momus)

### Phase 3: Solutioning
- Detailed design
- API specifications
- Component prototypes

### Phase 4: Implementation
- Backend development (parallel)
- Frontend development (parallel)
- Testing
- Documentation (background)

## Examples

### Implement a new feature
```
/bmad Implement AI agent search with filters (category, price, rating)
```

### Fix a complex bug
```
/bmad Fix API response time - currently 10s, target < 200ms
```

### Refactor code
```
/bmad Refactor authentication system to use JWT with refresh tokens
```

### Build a complete feature
```
/bmad Build user dashboard with purchase history, favorites, and analytics
```

## Specialized Agents Used

The orchestrator delegates to:

**Tier 1 (Strategic - Opus)**:
- bmad-architect: System design, performance optimization
- oracle: Complex debugging
- metis: Pre-planning, risk analysis
- momus: Plan review, quality assurance

**Tier 2 (Execution - Sonnet)**:
- bmad-developer: Code implementation, testing
- bmad-product-manager: PRD, user stories
- bmad-ux-designer: UI/UX design
- frontend-engineer: React/Next.js components

**Tier 3 (Support - Haiku)**:
- explore: Fast file search
- document-writer: Documentation
- devops-health-checker: Environment checks

## Performance

- **Speed**: 3-5x faster with parallel execution
- **Cost**: 70% reduction via document sharding + model optimization
- **Quality**: Enhanced through specialized agents + structured workflow

## Task

<task>{{TASK}}</task>
