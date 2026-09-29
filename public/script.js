const documentInput = document.getElementById("documentInput");
const chooseBtn = document.getElementById("chooseBtn");
const uploadArea = document.getElementById("uploadArea");

const documentList = document.getElementById("documentList");

const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");

const questionStatus = document.getElementById("questionStatus");

const answer = document.getElementById("answer");
const context = document.getElementById("context");
let uploadedDocuments = [];
function formatAnswer(text) {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const lines = escaped.split("\n");
    let html = "";

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        if (/^###\s+/.test(trimmed)) {
            const heading = trimmed.replace(/^###\s+/, "");
            html += `<h4>${formatInline(heading)}</h4>`;
        }

        else if (/^##\s+/.test(trimmed)) {
            const heading = trimmed.replace(/^##\s+/, "");
            html += `<h3>${formatInline(heading)}</h3>`;
        }

        else if (/^#\s+/.test(trimmed)) {
            const heading = trimmed.replace(/^#\s+/, "");
            html += `<h3>${formatInline(heading)}</h3>`;
        }

        else if (/^[-*•]\s+/.test(trimmed)) {
            const bullet = trimmed.replace(/^[-*•]\s+/, "");

            html += `
                <div class="answer-bullet">
                    <span>•</span>
                    <div>${formatInline(bullet)}</div>
                </div>
            `;
        }

        else if (/^\d+\.\s+/.test(trimmed)) {
            const point = trimmed.replace(/^\d+\.\s+/, "");
            const number = trimmed.match(/^\d+/)[0];

            html += `
                <div class="answer-numbered">
                    <span>${number}.</span>
                    <div>${formatInline(point)}</div>
                </div>
            `;
        }

        else if (/^---+$/.test(trimmed)) {
            html += `<hr>`;
        }

        else {
            html += `<p>${formatInline(trimmed)}</p>`;
        }
    }

    return html;
}

function formatInline(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.*?)__/g, "<strong>$1</strong>");
}
function formatContext(text) {
    const escaped = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return escaped
        // Convert PDF line breaks into normal spaces
        .replace(/\s+/g, " ")

        // Keep page boundaries readable
        .replace(/\s*--\s*(\d+\s+of\s+\d+)\s*--\s*/gi, "<br><br><strong>Page $1</strong><br>")

        // Separate bullet points when present
        .replace(/\s+•\s+/g, "<br>• ")

        // Add a little spacing around arrows
        .replace(/\s*→\s*/g, " → ");
}
// =========================
// CHOOSE FILE
// =========================

chooseBtn.addEventListener("click", () => {
    documentInput.click();
});


// =========================
// FILE SELECTED(upload document)
// =========================

documentInput.addEventListener("change", () => {
    const files = Array.from(documentInput.files);

    if (files.length === 0) return;

    uploadDocuments(files);
});
async function uploadDocuments(files) {

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < files.length; i++) {

        const file = files[i];

        questionStatus.textContent =
            `⚙️ Processing document ${i + 1} of ${files.length}: ${file.name}`;

        const success = await uploadDocument(file);

        if (success) {
            successCount++;
        } else {
            failedCount++;
        }
    }

    documentInput.value = "";

    if (failedCount === 0) {

        questionStatus.textContent =
            `✅ All ${successCount} document${successCount > 1 ? "s" : ""} processed successfully.`;

    } else {

        questionStatus.textContent =
            `⚠️ ${successCount} processed successfully, ${failedCount} failed.`;
    }
}

async function uploadDocument(file) {

    const allowedTypes = [
        "application/pdf",
        "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Only PDF and TXT files are allowed.");

        documentInput.value = "";

        return false;
    }

    questionStatus.textContent =
        `📄 Uploading ${file.name} and processing document...`;

    const formData = new FormData();

    formData.append("document", file);

    try {

        questionStatus.textContent =
            `⏳ Processing ${file.name}... Extracting text and generating embeddings.`;

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed.");
        }

        // Display uploaded document
        uploadedDocuments.push({
            filename: data.filename,
            originalName: data.originalName,
            status: "ready"
        });

        documentList.innerHTML = uploadedDocuments
            .map(
                document => `
                    <div class="document-item">

                        <div class="document-icon">
                            📄
                        </div>

                        <div class="document-info">
                            <strong>${document.originalName}</strong>
                            <span class="document-status ready-status">
                                ✓ Ready
                            </span>
                        </div>

                        <button
                            class="delete-btn"
                            onclick="deleteDocument('${document.filename}')"
                            title="Delete document">
                            🗑️
                        </button>

                    </div>
                `
            )
            .join("");

        answer.innerHTML =
            "Your answer will appear here.";

        context.textContent =
            "Relevant document sections will appear here after retrieval.";

        return true;

    } catch (error) {

        questionStatus.textContent =
            `⚠️ ${file.name} could not be processed.`;

        alert(`${file.name}\n\n${error.message}`);

        return false;
    }
}
// =========================
// ASK QUESTION
// =========================

askBtn.addEventListener("click", async () => {
    const question = questionInput.value.trim();

    if (!question) {
        questionStatus.textContent = "⚠️ Please enter a question.";
        return;
    }

    

    questionStatus.textContent = "🔍 Searching your document...";
    askBtn.disabled = true;

    try {
        const response = await fetch("/api/retrieve", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
    question: question
})
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Retrieval failed.");
        }

        context.innerHTML = data.results
    .map(
        (result, index) => `
            <div class="context-item">
                <div class="context-header">
                    <strong>
                        Relevant Section ${index + 1}
                    </strong>

                    <span class="source-document">
                        📄 ${result.documentName}
                    </span>
                </div>

                <div class="context-text">
                    ${formatContext(result.text)}
                </div>

                <div class="similarity">
                    Similarity: ${result.score.toFixed(3)}
                </div>
            </div>
        `
    )
    .join("");

        answer.innerHTML = formatAnswer(data.answer);
        questionStatus.textContent =
            "✅ Relevant document sections found.";

    } catch (error) {
        questionStatus.textContent = "❌ Retrieval failed.";
        alert(error.message);
    } finally {
        askBtn.disabled = false;
    }
});
async function deleteDocument(filename) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) return;

    try {
        const response = await fetch(
            `/api/documents/${encodeURIComponent(filename)}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete document.");
        }

        uploadedDocuments = uploadedDocuments.filter(
            document => document.filename !== filename
        );

        documentList.innerHTML = uploadedDocuments
            .map(
                document => `
                    <div class="document-item">
                        <div class="document-icon">📄</div>

                        <div class="document-info">
                            <strong>${document.originalName}</strong>
                            <span>✓ Ready</span>
                        </div>

                        <button 
                            class="delete-btn"
                            onclick="deleteDocument('${document.filename}')"
                            title="Delete document">
                            🗑️
                        </button>
                    </div>
                `
            )
            .join("");

        answer.innerHTML = "Your answer will appear here.";
        context.textContent =
            "Relevant document sections will appear here after retrieval.";
        questionStatus.textContent = "🗑️ Document deleted.";

    } catch (error) {
        questionStatus.textContent = "❌ Delete failed.";
        alert(error.message);
    }
}