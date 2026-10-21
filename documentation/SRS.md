# Software Requirements Specification
## Certificate Automation and Verification System

**Course:** ISWE403L — Software Configuration Management, VIT Vellore  
**Document version:** Draft 1.0  
**Status date:** 21 October 2026  
**Team:** V.Harish Kumar (24MIS0031); M.Leela Avinash (24MIS0198); S.H.Sheik Fareed (24MIS0262)

## 1. Purpose and scope

This specification describes the local demonstration system for submitting, reviewing, and recording decisions on Income, EWS, Community, Residence, and Domicile certificate applications. It digitizes the application workflow and provides preliminary validation and advisory findings for a human officer.

The system is a course prototype. It does not authenticate applicants, officers, or administrators; it is not connected to a government service and must not be used to make real eligibility decisions.

## 2. Project objectives

1. Accept certificate applications and supporting files online.
2. Validate applicant fields and configure required documents by certificate type.
3. calculate advisory risk scores and remarks using explicit project assumptions.
4. Allow an officer to inspect application data and uploaded files, then approve or reject.
5. Keep a read-only decision history with the score and remarks present at decision time.

## 3. Users and boundaries

| User type | Supported prototype actions | Boundary |
|---|---|---|
| Applicant | Enter details, choose a certificate type, upload required files, submit | No sign-in, application tracking account, or identity verification |
| Officer | View pending applications, inspect documents and advisory findings, approve/reject, view decision history | Portal is unauthenticated; officer label is explicitly unverified |
| System administrator | Read a local overview of accounts, certificate configuration, and rule weights | Read-only only; no user, rule, or certificate management |

## 4. Functional requirements

| ID | Requirement | Current implementation |
|---|---|---|
| FR-01 | Display five certificate types and their document requirements | Implemented from shared backend configuration |
| FR-02 | Accept name, email, age, certificate type, income where applicable, and files | Implemented |
| FR-03 | Reject malformed fields, invalid certificate types, invalid document types, unsupported extensions, and oversized uploads | Implemented at the API boundary |
| FR-04 | Save applicant, application, and document metadata in MongoDB; save files in uploads storage | Implemented |
| FR-05 | Calculate advisory risk score and remarks without making an automated decision | Implemented |
| FR-06 | Show only UNDER_REVIEW applications in the officer queue | Implemented |
| FR-07 | Display application details and provide a controlled document-opening route | Implemented |
| FR-08 | Accept one APPROVED or REJECTED decision per application | Implemented; repeat decisions return HTTP 409 |
| FR-09 | Write a verification record for a decision and display history | Implemented |
| FR-10 | Show a read-only administrative overview | Implemented |
| FR-11 | Authenticate users and enforce role permissions | Not implemented; future scope |
| FR-12 | Let an administrator manage accounts, rules, and certificate types | Not implemented; future scope |

## 5. Certificate and document rules

| Certificate | Required document types | Income field |
|---|---|---|
| Income | aadhaar, incomeProof | Required |
| EWS | aadhaar, incomeProof | Required |
| Community | aadhaar, communityProof | Not used |
| Residence | aadhaar, residenceProof | Not used |
| Domicile | aadhaar | Not used |

The interface requires the configured files for normal submission. The backend validates uploaded file count, extension, size, and matching document type. Missing required document types are deliberately left available to the rule engine so they can be flagged for officer review; they are not, by themselves, a backend hard rejection.

Uploads are limited to five files, 5 MB each, with PDF, JPG, JPEG, and PNG extensions. Extension checking is not antivirus scanning or content-based file verification.

## 6. Advisory assessment

All rule weights and the EWS income limit are **project assumptions, not official policy**. The current implementation adds:
- 60 for age below 18 (defensive rule; the API validator rejects age below 18).
- 50 for missing EWS income (the API validator normally rejects missing income).
- 50 when EWS income is above the assumed ₹8,00,000 threshold.
- 30 for missing Income-certificate income (the API validator normally rejects missing income).
- 40 when one or more required document types are absent.
- 30 for a possible duplicate with the same email and certificate type.

Scores are capped at 100. Missing documents add one 40-point finding, with the missing types named in remarks. Duplicate detection is a simple heuristic. Income certificates have no upper-income rule. The officer makes the final decision.

## 7. Quality and operating requirements

- Browser client: React and Vite. API server: Node.js and Express. Database: MongoDB.
- The local Compose deployment exposes the UI on port 8081, API on 5001, and MongoDB on 27018.
- The backend API is tested with Jest and Supertest; the frontend is verified with a production build and manual browser flow.
- The demonstration requires local services and is not a production-ready deployment.
- No availability, scalability, security certification, or government-policy compliance claim is made.

## 8. Assumptions and exclusions

- Rule weights, the EWS threshold, and duplicate heuristic are configuration assumptions for demonstration.
- Applicant names and files used in demonstrations are test data. Do not upload real identity documents to an unauthenticated local demo.
- Email is used as an applicant lookup/upsert key; there is no email verification.
- Authentication, authorization, notification delivery, appeals, external government integrations, and full admin management are outside the implemented scope.

## 9. Acceptance evidence

The recorded Jenkins run for commit 95c8f40 completed successfully: 32 backend tests passed in six suites, the frontend production build succeeded, and both Docker images were built. Manual end-to-end flows were confirmed by the project owner in the local application. The v1.3.0 release tag is still pending documentation completion and release integration.

