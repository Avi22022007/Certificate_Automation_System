# Evidence register

Evidence files in this directory are original screenshots from the local Jenkins run. The Jenkins job used the `feature/docker-jenkins-admin` branch and checked out commit `95c8f40` on October 21, 2026.

| Evidence ID | Evidence requested | Current evidence/status |
|---|---|---|
| EV-01 | Jenkins green build and console output | `jenkins-build-03-summary.png` shows build #3 marked successful and the checked-out commit. `jenkins-build-03-console-success.png` shows the pipeline completion message and `Finished: SUCCESS`. `jenkins-build-03-start.png` records the start and checkout context. |
| EV-02 | Docker image tags and running containers | Jenkins success was reported to build `certificate-backend:v1.3.0` and `certificate-frontend:v1.3.0`. The console screenshot visibly confirms the frontend tag; retain a full console log or image listing to evidence both tags together. Running-container evidence is still pending. |
| EV-03 | Docker-hosted application and application form | Owner confirmed the local Docker UI flow; screenshot evidence is still pending. |
| EV-04 | Submission persisted in MongoDB | Owner confirmed an earlier MongoDB observation; screenshot evidence is still pending. |
| EV-05 | Officer review, opened document, and decision history | Owner confirmed these flows; screenshot evidence is still pending. |
| EV-06 | Git release history and tags | Capture after v1.3.0 is merged into `develop` and `main` and tagged. Existing tags are v1.0.0, v1.1.0, and v1.2.0. |

Use synthetic test data and redact personal contact details from future screenshots.
