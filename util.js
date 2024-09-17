import { createServer } from "node:http";
import chalk from "chalk";

const logRequestDetails = (req) => {
  const timestamp = new Date().toISOString();
  console.log(chalk.green(`================= REQUEST START =================`));
  console.log(
    chalk.yellow(
      `[${timestamp}] Received request from: ${req.connection.remoteAddress}`
    )
  );
  console.log(
    chalk.yellow(
      `[${timestamp}] Method: ${req.method} ${req.url} HTTP/${req.httpVersion}`
    )
  );
  console.log(chalk.yellow(`[${timestamp}] Host: ${req.headers.host}`));
  console.log(
    chalk.yellow(`[${timestamp}] User-Agent: ${req.headers["user-agent"]}`)
  );
  console.log(chalk.yellow(`[${timestamp}] Accept: ${req.headers["accept"]}`));
  console.log(chalk.green(`================= REQUEST END ===================`));
};

const logHealthCheck = (req) => {
  const timestamp = new Date().toISOString();
  console.log(
    chalk.blue(
      `[${timestamp}] Health check request from ${req.connection.remoteAddress}`
    )
  );
};

export const startServer = (port = 8080, isVerbose = false) =>
  createServer(async (req, res) => {
    if (req.url === "/health") {
      isVerbose && logHealthCheck(req);
      res.statusCode = 200;
      res.end("OK");
    } else {
      logRequestDetails(req);

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello From Backend Server");

      const timestamp = new Date().toISOString();
      console.log(chalk.green(`[${timestamp}] Replied with a hello message`));
    }
  }).listen(port, "127.0.0.1", () => {
    const timestamp = new Date().toISOString();
    console.log(chalk.cyan(`[${timestamp}] Listening on 127.0.0.1:${port}`));
  });

export const getServerPorts = (s, n) =>
  Array.from({ length: n }, (_, i) => s + i);
