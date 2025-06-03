# Stockfish Chess API

A scalable Node.js + WebSocket server to evaluate chess positions using Stockfish.

## Features
- `/v1` HTTP POST endpoint (FEN + depth)
- WebSocket streaming output
- Auto-kills engine after best move
- Ready for Railway / Render / Docker

## Usage

### HTTP:
```bash
curl -X POST http://localhost:8080/v1 \
  -H "Content-Type: application/json" \
  -d '{"fen": "8/1P1R4/n1r2B2/3Pp3/1k4P1/6K1/Bppr1P2/2q5 w - - 0 1", "depth": 15}'
```

### WebSocket:
```js
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (e) => console.log(e.data);
ws.onopen = () => {
  ws.send(JSON.stringify({ fen: "8/1P1R4/n1r2B2/3Pp3/1k4P1/6K1/Bppr1P2/2q5 w - - 0 1", depth: 15 }));
};
```

## Deployment
- Railway: `railway init`
- Render: import GitHub repo
- Docker: `docker build . && docker run -p 8080:8080 your-image-name`
