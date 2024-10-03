export const matchCodeBlocks = (llmResponse: string): string => {
  const regex = /```(?:python)?\n([\s\S]*?)```/g;
  const matches = [...llmResponse.matchAll(regex)].map((match) =>
    match[1].trim()
  );
  return matches.join("\n\n");
};

export const logMessage = (message: string) =>
  console.log(`\n${"=".repeat(50)}\n${message}\n${"=".repeat(50)}`);
