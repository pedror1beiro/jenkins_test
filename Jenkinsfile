pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t jenkins-demo:$BUILD_NUMBER ./client'
            }
        }
    }
}