# Dynamic Web Server

Install Dependencies:
```sh
npm install express http-proxy-middleware cors morgan
```

Run server:
```sh
node proxy-server.js
```

Use server:
```sh
curl "http://localhost:3000?url=https://www.target.com"
```

