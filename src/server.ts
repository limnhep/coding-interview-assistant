import express from "express";
import bodyParser from "body-parser";
import { CodeInterpreterService } from "./codeInterpreter";

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post("/generate-code", async (req, res) => {
  try {
    const service = await CodeInterpreterService.create();
    const { code, explanation } = await service.processUserQuery(
      req.body.userInput
    );
    res.json({ code, explanation });
  } catch (error) {
    console.error("Error generating code:", error);
    res.status(500).json({ error: "Failed to generate code." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Usage
(async () => {
  const service = await CodeInterpreterService.create();
  await service.run();
})();
