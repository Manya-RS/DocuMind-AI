require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { extractText } = require("./utils/documentParser");
const { createChunks } = require("./utils/chunker");
const {
    generateEmbedding,
    generateEmbeddings
} = require("./utils/embeddings");
const { findSimilarChunks } = require("./utils/similarity");
const { generateAnswer } = require("./utils/answerGenerator");
const app = express();
app.use(express.json());
const PORT = 3000;
// Temporary in-memory document store
const documentStore = new Map();
// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            "application/pdf",
            "text/plain"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and TXT files are allowed."));
        }
    }
});

// Test route
app.get("/api/test", (req, res) => {
    res.json({
        message: "DocuMind AI backend is working! 🦊"
    });
});

// Upload route
app.post("/api/upload", upload.single("document"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            error: "No document uploaded."
        });
    }


    try {

        const extractedText = await extractText(
            req.file.path,
            req.file.mimetype
        );
const chunks = createChunks(extractedText);

console.log(`Created ${chunks.length} chunks from ${req.file.originalname}`);

console.log("Generating embeddings...");

const embeddings = await generateEmbeddings(chunks);

console.log(`Generated ${embeddings.length} embeddings.`);
        if (!extractedText || !extractedText.trim()) {

            return res.status(400).json({
                error: "The uploaded document does not contain readable text."
            });
        }
const embeddedChunks = chunks.map((chunk, index) => ({
    text: chunk,
    embedding: embeddings[index]
}));

documentStore.set(req.file.filename, {
    originalName: req.file.originalname,
    fileType: req.file.mimetype,
    chunks: embeddedChunks
});
        console.log(
            `Extracted ${extractedText.length} characters from ${req.file.originalname}`
        );


        res.json({

    message: "Document uploaded and processed successfully!",

    filename: req.file.filename,

    originalName: req.file.originalname,

    fileType: req.file.mimetype,

    characterCount: extractedText.length,

    chunkCount: chunks.length

});


    } catch (error) {
    console.error("Document processing error:", error);

    try {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    } catch (cleanupError) {
        console.error("Failed to clean up uploaded file:", cleanupError);
    }

    res.status(500).json({
        error: "Failed to process the document.",
        details: error.message
    });
}
});
app.post("/api/retrieve", async (req, res) => {
    const { question } = req.body;
    if (!question || !question.trim()) {
        return res.status(400).json({
            error: "Please enter a question."
        });
    }


    try {
        console.log("Generating question embedding...");

        const questionEmbedding = await generateEmbedding(question);

        const allChunks = [];

for (const document of documentStore.values()) {
    for (const chunk of document.chunks) {
        allChunks.push({
            text: chunk.text,
            embedding: chunk.embedding,
            documentName: document.originalName
        });
    }
}

const results = findSimilarChunks(
    questionEmbedding,
    allChunks,
    3
);

        console.log("Relevant chunks retrieved.");

        const context = results
            .map(result => result.text)
            .join("\n\n");

        console.log("Generating grounded answer...");

        const generatedAnswer = await generateAnswer(
            question,
            context
        );

        console.log("Answer generated successfully.");

        res.json({
            question,
            answer: generatedAnswer,
            results
        });

    } catch (error) {
        console.error("Retrieval/answer error:", error);

        res.status(500).json({
            error: "Failed to generate an answer.",
            details: error.message
        });
    }
});

// Delete document
app.delete("/api/documents/:filename", (req, res) => {
    const filename = req.params.filename;
    const document = documentStore.get(filename);

    if (!document) {
        return res.status(404).json({
            error: "Document not found."
        });
    }

    const filePath = path.join(__dirname, "uploads", filename);

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        documentStore.delete(filename);

        console.log(`Deleted document: ${document.originalName}`);

        res.json({
            message: "Document deleted successfully.",
            filename: filename
        });

    } catch (error) {
        console.error("Delete error:", error);

        res.status(500).json({
            error: "Failed to delete the document."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`DocuMind AI running at http://localhost:${PORT}`);
});