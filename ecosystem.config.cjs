module.exports = {
  apps: [
    {
      name: 'stayonx-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/ubuntu/stayonx',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'stayonx-backend',
      script: 'api/index.js',
      cwd: '/home/ubuntu/stayonx',
      env: {
        NODE_ENV: 'production',
        PORT: 3030
      }
    }
  ]
};
