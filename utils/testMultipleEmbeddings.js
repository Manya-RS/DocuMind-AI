require("dotenv").config();

const { generateEmbeddings } = require("./embeddings");

async function test() {
    try {
        const chunks = [
            "IoT connects physical devices to the internet.",
            "Sensors collect data from the surrounding environment.",
            "Cloud computing can be used to store and process IoT data."
        ];

        const embeddings = await generateEmbeddings(chunks);

        console.log("Multiple embeddings generated successfully!");
        console.log("Number of embeddings:", embeddings.length);
        console.log("Each vector length:", embeddings[0].length);
    } catch (error) {
        console.error("Multiple embedding test failed:");
        console.error(error.message);
    }
}

test();