function cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
}

function findSimilarChunks(queryEmbedding, chunks, topK = 3) {
    const results = chunks.map(chunk => ({
    text: chunk.text,
    score: cosineSimilarity(
        queryEmbedding,
        chunk.embedding
    ),
    documentName: chunk.documentName
}));
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
}

module.exports = {
    cosineSimilarity,
    findSimilarChunks
};