const fs = require("fs");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ["*"];
const options = {origin: allowedOrigins, credentials: true};
const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), {flags: "a"});

morgan.token('all-req-headers', (req) => {
  return JSON.stringify(req.headers);
});

morgan.token('all-res-headers', (req, res) => {
  const headers = {};
  res.getHeaderNames().forEach(name => {
    headers[name] = res.getHeader(name);
  });
  return JSON.stringify(headers);
});

app.use(morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\n' +
  'Request Headers: :all-req-headers\n' +
  'Response Headers: :all-res-headers\n' +
  '----------------------------------------',
  { stream: accessLogStream }
));

app.use(cors(options));


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query parameters:', req.query);
  next();
});

app.use('/', (req, res, next) => {

  const target = req.query.url;

  if (!target) {
    console.error('Missing target URL in query parameters');
    return res.status(400).send('Please provide a target URL via the "url" query parameter. Usage: ?url=https://example.com');
  }

  try {
    new URL(target);
  } catch (err) {
    console.error('Invalid URL provided:', target);
    return res.status(400).send('Invalid URL format');
  }

  console.log(`Proxying request to: ${target}`);


    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
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
