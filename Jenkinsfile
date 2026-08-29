pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                sh 'ls -la client'
            }
        }
        stage('Docker check') {
            steps {
                sh 'docker --version && docker ps'
            }
        }
    }
}