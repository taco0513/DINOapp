# CI/CD Pipeline Documentation

## Overview

DINO uses GitHub Actions for continuous integration and deployment to Vercel. The pipeline ensures code quality, security, and reliable deployments.

## Pipeline Architecture

### 1. Continuous Integration (CI)

- **Trigger**: Push to main/develop, Pull Requests
- **Jobs**: Quality checks, Security scanning, Tests, Build verification
- **Duration**: ~5-7 minutes

### 2. Continuous Deployment (CD)

- **Trigger**: Push to main branch
- **Target**: Vercel (production)
- **Features**: Preview deployments, Rollback capability, Health checks

## Workflows

### CI Workflow (.github/workflows/ci.yml)

#### Quality Checks

- ESLint for code style
- TypeScript type checking
- Prettier formatting validation
- Bundle size analysis

#### Security Scanning

- npm audit for dependencies
- Snyk integration for vulnerability detection
- Security headers validation

#### Testing

- Unit tests with Jest
- Integration tests for API endpoints
- E2E tests with Playwright (on PRs)
- Performance tests with Lighthouse

### CD Workflow (.github/workflows/cd.yml)

#### Pre-deployment

- Migration check
- Environment validation
- Build verification

#### Deployment

- Vercel CLI deployment
- Environment-specific configs
- Zero-downtime deployment

#### Post-deployment

- Health checks
- Smoke tests
- Performance validation
- Automatic rollback on failure

### PR Validation (.github/workflows/pr-validation.yml)

- Auto-labeling based on changes
- PR size warnings
- Danger JS checks
- Preview deployments
- Visual regression tests

### Dependency Updates (.github/workflows/dependency-update.yml)

- Weekly automated updates
- Security audit reports
- Automated PR creation
- Test validation

## Required Secrets

Configure these in GitHub repository settings:

```bash
# Vercel Integration
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID        # Organization ID
VERCEL_PROJECT_ID    # Project ID

# Database
DATABASE_URL         # PostgreSQL connection string
DATABASE_URL_UNPOOLED # Direct connection URL

# Monitoring (Optional)
SNYK_TOKEN          # Snyk security scanning
PERCY_TOKEN         # Visual regression testing
CODECOV_TOKEN       # Code coverage reporting
SLACK_WEBHOOK       # Deployment notifications

# Authentication
NEXTAUTH_SECRET     # NextAuth.js secret

# Google OAuth
GOOGLE_CLIENT_ID    # OAuth client ID
GOOGLE_CLIENT_SECRET # OAuth client secret

# Cron Jobs
CRON_SECRET         # Cron job authentication
```

## Local Setup

### Install Dependencies

```bash
npm install --save-dev husky lint-staged prettier danger
npx husky install
```

### Pre-commit Hooks

```bash
npx husky add .git/hooks/pre-commit "npm run pre-commit"
```

### Run CI Locally

```bash
npm run ci:test
```

## Deployment Process

### Production Deployment

1. Merge PR to main branch
2. CI pipeline runs automatically
3. On success, CD pipeline triggers
4. Deployment to Vercel production
5. Post-deployment validation
6. Slack notification

### Manual Deployment

```bash
# Via GitHub Actions
# Go to Actions → CD Workflow → Run workflow

# Via Vercel CLI
vercel --prod
```

### Rollback Process

1. Automatic rollback on deployment failure
2. Manual rollback via Vercel dashboard
3. Or via CLI: `vercel rollback`

## Performance Budgets

Defined in `lighthouse-budget.json`:

- FCP: < 2000ms
- LCP: < 2500ms
- CLS: < 0.1
- TBT: < 300ms
- Bundle size: < 1.2MB total

## Monitoring

### Build Status

- GitHub Actions dashboard
- Vercel deployment dashboard
- Slack notifications

### Performance Metrics

- Lighthouse CI reports
- Bundle size tracking
- Core Web Vitals monitoring

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check logs
npm run build

# Clear cache
npm run clean
npm install
```

#### Test Failures

```bash
# Run specific test
npm run test:unit -- --testNamePattern="test name"

# Update snapshots
npm test -- -u
```

#### Deployment Issues

```bash
# Check Vercel logs
vercel logs

# Verify environment variables
vercel env pull
```

### Emergency Procedures

#### Hotfix Deployment

1. Create hotfix branch from main
2. Make minimal changes
3. Run manual deployment workflow
4. Monitor closely

#### Disable Deployments

1. Go to GitHub Settings → Environments
2. Add protection rules or disable environment
3. Or pause Vercel deployments

## Best Practices

### Commit Messages

Follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Maintenance

### PR Guidelines

- Keep PRs small (<500 lines)
- Include tests for new features
- Update documentation
- Add meaningful description
- Request appropriate reviewers

### Deployment Safety

- Always test locally first
- Check preview deployments
- Monitor post-deployment metrics
- Have rollback plan ready
- Communicate with team

## Maintenance

### Weekly Tasks

- Review dependency updates
- Check security advisories
- Monitor performance trends
- Clean up old deployments

### Monthly Tasks

- Audit CI/CD performance
- Update documentation
- Review and optimize workflows
- Security audit

## Resources

- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
- [Danger JS](https://danger.systems/js/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
