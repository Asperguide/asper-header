# Security Policy

## Supported Versions

The following versions of AsperHeader are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

We recommend always using the latest version available on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=HenryLetellier.asperheader) or [Open VSX Registry](https://open-vsx.org/extension/HenryLetellier/asperheader).

## Reporting a Vulnerability

We take the security of AsperHeader seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

**DO NOT** open a public issue for security vulnerabilities. Instead:

1. **Email the maintainers** directly at:
   - Repository: [Create a private security advisory](https://github.com/Asperguide/asper-header/security/advisories/new)
   - Or contact the publisher directly through VS Code Marketplace

2. **Provide details** including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
   - Your contact information for follow-up

### Response Timeline

- **Initial Response**: Within 48 hours of report submission
- **Status Update**: Within 7 days with assessment and planned fix timeline
- **Fix Deployment**: Depends on severity:
  - Critical: Within 7 days
  - High: Within 14 days
  - Medium: Within 30 days
  - Low: Next regular release

### What Qualifies as a Security Issue

- Arbitrary code execution
- Unauthorized file system access beyond workspace boundaries
- Exposure of sensitive information (credentials, tokens, etc.)
- Privilege escalation
- Injection vulnerabilities
- Dependencies with known CVEs affecting AsperHeader functionality

### What's NOT a Security Issue

- Bugs that don't have security implications (use [bug reports](https://github.com/Asperguide/asper-header/issues/new?template=bug_report.md))
- Feature requests (use [feature requests](https://github.com/Asperguide/asper-header/issues/new?template=feature_request.md))
- Questions about usage (use [discussions](https://github.com/Asperguide/asper-header/discussions))

## Security Best Practices

When using AsperHeader:

1. **Keep Updated**: Always use the latest version to benefit from security patches
2. **Review Permissions**: AsperHeader only requires access to your workspace files
3. **Workspace Trust**: Be mindful when opening untrusted workspaces with the extension enabled
4. **Configuration**: Review custom configurations, especially `languagePrepend` and `languageAppend` settings

## Backward Compatibility & Safe Updates

AsperHeader follows a **conservative update philosophy** to minimize security and behavior risks:

### Guaranteed Backward Compatibility

- **All minor and patch versions** (1.0.x → 1.0.y) are **fully backward compatible**
- Existing configurations continue to work without modification
- Default behavior remains consistent across updates

### Opt-In Security Model

New features are **disabled by default** to prevent unexpected behavior changes:

- **Comment overrides** (`languageSingleLineCommentOverride`, `languageMultiLineCommentOverride`): Empty by default
- **Prepend/Append text** (`languagePrepend`, `languageAppend`): Empty by default
- **Feature flags**: New toggles default to `false` or maintain existing behavior

This means:

- Updates won't inject unexpected code into your files
- You explicitly control when new features activate
- Security patches can be applied immediately without fear of breaking changes
- No surprises when auto-update is enabled

**You can safely update to the latest version** knowing your existing headers and workflows will continue functioning identically until you explicitly enable new features.

## Disclosure Policy

Once a vulnerability is fixed:

1. We will release a patched version
2. Update the [CHANGELOG.md](CHANGELOG.md) with security fix notes (without revealing exploit details)
3. Credit the reporter (if they wish to be credited)
4. Publish a security advisory on GitHub (if severity warrants)

## Dependencies

AsperHeader uses Renovate bot for dependency updates. Security patches for dependencies are applied promptly:

- **npm audit** is run regularly in CI/CD
- Critical/High severity vulnerabilities are addressed immediately
- Dependency overrides may be used for transitive dependencies

## Contact

For security concerns, please use:

- GitHub Security Advisories (preferred)
- Direct contact through publisher profile
- Public issues for non-security bugs

Thank you for helping keep AsperHeader and its users safe!
