pipeline {
    agent any

    triggers {
        pollSCM('H/1 * * * *')
    }

    options {
        skipDefaultCheckout(true)
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'cd backend && npm ci'
                bat 'cd frontend && npm ci'
            }
        }

        stage('Test') {
            steps {
                bat 'cd backend && npm test'
            }
        }

        stage('Build frontend') {
            steps {
                bat 'cd frontend && npm run build'
            }
        }

        stage('Docker build') {
            steps {
                bat 'docker --version'
                bat 'docker build -t certificate-backend:v1.3.0 backend'
                bat 'docker build --build-arg VITE_API_URL=/api -t certificate-frontend:v1.3.0 frontend'
            }
        }
    }

    post {
        success {
            echo 'Checkout, tests, frontend build, and Docker image builds completed.'
        }
        failure {
            echo 'Pipeline failed. Review the stage logs before treating this commit as verified.'
        }
    }
}