const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Add logging middleware to see every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query parameters:', req.query);
  next();
});

// Dynamic proxy route
app.use('/', (req, res, next) => {
  // Get the target from the query parameter (your preferred style)
  const target = req.query.url; // Use: curl "http://yourserver.com?url=https://google.com"

  if (!target) {
    console.error('Missing target URL in query parameters');
    return res.status(400).send('Please provide a target URL via the "url" query parameter. Usage: ?url=https://example.com');
  }

  try {
    // Validate that the target is a valid URL
    new URL(target);
  } catch (err) {
    console.error('Invalid URL provided:', target);
    return res.status(400).send('Invalid URL format');
  }

  console.log(`Proxying request to: ${target}`);

  // Create the proxy middleware for this specific request
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false, // Ignore SSL certificate errors during testing
      logLevel: 'debug', // This provides built-in debug logs
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxy request initiated');
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`Proxy response received: ${proxyRes.statusCode}`);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error Details:', err);
        res.status(500).send('Proxy Error: ' + err.message);
      }
    })(req, res, next);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Dynamic proxy server running on port ${PORT}`);
  console.log(`Test with: curl "http://localhost:${PORT}?url=https://httpbin.org/ip"`);
});
