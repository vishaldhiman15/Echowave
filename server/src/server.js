import app from "./app.js";

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`EchoWave server running on port ${port}`);
});

server.on("error", (err) => {
  if (err?.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(
      `Stop the other process or start on a different port (example): PORT=4001 npm run dev`
    );
    process.exit(1);
  }

  console.error("Server error:", err);
  process.exit(1);
});

// Trigger redeploy
