function formatExtractedTokens(command) {
    const splitCommand = command.split(" ");
  
    const pathIndex = splitCommand.findIndex(
      (part) =>
        part.startsWith("/") || part.startsWith("./") || part.includes(".")
    );
  
    if (pathIndex === -1) {
      return [command];
    }
  
    const actionPart = splitCommand.slice(0, pathIndex).join(" ");
    const filePath = splitCommand[pathIndex];
    const content = splitCommand.slice(pathIndex + 1).join(" ");
  
    return [actionPart, filePath, content];
  }
  // Example commands
//   const commands = [
//     "create a file magic.txt",
//     "rename a file ./magic.txt ./magical.txt",
//     "add to file ./magical.txt New Magic text in file"
//   ];
const commands = "add to file ./magical.txt New Magic text in file";
  
  const formattedTokens = formatExtractedTokens(commands);
  console.log(formattedTokens);