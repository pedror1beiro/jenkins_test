pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                dir('server') {
                    sh 'npm ci && npm test'
                }
            }
        }
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
        stage('Deploy') {
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=accept-new root@172.236.9.181 'docker pull p3droribeiro21/jenkins-demo:${BUILD_NUMBER} && docker rm -f web || true && docker run -d --name web -p 80:80 p3droribeiro21/jenkins-demo:${BUILD_NUMBER}'
                """
            }
        }
    }
}