const client = require('prom-client');

// Enable default metrics (Node.js process metrics)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

// Custom metrics
const emailSentCounter = new client.Counter({
  name: 'emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['type'], // e.g., 'welcome', 'reset'
});

const emailFailedCounter = new client.Counter({
  name: 'emails_failed_total',
  help: 'Total number of failed email sends',
  labelNames: ['type', 'error_code']
});

const emailSendDuration = new client.Histogram({
  name: 'email_send_duration_seconds',
  help: 'Duration of email send operations in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

const dbConnectionGauge = new client.Gauge({
  name: 'db_connection_status',
  help: 'MongoDB connection status (1 = connected, 0 = disconnected)'
});

const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of MongoDB queries in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
}); // New for query performance

const fileUploadCounter = new client.Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['type']
});

const httpErrorsCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors by status code',
  labelNames: ['status_code']
});

// MONITORING: Web Vitals metrics
const webVitalsLCP = new client.Histogram({
  name: 'web_vitals_lcp_seconds',
  help: 'Largest Contentful Paint time in seconds',
  labelNames: ['navigation_type'],
  buckets: [0.5, 1, 2.5, 4, 6, 10]
});

const webVitalsCLS = new client.Histogram({
  name: 'web_vitals_cls_score',
  help: 'Cumulative Layout Shift score',
  labelNames: ['navigation_type'],
  buckets: [0, 0.1, 0.25, 0.5, 1]
});

const webVitalsFID = new client.Histogram({
  name: 'web_vitals_fid_seconds',
  help: 'First Input Delay in seconds',
  labelNames: ['navigation_type'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1]
});

module.exports = {
  client,
  emailSentCounter,
  emailFailedCounter,
  emailSendDuration,
  dbConnectionGauge,
  dbQueryDuration,
  fileUploadCounter,
  httpErrorsCounter,
  webVitalsLCP,
  webVitalsCLS,
  webVitalsFID
};