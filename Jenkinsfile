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
                sh 'docker build -t jenkins-demo-server:$BUILD_NUMBER ./server'
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
                        docker tag jenkins-demo-server:$BUILD_NUMBER $DOCKER_USER/jenkins-demo-server:$BUILD_NUMBER
                        docker push $DOCKER_USER/jenkins-demo-server:$BUILD_NUMBER
                    '''
                }
            }
        }
        stage('Deploy dev') {
            when { branch 'dev' }
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=accept-new root@172.236.9.181 'docker network create appnet || true && docker pull p3droribeiro21/jenkins-demo:${BUILD_NUMBER} && docker pull p3droribeiro21/jenkins-demo-server:${BUILD_NUMBER} && docker rm -f web-dev api-dev || true && docker run -d --name api-dev --network appnet p3droribeiro21/jenkins-demo-server:${BUILD_NUMBER} && docker run -d --name web-dev --network appnet -p 8080:80 p3droribeiro21/jenkins-demo:${BUILD_NUMBER}'
                """
            }
        }
        stage('Deploy prod') {
            when { branch 'main' }
            steps {
                sh """
                    ssh -o StrictHostKeyChecking=accept-new root@172.236.9.181 'docker network create appnet || true && docker pull p3droribeiro21/jenkins-demo:${BUILD_NUMBER} && docker pull p3droribeiro21/jenkins-demo-server:${BUILD_NUMBER} && docker rm -f web api || true && docker run -d --name api --network appnet p3droribeiro21/jenkins-demo-server:${BUILD_NUMBER} && docker run -d --name web --network appnet -p 80:80 p3droribeiro21/jenkins-demo:${BUILD_NUMBER}'
                """
            }
        }
    }
}