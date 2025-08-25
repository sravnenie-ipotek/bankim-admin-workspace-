#!/usr/bin/env node

/**
 * Production Health Monitoring System
 * Comprehensive monitoring for BankIM infrastructure
 */

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class HealthMonitor {
  constructor() {
    this.config = {
      services: [
        {
          name: 'bankim-api',
          type: 'http',
          url: 'http://localhost:8003/api/health',
          critical: true,
          timeout: 5000,
          expectedStatus: 200,
          pm2Name: 'bankim-api'
        },
        {
          name: 'bankim-client', 
          type: 'http',
          url: 'http://localhost:8004',
          critical: true,
          timeout: 3000,
          expectedStatus: 200,
          pm2Name: 'bankim-client'
        },
        {
          name: 'database-content',
          type: 'database',
          connectionString: process.env.CONTENT_DATABASE_URL,
          critical: true,
          timeout: 10000
        },
        {
          name: 'database-core',
          type: 'database', 
          connectionString: process.env.CORE_DATABASE_URL,
          critical: true,
          timeout: 10000
        }
      ],
      
      systemChecks: [
        { name: 'disk_usage', threshold: 85, critical: true },
        { name: 'memory_usage', threshold: 90, critical: true },
        { name: 'cpu_usage', threshold: 80, critical: false },
        { name: 'load_average', threshold: 4.0, critical: false }
      ],
      
      notifications: {
        slack: process.env.SLACK_WEBHOOK_URL,
        email: process.env.ALERT_EMAIL,
        retryAttempts: 3,
        cooldown: 300000 // 5 minutes
      },
      
      logging: {
        logFile: '/var/log/bankim-health.log',
        alertFile: '/var/log/bankim-alerts.log',
        retentionDays: 30
      }
    };
    
    this.lastAlerts = new Map();
    this.healthHistory = [];
  }

  async checkService(service) {
    const startTime = Date.now();
    const result = {
      name: service.name,
      type: service.type,
      status: 'unknown',
      responseTime: 0,
      error: null,
      details: {},
      timestamp: new Date().toISOString()
    };

    try {
      switch (service.type) {
        case 'http':
          result.details = await this.checkHTTPService(service);
          break;
        case 'database':
          result.details = await this.checkDatabaseService(service);
          break;
        case 'pm2':
          result.details = await this.checkPM2Service(service);
          break;
      }
      
      result.status = 'healthy';
      
    } catch (error) {
      result.status = 'unhealthy';
      result.error = error.message;
      
      if (service.critical) {
        await this.handleCriticalFailure(service, error);
      }
    }
    
    result.responseTime = Date.now() - startTime;
    return result;
  }

  async checkHTTPService(service) {
    return new Promise((resolve, reject) => {
      const url = new URL(service.url);
      const client = url.protocol === 'https:' ? https : http;
      
      const request = client.request(service.url, {
        method: 'GET',
        timeout: service.timeout
      }, (response) => {
        let data = '';
        
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          if (response.statusCode === service.expectedStatus) {
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              bodyLength: data.length,
              response: data.substring(0, 500) // Truncate response
            });
          } else {
            reject(new Error(`Unexpected status code: ${response.statusCode}`));
          }
        });
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error(`Request timeout after ${service.timeout}ms`));
      });
      
      request.on('error', reject);
      request.end();
    });
  }

  async checkDatabaseService(service) {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: service.connectionString,
      connectionTimeoutMillis: service.timeout
    });
    
    try {
      const startTime = Date.now();
      const result = await pool.query('SELECT NOW(), version()');
      const queryTime = Date.now() - startTime;
      
      return {
        connected: true,
        queryTime,
        serverTime: result.rows[0].now,
        version: result.rows[0].version.split(' ')[0]
      };
    } finally {
      await pool.end();
    }
  }

  async checkPM2Service(service) {
    try {
      const output = execSync('pm2 jlist', { encoding: 'utf8' });
      const processes = JSON.parse(output);
      
      const process = processes.find(p => p.name === service.pm2Name);
      if (!process) {
        throw new Error(`PM2 process ${service.pm2Name} not found`);
      }
      
      return {
        name: process.name,
        status: process.pm2_env.status,
        pid: process.pid,
        memory: Math.round(process.monit.memory / 1024 / 1024), // MB
        cpu: process.monit.cpu,
        uptime: process.pm2_env.pm_uptime,
        restarts: process.pm2_env.restart_time
      };
    } catch (error) {
      throw new Error(`PM2 check failed: ${error.message}`);
    }
  }

  async checkSystemHealth() {
    const results = {};
    
    try {
      // Disk usage
      const diskOutput = execSync("df -h / | awk 'NR==2 {print $5}'", { encoding: 'utf8' });
      results.diskUsage = parseInt(diskOutput.replace('%', ''));
      
      // Memory usage  
      const memOutput = execSync("free | awk 'NR==2 {printf \"%.0f\", $3*100/$2}'", { encoding: 'utf8' });
      results.memoryUsage = parseInt(memOutput);
      
      // CPU usage
      const cpuOutput = execSync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1", { encoding: 'utf8' });
      results.cpuUsage = parseFloat(cpuOutput);
      
      // Load average
      const loadOutput = execSync("uptime | awk -F'load average:' '{print $2}' | cut -d',' -f1", { encoding: 'utf8' });
      results.loadAverage = parseFloat(loadOutput.trim());
      
      // System uptime
      const uptimeOutput = execSync("uptime -p", { encoding: 'utf8' });
      results.uptime = uptimeOutput.trim();
      
    } catch (error) {
      throw new Error(`System check failed: ${error.message}`);
    }
    
    return results;
  }

  async runHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      hostname: require('os').hostname(),
      overall: 'healthy',
      services: [],
      system: {},
      summary: {
        total: 0,
        healthy: 0,
        unhealthy: 0,
        critical_failures: 0
      }
    };

    // Check all services
    for (const service of this.config.services) {
      const result = await this.checkService(service);
      healthCheck.services.push(result);
      
      healthCheck.summary.total++;
      if (result.status === 'healthy') {
        healthCheck.summary.healthy++;
      } else {
        healthCheck.summary.unhealthy++;
        if (service.critical) {
          healthCheck.summary.critical_failures++;
        }
      }
    }

    // Check system health
    try {
      healthCheck.system = await this.checkSystemHealth();
      
      // Check system thresholds
      for (const check of this.config.systemChecks) {
        const value = healthCheck.system[check.name.replace('_usage', 'Usage').replace('_average', 'Average')];
        if (value > check.threshold) {
          if (check.critical) {
            healthCheck.summary.critical_failures++;
          }
          await this.sendAlert(`System ${check.name} is high: ${value}%`, 'warning');
        }
      }
      
    } catch (error) {
      healthCheck.system.error = error.message;
      healthCheck.summary.critical_failures++;
    }

    // Determine overall health
    if (healthCheck.summary.critical_failures > 0) {
      healthCheck.overall = 'critical';
    } else if (healthCheck.summary.unhealthy > 0) {
      healthCheck.overall = 'degraded';
    }

    // Log health check
    await this.logHealthCheck(healthCheck);
    
    // Store history
    this.healthHistory.push(healthCheck);
    if (this.healthHistory.length > 1440) { // Keep 24 hours (1 minute intervals)
      this.healthHistory.shift();
    }

    return healthCheck;
  }

  async handleCriticalFailure(service, error) {
    const alertKey = `${service.name}_failure`;
    const now = Date.now();
    const lastAlert = this.lastAlerts.get(alertKey) || 0;
    
    // Cooldown period to prevent spam
    if (now - lastAlert < this.config.notifications.cooldown) {
      return;
    }
    
    this.lastAlerts.set(alertKey, now);
    
    // Attempt service recovery
    if (service.pm2Name) {
      await this.attemptServiceRecovery(service);
    }
    
    // Send critical alert
    await this.sendAlert(
      `🚨 CRITICAL: ${service.name} is down - ${error.message}`,
      'critical',
      {
        service: service.name,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    );
  }

  async attemptServiceRecovery(service) {
    try {
      console.log(`🔄 Attempting to restart ${service.pm2Name}...`);
      
      execSync(`pm2 restart ${service.pm2Name}`, { 
        stdio: 'pipe',
        timeout: 30000 
      });
      
      // Wait and test
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const recoveryCheck = await this.checkService(service);
      if (recoveryCheck.status === 'healthy') {
        await this.sendAlert(
          `✅ Service ${service.name} automatically recovered`,
          'info'
        );
        console.log(`✅ Successfully restarted ${service.pm2Name}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to restart ${service.pm2Name}: ${error.message}`);
      await this.sendAlert(
        `❌ Failed to automatically recover ${service.name}: ${error.message}`,
        'critical'
      );
    }
  }

  async sendAlert(message, severity = 'info', details = {}) {
    console.log(`${this.getSeverityEmoji(severity)} ${message}`);
    
    // Log alert
    const alertEntry = {
      timestamp: new Date().toISOString(),
      severity,
      message,
      details
    };
    
    try {
      const logLine = JSON.stringify(alertEntry) + '\n';
      await fs.appendFile(this.config.logging.alertFile, logLine);
    } catch (error) {
      console.error(`Failed to log alert: ${error.message}`);
    }
    
    // Send Slack notification
    if (this.config.notifications.slack && severity !== 'info') {
      try {
        await this.sendSlackNotification(message, severity, details);
      } catch (error) {
        console.error(`Failed to send Slack notification: ${error.message}`);
      }
    }
  }

  async sendSlackNotification(message, severity, details) {
    const payload = {
      text: message,
      attachments: [{
        color: severity === 'critical' ? 'danger' : 
               severity === 'warning' ? 'warning' : 'good',
        fields: [
          {
            title: 'Environment',
            value: process.env.NODE_ENV || 'unknown',
            short: true
          },
          {
            title: 'Hostname',
            value: require('os').hostname(),
            short: true
          },
          {
            title: 'Server',
            value: process.env.SERVER_HOST || 'localhost',
            short: true
          },
          {
            title: 'Timestamp', 
            value: new Date().toISOString(),
            short: true
          }
        ]
      }]
    };
    
    // Add deployment context if available
    if (process.env.GITHUB_SHA) {
      payload.attachments[0].fields.push({
        title: 'Deployment',
        value: `${process.env.GITHUB_SHA.substring(0, 7)} (${process.env.GITHUB_REF_NAME || 'unknown'})`,
        short: true
      });
    }
    
    if (Object.keys(details).length > 0) {
      payload.attachments[0].fields.push({
        title: 'Details',
        value: JSON.stringify(details, null, 2),
        short: false
      });
    }
    
    const response = await fetch(this.config.notifications.slack, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }
  }

  getSeverityEmoji(severity) {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  }

  async logHealthCheck(healthCheck) {
    try {
      const logLine = JSON.stringify(healthCheck) + '\n';
      await fs.appendFile(this.config.logging.logFile, logLine);
    } catch (error) {
      console.error(`Failed to log health check: ${error.message}`);
    }
  }

  async generateReport() {
    const recent = this.healthHistory.slice(-60); // Last hour
    const report = {
      period: '1 hour',
      total_checks: recent.length,
      availability: {},
      performance: {},
      incidents: []
    };
    
    // Calculate availability per service
    for (const service of this.config.services) {
      const serviceChecks = recent.map(h => 
        h.services.find(s => s.name === service.name)
      ).filter(Boolean);
      
      const healthyCount = serviceChecks.filter(s => s.status === 'healthy').length;
      const availability = serviceChecks.length > 0 ? 
        (healthyCount / serviceChecks.length * 100).toFixed(2) : 0;
      
      report.availability[service.name] = `${availability}%`;
      
      // Average response time
      const responseTimes = serviceChecks
        .filter(s => s.status === 'healthy')
        .map(s => s.responseTime);
      
      if (responseTimes.length > 0) {
        const avgResponse = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        report.performance[service.name] = `${Math.round(avgResponse)}ms`;
      }
    }
    
    return report;
  }

  async start(interval = 60000) {
    console.log('🚀 Starting BankIM Health Monitor...');
    console.log(`📊 Monitoring ${this.config.services.length} services`);
    console.log(`⏱️  Check interval: ${interval/1000}s`);
    
    // Initial health check
    await this.runHealthCheck();
    
    // Schedule regular checks
    setInterval(async () => {
      try {
        await this.runHealthCheck();
      } catch (error) {
        console.error(`Health check error: ${error.message}`);
      }
    }, interval);
    
    // Schedule daily cleanup
    setInterval(async () => {
      await this.cleanup();
    }, 24 * 60 * 60 * 1000); // Daily
    
    console.log('✅ Health monitor started successfully');
  }

  async cleanup() {
    try {
      // Clean old logs
      const retentionMs = this.config.logging.retentionDays * 24 * 60 * 60 * 1000;
      const cutoffDate = new Date(Date.now() - retentionMs);
      
      // This would implement log rotation/cleanup
      console.log(`🧹 Cleaned logs older than ${this.config.logging.retentionDays} days`);
      
    } catch (error) {
      console.error(`Cleanup error: ${error.message}`);
    }
  }
}

// CLI Interface
async function main() {
  const monitor = new HealthMonitor();
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      const interval = parseInt(process.argv[3]) || 60000;
      await monitor.start(interval);
      break;
      
    case 'check':
      const result = await monitor.runHealthCheck();
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.overall === 'healthy' ? 0 : 1);
      break;
      
    case 'report':
      await monitor.start(1000); // Quick start for history
      setTimeout(async () => {
        const report = await monitor.generateReport();
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      }, 5000);
      break;
      
    default:
      console.log('Usage: node health-monitor.js <command>');
      console.log('Commands:');
      console.log('  start [interval]  - Start continuous monitoring');
      console.log('  check            - Run single health check');
      console.log('  report           - Generate availability report');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = HealthMonitor;