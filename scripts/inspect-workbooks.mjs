import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const files = process.argv.slice(2);
if (files.length === 0) {
  throw new Error("Provide at least one workbook path.");
}

for (const file of files) {
  const input = await FileBlob.load(file);
  const workbook = await SpreadsheetFile.importXlsx(input);
  const overview = await workbook.inspect({
    kind: "workbook,sheet,table,definedName,drawing",
    maxChars: 30000,
    tableMaxRows: 12,
    tableMaxCols: 30,
    tableMaxCellChars: 160,
  });
  const formulas = await workbook.inspect({
    kind: "formula",
    options: { maxResults: 300 },
    maxChars: 30000,
  });
  console.log(JSON.stringify({
    file,
    overview: overview.ndjson,
    formulas: formulas.ndjson,
  }));
}
