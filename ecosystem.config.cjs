module.exports = {
  apps: [
    {
      name: 'stayonx-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/stayonx/frontend',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'stayonx-backend',
      script: 'api/index.js',
      cwd: '/var/www/stayonx/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3030
      }
    }
  ]
};
