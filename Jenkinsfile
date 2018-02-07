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
    stage('Post Build') {
      steps {
        mail(subject: 'Build succeeded', body: 'Express Mongo Auth has suceeded its pipeline.', to: 'lucas.santos@btgpactual.com')
      }
    }
  }
}