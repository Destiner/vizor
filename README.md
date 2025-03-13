# Vizor

LLM Monitoring for Vercel AI SDK

<img width="1710" alt="Screenshot 2025-02-28 at 13 17 47" src="https://github.com/user-attachments/assets/3b4f32c8-b742-4e60-aade-e2a04d0b8ef7" />


Features:

- Multi-step conversations
- Tool calling
- Error handling
- *(planned)* Streaming support
- *(planned)* Non-text message content (e.g. images)

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

const { text } = await generateText({
  // Enable telemetry
  experimental_telemetry: {
    isEnabled: true,
  },
});
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

4. Open the server UI at [`http://localhost:19323`](http://localhost:19323).
