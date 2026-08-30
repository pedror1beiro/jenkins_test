# jenkins_test

A learning project for building a CI/CD pipeline with Jenkins, Docker and two Linode nodes.

Built over a weekend to learn the tool. The application is deliberately minimal; the purpose of the repository is the pipeline around it: writing a Jenkinsfile from scratch, understanding what each stage does, and getting a commit to reach a running container on a separate machine without manual steps. The multibranch setup exists to exercise branch-gated deploys rather than to model a real release process.

## Application

A static client and a Node API, served together behind nginx.

| Path | Contents |
|---|---|
| `client/` | Static HTML, CSS and JavaScript served by nginx, plus the nginx config that proxies `/api` to the backend. |
| `server/` | Express API (`src/`) and Jest tests (`tests/`). Exposes `/api/health` and `/api/db-time`. |
| `Jenkinsfile` | Declarative pipeline definition, read by Jenkins from source control. |

`/api/health` responds without a database. `/api/db-time` requires Postgres and returns a `DB_ERROR` response when `DATABASE_URL` is unset, which is the expected behaviour here.

## Infrastructure

Two Linode instances with separate responsibilities:

**Jenkins node** runs the Jenkins controller and holds the Docker CLI, Node and npm needed to test and build. It never serves the application.

**Docker node** runs the application containers. It has only Docker installed, receives an SSH command from Jenkins, and pulls its images from Docker Hub rather than building them.

Jenkins authenticates to the Docker node with an SSH key pair belonging to the `jenkins` user. Docker Hub credentials live in Jenkins' system credential store and are injected at runtime through `withCredentials`, so no secret is committed to this repository.

## Pipeline

The job is a multibranch pipeline, so Jenkins creates a build for each branch and `env.BRANCH_NAME` is available to gate stages.

| Stage | What it does |
|---|---|
| Test | `npm ci && npm test` in `server/`. A failing test stops the pipeline before anything is built. |
| Build | Builds the client and server images, tagged with `$BUILD_NUMBER`. |
| Push | Authenticates to Docker Hub and pushes both images. |
| Deploy dev | Runs only on `dev`. Deploys `web-dev` and `api-dev`, with the client on port 8080. |
| Deploy prod | Runs only on `main`. Deploys `web` and `api`, with the client on port 80. |

The two deploy stages are gated with `when { branch '...' }`, so a single Jenkinsfile serves both environments. `main` is production; work happens on `dev` and reaches production by merging.

Containers share a user-defined Docker network (`appnet`) so nginx can reach the API by container name (`http://api:3000`). Without that network, name resolution between containers does not work.

## Verifying a deployment

```bash
curl http://<docker-node-ip>/api/health
```

A `200` carrying `X-Powered-By: Express` confirms nginx is proxying to the Node container rather than serving a static file.

## Known limitations

Both environments run on the same host and share `appnet`, so the dev client proxies to the production API. Real isolation would need separate networks or a configurable upstream.

Postgres is not deployed, so `/api/db-time` returns an error by design.

Builds are triggered manually. No webhook is configured, which would require Jenkins to be reachable from GitHub.

The Docker node accumulates one image per build and will eventually fill its disk; `docker image prune -a` clears it.

## Notes

Blue Ocean is deprecated and is not used here. Pipeline visualisation comes from the standard Jenkins UI.
