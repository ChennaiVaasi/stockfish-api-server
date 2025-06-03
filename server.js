const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// POST endpoint for single Stockfish evaluation
app.post("/v1", (req, res) => {
  const { fen, depth = 15 } = req.body;
  const engine = spawn("stockfish");

  engine.stdin.write("uci\n");
  engine.stdin.write(`position fen ${fen}\n`);
  engine.stdin.write(`go depth ${depth}\n`);

  let bestMove = null;
  let evalCp = null;

  engine.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach(line => {
      if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match) evalCp = parseInt(match[1]);
      }
      if (line.startsWith("bestmove")) {
        bestMove = line.split(" ")[1];
        engine.kill();
        res.json({ bestMove, eval: evalCp });
      }
    });
  });
});

// Start server and WebSocket
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const { fen, depth = 15 } = JSON.parse(message);
    const engine = spawn("stockfish");
    engine.stdin.write("uci\n");
    engine.stdin.write(`position fen ${fen}\n`);
    engine.stdin.write(`go depth ${depth}\n`);

    engine.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      lines.forEach(line => {
        if (line.startsWith("info depth")) {
          ws.send(JSON.stringify({ info: line }));
        }
        if (line.startsWith("bestmove")) {
          ws.send(JSON.stringify({ bestMove: line.split(" ")[1] }));
          engine.kill();
        }
      });
    });
  });
});
