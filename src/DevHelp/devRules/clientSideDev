1. Match Existing Patterns & Styles
Analyze the codebase for frameworks, libraries, file/folder structures, and component conventions.
Match naming, structure, and code formatting (JSX/TSX/HTML/CSS/SASS, etc.).
Use the existing component library (Material UI, Ant, etc.) and avoid introducing new UI libs unless explicitly approved.
2. Comment the Code
Every function, component, or non-trivial logic must be commented.
Explain what the code does, why it’s needed, and any edge cases or known limitations.
3. Component and State Management
Reuse existing components when possible instead of duplicating code.
Follow project state management conventions (Redux, Zustand, Context, MobX, etc.).
Avoid unnecessary prop drilling and excessive global state.
4. Testing
Generate or update relevant tests for all code changes (unit, integration, e2e as per project).
When fixing bugs, write a test that fails before fixing.
If adding a UI component, cover edge cases (empty states, loading, errors).
5. Accessibility (a11y)
Ensure new UI follows accessibility best practices: semantic HTML, ARIA attributes, keyboard navigation, color contrast, etc.
Use existing accessibility helpers if present.
6. Performance
Avoid unnecessary re-renders or heavy computations inside components.
Use lazy loading, code splitting, and image optimization when relevant.
Don’t load large libraries or assets unless absolutely necessary.
7. Responsiveness and Browser Support
Ensure all UI works on supported browsers and is responsive on desktop, tablet, and mobile breakpoints.
Use project’s breakpoints or media query standards.
8. Input Validation and Security
Validate and sanitize all user inputs on the client side (but never trust only frontend for security).
Escape or sanitize all dynamic HTML to prevent XSS.
9. Avoid Breaking API Contracts
Match the frontend API usage to existing backend endpoints and data shapes.
Never change API contracts without backend coordination.
10. Error Handling
Handle loading, error, and empty states in all API-consuming components.
Display user-friendly error messages—never expose stack traces or technical errors.
11. Environment Variables & Secrets
Never hardcode secrets, API keys, or sensitive data in the frontend.
Use environment variables for all configurable endpoints and keys.
12. Keep Dependencies Clean
Don’t introduce new libraries without justification and team approval.
Prefer built-in and already-used dependencies.
13. Document Changes
Update README, component docs, and code comments for significant changes.
Describe non-obvious logic and edge cases.
14. Collaboration & Communication
Always leave clear comments in code and PRs explaining reasoning.
Ask for clarification if the requirements or expected UX are unclear.
15. Never Directly Change Production Without Review
All changes must go through code review and testing in staging environments before going live.
16. Rollback Plan
For major changes, outline how to revert if issues occur.
17. Audit Trail
Log all actions and code suggestions with references to user/task/ticket and timestamp.