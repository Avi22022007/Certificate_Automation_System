# Certificate Automation and Verification System

ISWE403L — Software Configuration Management project, VIT Vellore.

A local web prototype for certificate application submission, advisory validation, officer review, and decision history. It supports Income, EWS, Community, Residence, and Domicile certificates.

## Implemented workflow

- Applicant form with certificate-specific document requirements and upload.
- Express API with field/file validation and MongoDB persistence.
- Advisory risk score and remarks. The officer makes the final decision.
- Officer queue, application detail, controlled document route, approve/reject, and decision history.
- Read-only system-administrator overview.
- Docker Compose deployment and Jenkins pipeline for backend tests, frontend build, and Docker image builds.

This project is an unauthenticated local demo. Do not use real personal documents or expose it to a public network. Rule weights and the EWS threshold are project assumptions, not official policy. Full administrator management and authentication are future scope.

## Run locally with Docker

From Windows Command Prompt:

    docker compose up -d

Open http://localhost:8081. Service ports are frontend 8081, backend 5001, MongoDB 27018. Docker Compose stores database and uploads in named volumes.

To stop services without deleting data:

    docker compose down

## Run development servers

1. Create backend/.env from backend/.env.example and set a local MongoDB URI.
2. In one Command Prompt, run from backend:

       npm ci
       npm start

3. In another Command Prompt, run from frontend:

       npm ci
       npm run dev

Open the Vite address shown by the terminal (normally http://localhost:5173). The direct backend defaults to port 5000.

## Test and build

Backend tests:

    cd backend
    npm ci
    npm test

Frontend production build:

    cd frontend
    npm ci
    npm run build

Jenkins pipeline stages: Checkout, Install, Test, Build frontend, Docker build. The recorded successful run on commit 95c8f40 passed 32 backend tests in six suites, built the frontend, and built certificate-backend:v1.3.0 and certificate-frontend:v1.3.0.

## Release state

Annotated Git tags v1.0.0, v1.1.0, and v1.2.0 exist. The current feature/docker-jenkins-admin branch contains the v1.3 candidate. Its images were built successfully, but v1.3.0 has not yet been merged into develop/main or tagged.

## Documentation

- [SRS](documentation/SRS.md)
- [System design](documentation/design-document.md)
- [SCM configuration records](documentation/scm-configuration-records.md)
- [Verification and audit report](documentation/verification-and-audit.md)
- [User manual](documentation/user-manual.md)
- [Evidence register](documentation/evidence/README.md)

