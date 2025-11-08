# BonFire Deployment Guide

## Overview

This guide covers deploying BonFire to various environments: development, staging, and production.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- PostgreSQL 15+
- Domain name (for production)
- SSL certificate (for production)

## Environment Configuration

### Development

```bash
# .env.development
NODE_ENV=development
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/bonfire
```

### Staging

```bash
# .env.staging
NODE_ENV=staging
API_URL=https://api-staging.bonfire.dev
WEB_URL=https://staging.bonfire.dev
DATABASE_URL=postgresql://user:pass@staging-db.internal:5432/bonfire
```

### Production

```bash
# .env.production
NODE_ENV=production
API_URL=https://api.bonfire.dev
WEB_URL=https://bonfire.dev
DATABASE_URL=postgresql://user:pass@prod-db.internal:5432/bonfire
```

## Deployment Methods

### Method 1: Docker Compose (Recommended for Development)

#### 1. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

#### 2. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### 3. Initialize Database

```bash
# Run migrations
docker-compose exec api npm run db:migrate

# Seed data (optional)
docker-compose exec api npm run db:seed
```

#### 4. Access Applications

- Web App: http://localhost:3000
- API: http://localhost:3001
- API Health: http://localhost:3001/health

### Method 2: Kubernetes (Recommended for Production)

#### 1. Create Kubernetes Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: bonfire
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bonfire-config
  namespace: bonfire
data:
  API_URL: "https://api.bonfire.dev"
  WEB_URL: "https://bonfire.dev"
```

```yaml
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: bonfire-secrets
  namespace: bonfire
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/bonfire"
  GITHUB_TOKEN: "ghp_xxxxxxxxxxxx"
  ANTHROPIC_API_KEY: "sk-ant-xxxxxxxxxxxx"
```

#### 2. Deploy Database

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: bonfire
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: bonfire-secrets
              key: POSTGRES_PASSWORD
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

#### 3. Deploy API

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonfire-api
  namespace: bonfire
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bonfire-api
  template:
    metadata:
      labels:
        app: bonfire-api
    spec:
      containers:
      - name: api
        image: bonfire/api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: bonfire-config
        - secretRef:
            name: bonfire-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 4. Deploy Frontend

```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bonfire-web
  namespace: bonfire
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bonfire-web
  template:
    metadata:
      labels:
        app: bonfire-web
    spec:
      containers:
      - name: web
        image: bonfire/web:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: bonfire-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

#### 5. Create Services

```yaml
# k8s/services.yaml
apiVersion: v1
kind: Service
metadata:
  name: bonfire-api
  namespace: bonfire
spec:
  selector:
    app: bonfire-api
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
---
apiVersion: v1
kind: Service
metadata:
  name: bonfire-web
  namespace: bonfire
spec:
  selector:
    app: bonfire-web
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

#### 6. Configure Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: bonfire-ingress
  namespace: bonfire
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - bonfire.dev
    - api.bonfire.dev
    secretName: bonfire-tls
  rules:
  - host: bonfire.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bonfire-web
            port:
              number: 3000
  - host: api.bonfire.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: bonfire-api
            port:
              number: 3001
```

#### 7. Apply Manifests

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets and config
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy database
kubectl apply -f k8s/postgres.yaml

# Deploy applications
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml

# Create services
kubectl apply -f k8s/services.yaml

# Configure ingress
kubectl apply -f k8s/ingress.yaml
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy BonFire

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Build applications
      run: npm run build

    - name: Build Docker images
      run: |
        docker build -t bonfire/web:${{ github.sha }} ./apps/web
        docker build -t bonfire/api:${{ github.sha }} ./apps/api

    - name: Push to registry
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker push bonfire/web:${{ github.sha }}
        docker push bonfire/api:${{ github.sha }}

    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/api-deployment.yaml
          k8s/web-deployment.yaml
        images: |
          bonfire/web:${{ github.sha }}
          bonfire/api:${{ github.sha }}
```

## Monitoring & Logging

### Prometheus & Grafana

```yaml
# k8s/monitoring.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: bonfire
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'bonfire-api'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_label_app]
            action: keep
            regex: bonfire-api
```

### Logging with ELK Stack

```bash
# Install Elasticsearch, Logstash, Kibana
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n bonfire
helm install kibana elastic/kibana -n bonfire
```

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups
kubectl create cronjob postgres-backup \
  --schedule="0 2 * * *" \
  --image=postgres:15-alpine \
  -- pg_dump -h postgres -U postgres bonfire > /backups/bonfire-$(date +%Y%m%d).sql
```

### Disaster Recovery

1. **Database:** Restore from latest backup
2. **Application:** Redeploy from Docker images
3. **Configuration:** Restore from git repository

## Security

### SSL/TLS

Use Let's Encrypt with cert-manager:

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Secrets Management

Use Kubernetes secrets or external secret managers (AWS Secrets Manager, HashiCorp Vault).

### Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: bonfire-network-policy
  namespace: bonfire
spec:
  podSelector:
    matchLabels:
      app: bonfire-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: bonfire-web
    ports:
    - protocol: TCP
      port: 3001
```

## Scaling

### Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: bonfire-api-hpa
  namespace: bonfire
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: bonfire-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Troubleshooting

### Check Logs

```bash
# Pod logs
kubectl logs -n bonfire deployment/bonfire-api

# Streaming logs
kubectl logs -n bonfire -f deployment/bonfire-api
```

### Debug Pod

```bash
# Get pod status
kubectl get pods -n bonfire

# Describe pod
kubectl describe pod -n bonfire <pod-name>

# Execute command in pod
kubectl exec -it -n bonfire <pod-name> -- /bin/sh
```

### Database Connection Issues

```bash
# Test database connection
kubectl exec -it -n bonfire <api-pod> -- npm run db:test
```

## Performance Optimization

1. **CDN:** Use CloudFlare or AWS CloudFront for static assets
2. **Caching:** Implement Redis for API caching
3. **Database:** Enable connection pooling
4. **Images:** Optimize Docker images (multi-stage builds)

## Rollback

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/bonfire-api -n bonfire

# Rollback to specific revision
kubectl rollout undo deployment/bonfire-api --to-revision=2 -n bonfire
```
