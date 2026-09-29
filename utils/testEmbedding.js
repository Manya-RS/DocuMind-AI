require("dotenv").config();

const { generateEmbedding } = require("./embeddings");

async function test() {
    try {
        const vector = await generateEmbedding(
            "DocuMind AI retrieves relevant information from uploaded documents."
        );

        console.log("Embedding generated successfully!");
        console.log("Vector length:", vector.length);
        console.log("First 5 values:", vector.slice(0, 5));
    } catch (error) {
        console.error("Embedding test failed:");
        console.error(error.message);
    }
}

test();