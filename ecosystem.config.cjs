module.exports = {
  apps: [
    {
      name: 'stayonx-frontend',
      script: 'npm',
      args: 'run preview',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
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
