# Contributing to Flux

Thank you for your interest in contributing to Flux! We welcome community contributions to help improve this library.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue on GitHub. Be sure to include:

- A clear description of the bug.
- Steps to reproduce the issue.
- Details about your environment (browser, OS, library version).

### Suggesting Enhancements

If you have an idea for a new feature or improvement, feel free to open a feature request issue to discuss it.

### Submitting Pull Requests

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Install dependencies: `pnpm install`
4. Make your changes.
5. Verify changes before committing:
    ```bash
    pnpm lint
    pnpm typecheck
    pnpm format:check
    pnpm build
    ```
6. Commit your changes. Ensure your commit messages are descriptive.
7. Push to your branch and open a Pull Request.

---

## Coding Standards

- We use **Prettier** for formatting. Run `pnpm format:write` to auto-format before committing.
- We use **ESLint** to enforce coding standards. Ensure `pnpm lint` passes without errors.
- Ensure all types compile cleanly using `pnpm typecheck`.
