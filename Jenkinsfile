pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh '''node -v
npm install
npm install bcrypt --save
npm install -g firebase-tools
node app.js &'''
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}