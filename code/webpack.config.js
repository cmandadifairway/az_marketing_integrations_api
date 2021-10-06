module.exports =(env) => { 
    if(env === 'dev')  return require('./config/webpack-dev.config.js');
    return require('./config/webpack-prod.config.js')
  };
  