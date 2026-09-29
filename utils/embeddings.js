const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateEmbedding(text) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
            outputDimensionality: 768
        }
    });

    return response.embeddings[0].values;
}

async function generateEmbeddings(texts) {
    const batchSize = 100;
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);

        console.log(
            `Generating embeddings for chunks ${i + 1}-${i + batch.length} of ${texts.length}...`
        );

        // Wait before starting the next batch
        if (i > 0) {
            console.log("Waiting for embedding rate limit to reset...");
            await new Promise(resolve => setTimeout(resolve, 65000));
        }

        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: batch,
            config: {
                outputDimensionality: 768
            }
        });

        const batchEmbeddings = response.embeddings.map(
            embedding => embedding.values
        );

        allEmbeddings.push(...batchEmbeddings);
    }

    return allEmbeddings;
}

module.exports = {
    generateEmbedding,
    generateEmbeddings
};
