# 🚀 PricePulse CI/CD Pipeline

This directory contains the comprehensive CI/CD pipeline for PricePulse, ensuring code quality, security, and reliable deployments across multiple environments.

## 📋 Pipeline Overview

### 🔄 Workflow Structure

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Push     │───▶│   CI Pipeline   │───▶│  Dev Deploy    │
│   / PR         │    │                 │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Security Scans  │    │ Prod Deploy    │
                       │                 │    │ (Manual)       │
                       └─────────────────┘    └─────────────────┘
```

## 🧪 Workflows

### 1. **Continuous Integration** (`ci.yml`)
**Triggers**: Every push, PR, weekly security scans
**Purpose**: Comprehensive testing and validation

#### Jobs:
- 🔒 **Security Audit**: Dependency scanning, secret detection, OWASP checks
- 📝 **Code Quality**: ESLint, TypeScript validation, Prettier checks
- 🧪 **Backend Tests**: Unit tests with PostgreSQL & Redis
- 🧪 **Frontend Tests**: Component and integration tests
- 🏗️ **Build & Package**: Application compilation and packaging
- 📊 **Test Results**: Coverage reports and PR comments

### 2. **Development Deployment** (`deploy-dev.yml`)
**Triggers**: After successful CI on `develop` or `feature/*` branches
**Purpose**: Automated deployment to development environment

#### Jobs:
- 🔒 **Security Gate**: Verifies CI success
- 🧪 **Smoke Tests**: Quick validation before deployment
- 🚀 **Deploy**: Builds and deploys to development
- 📊 **Post-deployment**: Integration tests and verification

### 3. **Production Deployment** (`deploy-prod.yml`)
**Triggers**: After successful CI on `main` branch, manual dispatch
**Purpose**: Secure production deployment with manual approval

#### Jobs:
- 🔒 **Production Security Gate**: Enhanced security checks
- 🧪 **Production Smoke Tests**: Production-specific validation
- 🚀 **Deploy Production**: Zero-downtime production deployment
- 📊 **Post-production**: Load testing and monitoring verification

### 4. **Security Scanning** (`security-scan.yml`)
**Triggers**: Daily at 2 AM UTC, on push/PR, manual dispatch
**Purpose**: Comprehensive security analysis

#### Jobs:
- 🔍 **Dependency Scan**: npm audit and vulnerability assessment
- 🕵️ **Secret Scan**: TruffleHog and GitLeaks detection
- 🛡️ **OWASP Check**: Dependency vulnerability analysis
- 🔐 **Container Scan**: Trivy vulnerability scanning
- 📊 **Security Report**: Consolidated security findings

### 5. **Monitoring & Alerting** (`monitoring.yml`)
**Triggers**: Every 15 minutes, on push, manual dispatch
**Purpose**: Continuous application health monitoring

#### Jobs:
- 🔍 **Health Check**: Application and API endpoint monitoring
- 📈 **Performance**: Lighthouse CI and response time checks
- 🗄️ **Database Health**: Database and Redis connectivity
- 📊 **Metrics Collection**: System and application metrics
- 🚨 **Alert Generation**: Critical issue detection and notifications

## 🔒 Security Features

### Pre-deployment Security Gates
- ✅ Dependency vulnerability scanning
- ✅ Secret and credential detection
- ✅ Code quality and linting checks
- ✅ Security policy enforcement
- ✅ Container image security scanning

### Continuous Security Monitoring
- 🔍 Daily automated security scans
- 🕵️ Real-time secret detection
- 🛡️ OWASP dependency analysis
- 🔐 Container vulnerability assessment
- 📊 Security report generation

## 🚀 Deployment Environments

### Development Environment
- **URL**: `https://dev.pricepulse.com`
- **Auto-deploy**: Yes (after CI success)
- **Approval**: Not required
- **Testing**: Smoke tests and integration tests

### Production Environment
- **URL**: `https://pricepulse.com`
- **Auto-deploy**: No (manual approval required)
- **Approval**: Required (environment protection)
- **Testing**: Comprehensive validation and load testing

## 📊 Quality Gates

### Code Quality Requirements
- ✅ All tests must pass
- ✅ Code coverage thresholds met
- ✅ No critical security vulnerabilities
- ✅ Linting and formatting standards met
- ✅ TypeScript compilation successful

### Security Requirements
- ✅ No secrets in code
- ✅ Dependency vulnerabilities below threshold
- ✅ Container images pass security scan
- ✅ OWASP checks pass
- ✅ Security policy compliance

### Performance Requirements
- ✅ Response time < 2 seconds
- ✅ Lighthouse score > 90
- ✅ Health checks pass
- ✅ Database connectivity verified
- ✅ Redis connectivity verified

## 🛠️ Configuration

### Environment Variables
```bash
# Required for deployments
GITHUB_TOKEN          # GitHub Actions token
DOCKER_USERNAME       # Container registry username
DOCKER_PASSWORD       # Container registry password

# Optional for notifications
SLACK_WEBHOOK_URL     # Slack notifications
DISCORD_WEBHOOK_URL   # Discord notifications
EMAIL_SMTP_CONFIG     # Email notifications
```

### Branch Protection Rules
```yaml
# main branch
- Require status checks to pass
- Require branches to be up to date
- Require pull request reviews
- Require security policy compliance

# develop branch
- Require status checks to pass
- Require branches to be up to date
```

## 📈 Monitoring & Metrics

### Application Metrics
- **Response Time**: Target < 2 seconds
- **Uptime**: Target 99.9%
- **Error Rate**: Target < 0.1%
- **User Activity**: Active users and API requests

### System Metrics
- **CPU Usage**: Monitor resource utilization
- **Memory Usage**: Track memory consumption
- **Disk Usage**: Monitor storage capacity
- **Network**: Track bandwidth and latency

### Security Metrics
- **Vulnerability Count**: Track security issues
- **Scan Frequency**: Daily security assessments
- **Compliance Score**: Security policy adherence
- **Incident Response**: Time to resolution

## 🚨 Alerting & Notifications

### Critical Alerts
- ❌ Application health check failure
- ❌ Security vulnerability detected
- ❌ Performance degradation
- ❌ Database connectivity issues
- ❌ Deployment failures

### Notification Channels
- 📧 **Email**: Team notifications
- 💬 **Slack**: Real-time alerts
- 🔔 **Discord**: Team communication
- 📱 **SMS**: Critical incidents
- 🚨 **PagerDuty**: On-call escalation

## 🔧 Troubleshooting

### Common Issues

#### CI Pipeline Failures
```bash
# Check test failures
npm run test:coverage

# Verify linting
npm run lint

# Check security vulnerabilities
npm audit
```

#### Deployment Failures
```bash
# Verify environment variables
echo $ENVIRONMENT_VAR

# Check Docker images
docker images | grep pricepulse

# Verify network connectivity
curl -f https://target-domain.com/health
```

#### Security Scan Failures
```bash
# Check for secrets
trufflehog --path .

# Verify dependencies
npm audit --audit-level=high

# Check container vulnerabilities
trivy image pricepulse-backend:latest
```

### Debug Commands
```bash
# View workflow logs
gh run view --log

# Rerun failed jobs
gh run rerun --failed

# Download artifacts
gh run download

# Check workflow status
gh run list
```

## 📚 Best Practices

### Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Make Changes**: Implement your feature
3. **Run Tests Locally**: `npm run test`
4. **Push & Create PR**: `git push origin feature/new-feature`
5. **Wait for CI**: All checks must pass
6. **Code Review**: Get approval from team
7. **Merge**: Merge to develop branch

### Deployment Process
1. **CI Success**: All tests and security checks pass
2. **Dev Deployment**: Automatic deployment to development
3. **Testing**: Verify functionality in dev environment
4. **Production Approval**: Manual approval required
5. **Production Deployment**: Zero-downtime deployment
6. **Verification**: Post-deployment health checks

### Security Guidelines
1. **Never commit secrets**: Use environment variables
2. **Regular updates**: Keep dependencies updated
3. **Security reviews**: Regular security assessments
4. **Access control**: Limit production access
5. **Monitoring**: Continuous security monitoring

## 🤝 Contributing

### Adding New Workflows
1. Create new workflow file in `.github/workflows/`
2. Follow naming conventions
3. Add appropriate triggers and conditions
4. Include comprehensive testing
5. Document in this README

### Modifying Existing Workflows
1. Test changes in development branch
2. Ensure backward compatibility
3. Update documentation
4. Get team approval
5. Monitor deployment success

## 📞 Support

### Team Contacts
- **DevOps Lead**: [@devops-lead](mailto:devops@pricepulse.com)
- **Security Team**: [@security-team](mailto:security@pricepulse.com)
- **Development Team**: [@dev-team](mailto:dev@pricepulse.com)

### Emergency Contacts
- **On-call Engineer**: [@oncall](mailto:oncall@pricepulse.com)
- **System Administrator**: [@sysadmin](mailto:sysadmin@pricepulse.com)

---

**Last Updated**: $(date)
**Pipeline Version**: 1.0.0
**Maintainer**: PricePulse DevOps Team
