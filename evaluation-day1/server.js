const http = require("http");
const router = require("./modules/router");

const server = http.createServer((req, res) => {
  router(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
