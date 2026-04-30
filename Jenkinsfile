pipeline {
    agent any

    parameters {
        string(
            name: 'GIT_TAG',
            defaultValue: '',
            description: 'Git tag ที่จะ build และ deploy (เช่น v1.0.8)'
        )
    }

    environment {
        IMAGE_NAME = 'tang-ty'
    }

    stages {
        stage('Validate') {
            steps {
                script {
                    if (!params.GIT_TAG?.trim()) {
                        error('❌ กรุณาระบุ GIT_TAG เช่น v1.0.8')
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "refs/tags/${params.GIT_TAG}"]],
                    userRemoteConfigs: scm.userRemoteConfigs,
                    extensions: [[$class: 'CleanBeforeCheckout']]
                ])
            }
        }

        stage('Build Image') {
            steps {
                sh """
                    docker build \
                        -t ${IMAGE_NAME}:${params.GIT_TAG} \
                        -t ${IMAGE_NAME}:latest \
                        .
                """
            }
        }

        stage('Deploy') {
            steps {
                sh "docker compose up -d --force-recreate"
            }
        }

        stage('Verify') {
            steps {
                sleep(time: 10, unit: 'SECONDS')
                sh "docker inspect --format='{{.State.Status}}' tang-ty | grep -q running"
            }
        }

        stage('Cleanup') {
            steps {
                // ลบ dangling images (untagged) เพื่อประหยัด disk
                sh "docker image prune -f"
            }
        }
    }

    post {
        success {
            echo "✅ tang-ty ${params.GIT_TAG} deployed สำเร็จ!"
        }
        failure {
            echo "❌ Deploy ล้มเหลว กรุณาตรวจสอบ logs"
            sh "docker logs tang-ty --tail=50 || true"
        }
    }
}
