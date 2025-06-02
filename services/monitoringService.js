const logger = require('../utils/logger');

class MonitoringService {
  constructor() {
    this.metrics = new Map();
    this.alerts = new Map();
    this.thresholds = new Map();
  }

  // Record a metric
  recordMetric(name, value, tags = {}) {
    const timestamp = new Date();
    const metric = {
      value,
      tags,
      timestamp,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Check thresholds
    this.checkThresholds(name, value, tags);
  }

  // Set threshold for a metric
  setThreshold(name, conditions) {
    this.thresholds.set(name, conditions);
  }

  // Check if metrics exceed thresholds
  checkThresholds(name, value, tags) {
    const threshold = this.thresholds.get(name);
    if (!threshold) return;

    if (threshold.check(value, tags)) {
      const alert = {
        metric: name,
        value,
        tags,
        timestamp: new Date(),
        condition: threshold.description,
      };

      if (!this.alerts.has(name)) {
        this.alerts.set(name, []);
      }
      this.alerts.get(name).push(alert);

      logger.warn(`Threshold exceeded for ${name}:`, alert);
    }
  }

  // Get metrics for a time range
  getMetrics(name, startTime, endTime) {
    const metrics = this.metrics.get(name) || [];
    return metrics.filter(
      (m) => m.timestamp >= startTime && m.timestamp <= endTime,
    );
  }

  // Get active alerts
  getAlerts(name) {
    return this.alerts.get(name) || [];
  }

  // Clear old metrics
  clearOldMetrics(maxAge = 7 * 24 * 60 * 60 * 1000) {
    const now = new Date();
    this.metrics.forEach((metrics, name) => {
      const filtered = metrics.filter((m) => now - m.timestamp <= maxAge);
      this.metrics.set(name, filtered);
    });
  }
}

module.exports = MonitoringService;
