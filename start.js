const { exec, spawn } = require("child_process");
const path = require("path");
const net = require("net");

const serverDir = path.join(__dirname, "server");
const clientDir = path.join(__dirname, "client");

function killPort(port) {
  return new Promise((resolve) => {
    const cmd =
      process.platform === "win32"
        ? `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port} ^| findstr LISTENING') do taskkill /F /PID %a`
        : `lsof -ti:${port} | xargs kill -9`;
    exec(cmd, () => setTimeout(resolve, 500));
  });
}

function waitForPort(port, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = net.createConnection({ port }, () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        if (Date.now() - start > timeout) reject(new Error(`Port ${port} timeout`));
        else setTimeout(check, 500);
      });
    };
    check();
  });
}

async function main() {
  console.log("Cleaning up old processes...");
  await killPort(5000);
  await killPort(3000);

  console.log("Starting Backend Server...");
  const server = spawn("node", ["server.js"], {
    cwd: serverDir,
    stdio: "inherit",
  });

  await waitForPort(5000);
  console.log("Backend ready on http://localhost:5000");

  console.log("Starting Frontend Client...");
  const client = spawn("node", ["node_modules/react-scripts/bin/react-scripts.js", "start"], {
    cwd: clientDir,
    stdio: "inherit",
    env: { ...process.env, BROWSER: "none" },
  });

  console.log("\nBoth servers starting...");
  console.log("Backend:  http://localhost:5000");
  console.log("Frontend: http://localhost:3000\n");

  server.on("error", (err) => console.error("Server error:", err.message));
  client.on("error", (err) => console.error("Client error:", err.message));
}

main();
