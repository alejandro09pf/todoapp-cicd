# ToDoApp – CICD Challenge

Fork of [Jospina1001/ToDoApp](https://github.com/Jospina1001/ToDoApp) with full CI/CD pipeline using **GitHub Actions** and **Gitflow**.

## Stack
- **App**: Node.js 18 + Express
- **DB**: MySQL 8 (SQLite for local/test)
- **Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Infra**: Vagrant + VirtualBox

## Branch Strategy (Gitflow)
| Branch | Purpose | Pipeline |
|--------|---------|----------|
| `main` | Production | CD: test → build → push → deploy |
| `develop` | Integration | CI: test → build (no push) |
| `feature/*` | New features | CI: test → build (no push) |
| `release/*` | Release prep | CD: test → build → push → deploy |
| `bugfix/*` | Bug fixes | CI: test → build |
| `hotfix/*` | Prod hotfixes | CD: test → build → push → deploy |

## GitHub Secrets Required
| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `MYSQL_USER` | Database user |
| `MYSQL_PASSWORD` | Database password |
| `MYSQL_DB` | Database name |
| `MYSQL_ROOT_PASSWORD` | MySQL root password |

## Local Setup
```bash
# 1. Copy and fill env file
cp .env.example .env

# 2. Start all services
docker compose up -d --build

# 3. App is available at http://localhost (via Nginx)
```

## Running Tests
```bash
yarn install
yarn test
```

## VM Setup

### Dev/Build VM
```bash
cd vagrant-ubuntu
vagrant up
vagrant ssh
```

### Deploy VM (GitHub Actions Runner)
```bash
cd vagrant-deploy
vagrant up
vagrant ssh

# Inside VM – register the runner:
cd /opt/actions-runner
./config.sh --url https://github.com/<USER>/<REPO> --token <TOKEN>
sudo ./svc.sh install vagrant
sudo ./svc.sh start
```

## CI/CD Pipeline

```
feature/* or develop → push → CI
  ├── test (yarn test --ci)
  └── build (docker build, no push)

main or release/* → push → CD
  ├── test
  ├── build + push to Docker Hub
  └── deploy (self-hosted runner)
        ├── docker compose pull
        ├── docker compose up -d
        └── health check
```
