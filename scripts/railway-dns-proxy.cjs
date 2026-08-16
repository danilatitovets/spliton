const http = require("http");
const net = require("net");
const dns = require("dns");
const { promisify } = require("util");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const resolve4 = promisify(dns.resolve4);

const PORT = Number(process.env.RAILWAY_DNS_PROXY_PORT || 18080);

const server = http.createServer((req, res) => {
  res.writeHead(400);
  res.end("CONNECT-only");
});

server.on("connect", async (req, clientSocket, head) => {
  try {
    const [host, portStr] = (req.url || "").split(":");
    const port = Number(portStr || 443);
    const addrs = await resolve4(host);
    const ip = addrs[0];
    if (!ip) throw new Error("no A");

    const serverSocket = net.connect(port, ip, () => {
      clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head && head.length) serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });

    serverSocket.on("error", () => clientSocket.end());
    clientSocket.on("error", () => serverSocket.end());
  } catch (e) {
    clientSocket.write("HTTP/1.1 502 Bad Gateway\r\n\r\n");
    clientSocket.end();
  }
});

server.listen(PORT, "127.0.0.1", () => console.log("Proxy\ready:" + PORT));
