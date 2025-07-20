module.exports = {
  apps: [
    {
      name: 'ai-chat',
      script: './server/index.mjs',
      cwd: '/var/www/ai-chat',
      // env_file: './.env.production', // had no effect
      instances: 1, // No clustering
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      // user: 'deploy', // only applicable if user is root
      out_file: '~/.pm2/ai-chat/out.log',
      error_file: '~/.pm2/ai-chat/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      combine_logs: true,
    },
  ],
}
