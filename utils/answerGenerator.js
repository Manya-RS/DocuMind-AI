const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateAnswer(question, context) {
    const prompt = `
You are DocuMind AI, a document-based question answering assistant.

Answer the user's question using ONLY the information provided in the document context below.

If the answer cannot be found in the context, say:
"I couldn't find that information in the uploaded document."

Do not use outside knowledge.
Keep the answer clear, accurate, and easy to understand.

Document Context:
${context}

User Question:
${question}

Answer:
`;

    const models = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash"
];
    for (const model of models) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(
                    `Generating answer with ${model}... Attempt ${attempt}/3`
                );

                const response = await ai.models.generateContent({
                    model: model,
                    contents: prompt
                });

                console.log(`Answer generated successfully using ${model}.`);

                return response.text;

            } catch (error) {
                const errorMessage = error.message || "";

                // Do not retry if the API quota has been exhausted
                if (
                    errorMessage.includes("429") ||
                    errorMessage.includes("RESOURCE_EXHAUSTED") ||
                    errorMessage.toLowerCase().includes("quota")
                ) {
                    throw new Error(
                        "Gemini API quota exceeded. Please try again after the quota resets."
                    );
                }

                console.error(
                    `Answer generation failed with ${model}:`,
                    errorMessage
                );

                // Try again only for temporary errors
                if (attempt < 3) {
                    const waitTime = attempt * 2000;

                    console.log(
                        `Retrying in ${waitTime / 1000} seconds...`
                    );

                    await new Promise(resolve =>
                        setTimeout(resolve, waitTime)
                    );
                }
            }
        }

        console.log(
            `${model} was unavailable. Trying the fallback model...`
        );
    }

    throw new Error(
        "Gemini models are temporarily unavailable. Please try again later."
    );
}

module.exports = {
    generateAnswer
};