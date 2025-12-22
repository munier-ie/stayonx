module.exports = {
  apps: [
    {
      name: 'stayonx-frontend',
      script: 'npm',
      args: 'run dev:frontend',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'stayonx-backend',
      script: 'api/index.js',
      watch: ['api'],
      env: {
        NODE_ENV: 'development',
        PORT: 3050
      }
    }
  ]
};
