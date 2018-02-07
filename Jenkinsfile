pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'node -v'
        sh 'npm install'
        sh 'npm install bcrypt --save'
        sh 'node app.js &'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}