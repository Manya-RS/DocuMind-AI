const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function extractText(filePath, fileType) {

    // PDF file
    if (fileType === "application/pdf") {

        const fileBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({
            data: fileBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        return result.text;
    }


    // TXT file
    if (fileType === "text/plain") {

        return fs.readFileSync(filePath, "utf-8");
    }


    throw new Error("Unsupported document type.");
}


module.exports = {
    extractText
};