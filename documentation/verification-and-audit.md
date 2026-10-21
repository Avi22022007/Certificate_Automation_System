# Verification, Audit, and Test Report
## Certificate Automation and Verification System

**Version:** Draft 1.0  
**Status date:** 21 October 2026

## 1. Verification checklist

| No. | Check | Result | Evidence / qualification |
|---|---|---|---|
| 1 | Every CI has a unique name and version | Verified with scope note | Eight Review-I CI categories are in scm-configuration-records.md; v1.3 docs are Draft |
| 2 | Every change had CCB approval before merge | Not verifiable | Review-II reports approval for CR-01 to CR-03; no meeting minutes found; CR-04/05 approval after review is not evidenced |
| 3 | Code and documents were reviewed against SRS/design | Partially verified | Implemented routes and UI match the current design; this SRS/design set is prepared after implementation and lacks signed review |
| 4 | Tests and build run in Jenkins | Verified for latest run | Commit 95c8f40: 6 suites, 32 tests passed; Vite build succeeded |
| 5 | Repository, build, and release versions match | Partially verified | v1.0.0–v1.2.0 are tagged; v1.3.0 image tags were built; Git v1.3.0 release tag is still pending |
| 6 | User manual matches the delivered system | Draft available | user-manual.md describes current implementation; final team review and approval pending |

## 2. Functional Configuration Audit (FCA)

FCA asks whether the delivered software performs the required functions. This is a project-level checklist, not an independent certification.

| No. | Audit question | Answer | Reason |
|---|---|---|---|
| 1 | Are all Review-I requirements implemented? | No / partial | User and officer workflows, advisory assessment, history, and a read-only admin overview exist. Authentication and full administrator management do not. |
| 2 | Are functional test cases available? | Yes, with limits | 32 backend tests pass in six suites. UI, database persistence, Docker proxy, file viewing, and decision history were manually demonstrated; automated browser tests are not present. |
| 3 | Are major defects resolved? | Not formally established | No severity-ranked defect register or independent exit review was found. Jenkins succeeded; this alone is not a defect audit. |
| 4 | Do implemented features match the design? | Partially | The architecture and data flow documented here reflect the current code; formal design approval is not recorded. |

## 3. Physical Configuration Audit (PCA)

| Item | Present? | Version/status | Remarks |
|---|---|---|---|
| Source code | Yes | v1.2.0 released; v1.3 candidate | Git feature branch contains final integration work |
| SRS | Yes | Draft 1.0 | Created in this documentation set; not formally approved |
| Design document | Yes | Draft 1.0 | Created in this documentation set; no signed review |
| Database models | Yes | Current schema in backend/models | users, certificates, verificationrecords |
| Test cases and test report | Yes | 32 passing in latest Jenkins run | Backend suite; no automated frontend test suite |
| User manual | Yes | Draft 1.0 | Needs team review |
| Release package/images | Yes | Candidate v1.3.0 images | Both images built by Jenkins; v1.3.0 Git release tag pending |
| Evidence screenshots | Owner reports captured | Not located under documentation/evidence during repository inventory | Copy screenshots into the evidence folder before final submission |

## 4. Test execution report

### Automated backend tests

| Run | Environment | Result |
|---|---|---|
| Jenkins run for commit 95c8f40 | Node v24.22.0; npm 11.19.1; Windows Jenkins agent | 6 suites passed; 32 tests passed; 0 snapshots |
| Frontend production build in same run | Vite 8.3.4 | Build succeeded; 499 modules transformed |
| Docker image build in same run | Docker 29.9.1 | Backend and frontend images built and tagged v1.3.0 |

The Jest suites cover admin routes, application routes, application validation, health, officer routes, and rule-engine behavior. The expected simulated database/history failures are logged by negative-path tests; they did not fail the run.

### Manual system verification reported by project owner

- Application submission succeeded and was visible in MongoDB.
- Certificate types and required documents were displayed in the form.
- Officer review page displayed applicant data and advisory findings.
- A linked uploaded document opened through the controlled route.
- Approving an application returned to the review queue and created a history entry.
- A second decision on a completed application returned HTTP 409.
- The Docker-hosted application loaded at port 8081; application, review, document, decision, and history flows were confirmed.
- These were manual demonstrations. Screenshots should be committed under documentation/evidence so a reviewer can inspect them.

### Non-blocking tool output

The Jenkins run reported 22 backend npm dependency audit findings (19 moderate, 3 high). It also warned that Docker’s legacy image builder is deprecated. The build succeeded, but neither item should be described as a clean security audit or a future-proof Docker build configuration.

## 5. Audit conclusion

The v1.3 candidate has evidence of passing backend tests, frontend production build, Docker image creation, and owner-confirmed local end-to-end flows. The v1.3.0 Git baseline is not yet released. Formal CCB evidence, signed document review, screenshot files in the repository, authentication, and full admin management remain gaps or explicit scope limitations.

