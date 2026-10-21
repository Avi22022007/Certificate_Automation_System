# User Manual
## Certificate Automation and Verification System

**Version:** Draft 1.0  
**Status date:** 21 October 2026  
**Audience:** Applicants, demo officers, and project evaluators

## 1. Before you start

This is an unauthenticated local course demonstration. Use only synthetic applicant data and sample documents. Do not upload real Aadhaar, income, community, residence, or other identity records. The displayed risk assessment is advisory and is not an official eligibility decision.

## 2. Start the Docker demonstration

From Windows Command Prompt:

    cd /d C:\Users\avied\Documents\certificate-automation-system
    docker compose up -d

Open http://localhost:8081. To check that the three services are running, use:

    docker compose ps

To stop the containers while keeping MongoDB and upload data:

    docker compose down

Do not add the -v option unless you intentionally want to delete the persistent Compose volumes.

For direct development instead, start the backend from backend with npm start and the frontend from frontend with npm run dev. The Vite address is http://localhost:5173 and the backend defaults to port 5000. Do not run both Docker and direct development on conflicting ports without changing configuration.

## 3. Submit an application

1. From the role-selection page, choose User Portal.
2. Enter a name, email, age from 18 through 120, and a certificate type.
3. Enter annual income for Income or EWS.
4. Upload each document shown for the selected certificate type.
5. Use PDF, JPG, JPEG, or PNG files, no larger than 5 MB each.
6. Submit. A success message confirms the application was recorded. The application enters UNDER_REVIEW.

Required documents are Aadhaar for every certificate; Income and EWS also require incomeProof; Community requires communityProof; Residence requires residenceProof. Domicile requires Aadhaar only.

## 4. Review and decide as the demo officer

1. Choose Officer Portal.
2. The queue lists applications awaiting review. Use Refresh to reload.
3. Choose Review to see applicant details, certificate type, income when applicable, submission time, risk score, remarks, and uploaded files.
4. Choose Open document to inspect a file.
5. Choose Approve or Reject, then confirm the decision.
6. The application leaves the pending queue. Review History to see the decision, demo officer label, risk score at decision, remarks, and timestamp.

A decision can be made once. A subsequent API decision attempt is blocked with HTTP 409.

## 5. Interpret the advisory assessment

The score is a project heuristic that helps organize review. It is not an approval/rejection result. The officer must inspect the application and documents and make the decision. The ₹8,00,000 EWS threshold and every point weight are project assumptions, not official policy. The system applies no upper-income rule to Income certificates.

Possible findings include an assumed-threshold EWS issue, missing required document types, and a possible duplicate matching email plus certificate type. The duplicate check is only a simple heuristic.

## 6. System Administrator Overview

Choose Admin Portal to view user account rows, certificate/document configuration, and advisory rule weights. The page is read-only. It does not create accounts, edit rules, authenticate identities, or grant permissions.

## 7. Troubleshooting

- “Could not load” messages: verify the backend and MongoDB containers are running with docker compose ps.
- UI is unavailable: confirm frontend service is up and use port 8081.
- API is unavailable: check backend service logs with docker compose logs backend.
- Document does not open: check that the application’s uploads volume is mounted and that the requested file belongs to that application.
- New local test data is absent in Docker: Docker uses its own MongoDB volume, separate from a direct local MongoDB service.

## 8. Known limitations

There is no sign-in, role enforcement, email verification, production data protection, deployment, or full administrative management. The officer identity is stored as “Local demo officer (unverified)”. The system must remain a local demonstration until those controls are designed and implemented.

