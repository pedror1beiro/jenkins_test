pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'docker build -t jenkins-demo:$BUILD_NUMBER ./client'
            }
        }
        stage('Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker tag jenkins-demo:$BUILD_NUMBER $DOCKER_USER/jenkins-demo:$BUILD_NUMBER
                        docker push $DOCKER_USER/jenkins-demo:$BUILD_NUMBER
                    '''
                }
            }
        }
    }
}