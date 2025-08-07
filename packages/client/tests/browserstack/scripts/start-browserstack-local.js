/**
 * BrowserStack Local Connection Script
 * Starts BrowserStack Local tunnel for localhost testing
 */

const { Local } = require('browserstack-local');
const chalk = require('chalk');
const config = require('../../../browserstack.config.js');

class BrowserStackLocalManager {
  constructor() {
    this.local = null;
  }

  async start() {
    console.log(chalk.blue('🚀 Starting BrowserStack Local tunnel...'));
    
    this.local = new Local();
    
    const localOptions = {
      key: config.BROWSERSTACK_ACCESS_KEY,
      localIdentifier: config.LOCAL_IDENTIFIER,
      verbose: true,
      force: true,
      forceLocal: true,
      onlyAutomate: true,
      // Additional options for banking app testing
      proxyHost: process.env.PROXY_HOST || undefined,
      proxyPort: process.env.PROXY_PORT || undefined,
      proxyUser: process.env.PROXY_USER || undefined,
      proxyPass: process.env.PROXY_PASS || undefined,
    };

    // Remove undefined values
    Object.keys(localOptions).forEach(key => 
      localOptions[key] === undefined && delete localOptions[key]
    );

    return new Promise((resolve, reject) => {
      this.local.start(localOptions, (error) => {
        if (error) {
          console.error(chalk.red('❌ BrowserStack Local failed to start:'), error);
          reject(error);
        } else {
          console.log(chalk.green('✅ BrowserStack Local tunnel established'));
          console.log(chalk.yellow(`📍 Local identifier: ${config.LOCAL_IDENTIFIER}`));
          console.log(chalk.yellow('📍 Local URL: http://localhost:4002'));
          console.log(chalk.cyan('🔗 Tunnel is ready for testing'));
          
          // Keep the process alive
          process.on('SIGINT', () => {
            console.log(chalk.yellow('\n🛑 Received SIGINT, stopping BrowserStack Local...'));
            this.stop().then(() => process.exit(0));
          });
          
          process.on('SIGTERM', () => {
            console.log(chalk.yellow('\n🛑 Received SIGTERM, stopping BrowserStack Local...'));
            this.stop().then(() => process.exit(0));
          });
          
          resolve();
        }
      });
    });
  }

  async stop() {
    if (this.local && this.local.isRunning()) {
      console.log(chalk.blue('🛑 Stopping BrowserStack Local tunnel...'));
      
      return new Promise((resolve) => {
        this.local.stop((error) => {
          if (error) {
            console.warn(chalk.yellow('⚠️ BrowserStack Local stop warning:'), error);
          } else {
            console.log(chalk.green('✅ BrowserStack Local tunnel stopped'));
          }
          resolve();
        });
      });
    }
  }

  isRunning() {
    return this.local && this.local.isRunning();
  }
}

// Run if called directly
if (require.main === module) {
  const manager = new BrowserStackLocalManager();
  
  manager.start()
    .then(() => {
      console.log(chalk.green('\n🎉 BrowserStack Local is running!'));
      console.log(chalk.cyan('Press Ctrl+C to stop the tunnel'));
      
      // Keep process alive
      const keepAlive = setInterval(() => {
        if (!manager.isRunning()) {
          console.log(chalk.red('❌ Tunnel disconnected unexpectedly'));
          clearInterval(keepAlive);
          process.exit(1);
        }
      }, 30000);
      
    })
    .catch((error) => {
      console.error(chalk.red('💥 Failed to start BrowserStack Local:'), error);
      process.exit(1);
    });
}

module.exports = BrowserStackLocalManager;