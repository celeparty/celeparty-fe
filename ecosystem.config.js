module.exports = {
  apps: [
    {
      name: "celeparty.com",
      script: "npm",
      args: "run start",
      cwd: "/var/www/celeparty.com/celeparty-fe",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
};
