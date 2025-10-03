# Dynamic Web Proxy

Install Dependencies:
```sh
npm install express http-proxy-middleware cors morgan
```

Run server locally:
```sh
node proxy-server.js
```

Keep alive on logout or system reboot:
```sh
sudo npm install pm2 -g

pm2 start proxy-server.js

pm2 startup
pm2 save
```

Basic usage:
```sh
curl "http://localhost:3000?url=https://www.target.com"
```
