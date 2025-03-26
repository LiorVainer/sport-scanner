module.exports = {
  apps : [{
    name   : "project_server",
    script : "./dist/app.js",
    env_production: {
      NODE_ENV: "production"
    }
  }]
}
