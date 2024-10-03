import { OpenAI } from "openai";
import { CodeInterpreter, Result, ProcessMessage } from "@e2b/code-interpreter";
import { SYSTEM_PROMPTS } from "./constants";
import { logMessage, matchCodeBlocks } from "./utils";
import dotenv from "dotenv";
dotenv.config({ override: true });

export class CodeInterpreterService {
  private openai: OpenAI;
  private codeInterpreter: CodeInterpreter;

  constructor(openai: OpenAI, codeInterpreter: CodeInterpreter) {
    this.openai = openai;
    this.codeInterpreter = codeInterpreter;
  }

  static async create(): Promise<CodeInterpreterService> {
    const openai = new OpenAI();
    const codeInterpreter = await CodeInterpreter.create();
    return new CodeInterpreterService(openai, codeInterpreter);
  }

  // async uploadDataset() {
  //   logMessage("Uploading datasets to Code Interpreter sandbox...");

  //   const uploadFile = async (filename: string) => {
  //     const fileContent = fs.readFileSync(`./${filename}`);
  //     const filePath = await this.codeInterpreter.uploadFile(
  //       fileContent,
  //       filename
  //     );
  //     console.log(`Uploaded ${filename} at ${filePath}`);
  //   };

  //   await uploadFile(${process.env.FILENAME});
  // }

  async interpretCode(code: string): Promise<Result[]> {
    logMessage("Running code interpreter...");

    const exec = await this.codeInterpreter.notebook.execCell(code, {
      onStderr: (msg: ProcessMessage) =>
        console.log("[Code Interpreter stderr]", msg),
      onStdout: (stdout: ProcessMessage) =>
        console.log("[Code Interpreter stdout]", stdout),
    });

    if (exec.error) {
      console.log("[Code Interpreter ERROR]", exec.error);
      throw new Error(exec.error.value);
    }

    return exec.results;
  }

  async getModelResponse(
    model: string,
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const content = response.choices[0].message.content;
    if (content === null) {
      throw Error(`Chat content is null.`);
    }

    return content;
  }

  async processUserQuery(
    userMessage: string
  ): Promise<{ code: string; explanation: string }> {
    logMessage(`User Message: ${userMessage}`);

    const gpt4oResponse = await this.getModelResponse(
      "gpt-4o",
      SYSTEM_PROMPTS.GPT_4O,
      userMessage
    );

    const code = matchCodeBlocks(gpt4oResponse);
    if (code === "") {
      throw Error(
        `Failed to match any code in model's response:\n${gpt4oResponse}`
      );
    }

    const explanation = await this.getModelResponse(
      "gpt-4o",
      SYSTEM_PROMPTS.EXPLANATION,
      code
    );

    return { code, explanation };
  }

  async run() {
    try {
      console.log("\n==================================================");
      console.log("Server running on port 3001");
      console.log("==================================================");

      // JSON response
      return { message: "Ready to process requests." };
    } catch (error) {
      console.error("An error occurred:", error);
      return { error: "An error occurred while processing." };
    }
  }
}
