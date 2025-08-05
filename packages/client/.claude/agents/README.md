# BankIM Portal Subagents

This directory contains specialized subagents designed specifically for the BankIM management portal project. Each subagent has expertise in a specific domain and uses distinct tools optimized for their responsibilities.

## Available Subagents

### 🔵 bankim-database-manager
**PostgreSQL Database Specialist**
- **Purpose**: Database operations, schema management, content validation
- **Tools**: Read, Bash, Write, Edit
- **Expertise**: bankim_content, bankim_core, bankim_management databases
- **Use Cases**: Complex queries, data migrations, connection troubleshooting

### 🟢 bankim-api-developer  
**Express.js Backend Specialist**
- **Purpose**: API endpoint development, backend debugging, caching strategies
- **Tools**: Read, Edit, Write, Bash, Grep
- **Expertise**: RESTful APIs, Node.js performance, database integration
- **Use Cases**: New endpoints, API testing, backend optimization

### 🟣 bankim-content-specialist
**Multilingual Content Expert**
- **Purpose**: Content management, translation workflows, context organization
- **Tools**: Read, Write, Edit, Grep, Bash
- **Expertise**: RU/HE/EN content, RTL/LTR layouts, application contexts
- **Use Cases**: Content creation, translation management, context migration

### 🟠 bankim-route-navigator
**React Router Specialist**
- **Purpose**: Navigation debugging, protected routes, routing optimization
- **Tools**: Read, Edit, Grep, Bash
- **Expertise**: React Router v6, nested routing, drill-down patterns
- **Use Cases**: Route fixes, navigation flows, access control

### 🔴 bankim-test-engineer
**Cypress E2E Testing Expert**
- **Purpose**: Test suite development, multilingual testing, workflow validation
- **Tools**: Read, Write, Edit, Bash
- **Expertise**: Cypress framework, cross-browser testing, navigation testing
- **Use Cases**: Test creation, debugging test failures, user workflow validation

### 🔄 bankim-deployment-expert
**Railway DevOps Specialist**
- **Purpose**: Deployment management, environment configuration, production optimization
- **Tools**: Read, Write, Edit, Bash, Grep
- **Expertise**: Railway platform, multi-database deployment, environment management
- **Use Cases**: Deployment issues, environment setup, production monitoring

### 🟡 bankim-ui-designer
**Frontend UI/UX Specialist**
- **Purpose**: Component development, responsive design, accessibility improvements
- **Tools**: Read, Write, Edit, Grep
- **Expertise**: React components, CSS architecture, multilingual layouts
- **Use Cases**: UI component creation, design system maintenance, responsive layouts

### 🟪 bankim-security-auditor
**Security Analysis Expert**
- **Purpose**: Vulnerability assessment, security audits, compliance validation
- **Tools**: Read, Grep, Bash, Edit
- **Expertise**: Banking security standards, authentication systems, data protection
- **Use Cases**: Security reviews, vulnerability scans, compliance checks

## Usage Patterns

### Automatic Delegation
Claude Code will automatically invoke these subagents based on the task context:
- Database operations → bankim-database-manager
- API development → bankim-api-developer
- Content management → bankim-content-specialist
- Navigation issues → bankim-route-navigator
- Testing tasks → bankim-test-engineer
- Deployment concerns → bankim-deployment-expert
- UI development → bankim-ui-designer
- Security analysis → bankim-security-auditor

### Explicit Invocation
You can request specific subagents:
```
> Use the bankim-database-manager to fix the connection issue
> Have the bankim-route-navigator debug this navigation problem
> Ask the bankim-security-auditor to review authentication flow
```

## Subagent Coordination

These subagents are designed to work together on complex tasks:
- **Database + API**: Schema changes with corresponding API updates
- **Content + UI**: Multilingual content with appropriate UI layouts
- **Route + Test**: Navigation fixes with comprehensive test coverage
- **Deployment + Security**: Production deployments with security validation

Each subagent understands the BankIM portal's architecture and can collaborate effectively while maintaining their specialized focus areas.