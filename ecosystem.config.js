module.exports = {
  apps: [
    {
      name: 'sia-handshake-gateway',
      script: './lib/index.js',
      instance_var: 'PM2_INSTANCE_ID',
      exec_mode: 'cluster',
      instances: '1',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
