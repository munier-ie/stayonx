module.exports = {
  apps: [
    {
      name: 'stayonx-frontend',
      script: 'npm',
      args: 'run preview -- --host 0.0.0.0 --port 3000',
      cwd: '/home/ubuntu/stayonx/frontend',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'stayonx-backend',
      script: 'api/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3030
      }
    }
  ]
};
