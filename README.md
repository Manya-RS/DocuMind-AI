# 🧠 DocuMind AI

An AI-powered document question-answering assistant that allows users to upload PDF or TXT documents, retrieve relevant content using embeddings and similarity search, and generate grounded answers using the Gemini API.

## ✨ Features

- 📄 Upload PDF and TXT documents
- 📚 Support for multiple documents
- 🔍 Extract text from uploaded documents
- ✂️ Split long documents into smaller chunks
- 🧠 Generate embeddings for document chunks
- 🔎 Retrieve relevant sections using similarity search
- 💬 Ask questions about uploaded documents
- 🤖 Generate answers grounded in retrieved document context
- 📌 Display retrieved source sections
- 📊 Display similarity scores
- 🗑️ Delete uploaded documents
- ⚠️ Handle invalid files and empty questions
- 🔄 Fallback between Gemini models when a model is temporarily unavailable

## 🏗️ Architecture

```text
User
 │
 ▼
Document Upload
 │
 ▼
Text Extraction
 │
 ▼
Chunking
 │
 ▼
Embedding Generation
 │
 ▼
Document Store
 │
 │
 └───────────────┐
                 │
User Question    │
 │               │
 ▼               │
Question Embedding
 │
 ▼
Similarity Search
 │
 ▼
Relevant Document Chunks
 │
 ▼
Grounded Prompt
 │
 ▼
Gemini API
 │
 ▼
Answer + Retrieved Context
```
Context
🛠️ Tech Stack
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API and server
HTML	User interface structure
CSS	User interface styling
JavaScript	Frontend interaction
Multer	File upload handling
pdf-parse	PDF text extraction
Gemini API	Embeddings and answer generation
gemini-embedding-001	Document and question embeddings
Similarity Search	Relevant chunk retrieval

📁 Project Structure
```
DocuMind-AI/
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── utils/
│   ├── answerGenerator.js
│   ├── chunker.js
│   ├── documentParser.js
│   ├── embeddings.js
│   ├── similarity.js
│   ├── testEmbedding.js
│   └── testMultipleEmbeddings.js
│
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```
⚙️ How It Works
1. Document Upload

The user uploads one or more PDF or TXT files.

The application validates the file type before processing.

2. Text Extraction

For PDF files, text is extracted using pdf-parse.

TXT files are read directly from the uploaded file.

3. Chunking

Long documents are divided into smaller overlapping chunks.

The current configuration uses:

Chunk size: 1200 characters
Overlap: 150 characters

The overlap helps preserve context between neighboring chunks.

4. Embedding Generation

Each document chunk is converted into a numerical embedding using:

gemini-embedding-001

The embeddings use a dimensionality of 768.

5. Question Retrieval

When the user asks a question, the question is also converted into an embedding.

The application compares the question embedding with document chunk embeddings and retrieves the most relevant sections.

6. Grounded Answer Generation

The retrieved document sections are passed to Gemini as context.

The answer-generation prompt instructs the model to use only the retrieved document context.

If the required information cannot be found in the uploaded document, the assistant is instructed to say:

"I couldn't find that information in the uploaded document."

This helps reduce unsupported answers.

🔐 Environment Variables

Create a .env file in the project root:

GEMINI_API_KEY=your_gemini_api_key

The .env file is excluded from Git using .gitignore.

Never commit your API key to GitHub.

▶️ Installation

Clone the repository:

git clone https://github.com/Manya-RS/DocuMind-AI.git

Move into the project:

cd DocuMind-AI

Install dependencies:

npm install

Create your .env file and add your Gemini API key.

🚀 Run the Application

Start the server:

node server.js

Then open:

http://localhost:3000
🧪 Validation

The application handles:

Empty questions
Unsupported file types
Empty/unreadable documents
Failed document processing
Temporary Gemini model failures

The answer-generation module also includes fallback Gemini models when a model is temporarily unavailable.

🎯 ShadowFox AI Engineer Internship

This project was developed as the Intermediate Level – Document-Based Question Answering Assistant for the ShadowFox AI Engineer Internship.

The implementation demonstrates:

Document ingestion
Text extraction
Chunking
Embedding generation
Similarity-based retrieval
Context-grounded answer generation
Source context visibility
User input validation
Modular AI application design
👩‍💻 Author

Manya RS

GitHub:
https://github.com/Manya-RS
