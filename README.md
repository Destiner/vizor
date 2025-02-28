# Vizor

LLM Monitoring for Vercel AI SDK

Features:

- Multi-step support
- Tool calling
- Error handling
- [Planned] streaming support
- [Planned] non-text message content (e.g. images)

## Setup

### Client

1. In your project, install the Vizor Client SDK:

```bash
bun i vizor-sdk
```

2. In your code, create and start the SDK instance:

```ts
import { Sdk } from "vizor-sdk";

const sdk = new Sdk();
sdk.start();

// LLM code
```

### Server

1. Clone this repository:

```bash
git clone
```

2. Install the dependencies

```bash
bun i
```

3. Start the server:

```bash
bun run server:start
```

4. Open the server UI at [http://localhost:19323](`http://localhost:19323`).
