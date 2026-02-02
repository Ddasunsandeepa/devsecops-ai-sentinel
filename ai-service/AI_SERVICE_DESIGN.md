# AI Vulnerability Detection Service Design

## 1. High-Level Architecture

The AI Service is designed as a modular FastAPI application. It follows the **Strategy Pattern** to allow switching between a lightweight local model (for speed/offline) and a heavy cloud LLM (for deep reasoning).

```mermaid
graph TD
    A[API Request /analyze] --> B(FastAPI Router)
    B --> C{Model Strategy}
    C -- High Accuracy --> D[Cloud LLM (Gemini/GPT)]
    C -- Low Latency/Offline --> E[Local ML (CodeBERT)]
    D --> F[JSON Response]
    E --> F
```

## 2. Methodology: Two Approaches

### Approach A: Lightweight ML (The "Laptop" Solution)
*   **Model:** `microsoft/codebert-base` or `Salesforce/codet5-base`.
*   **Mechanism:** Fine-tuned binary classifier (Vulnerable vs. Safe).
*   **Explainability:** Uses **Integrated Gradients** (via `Captum` library) to highlight specific tokens in the code that contributed most to the "Vulnerable" classification.
*   **Pros:** Runs on CPU, <50ms latency, zero cost.
*   **Cons:** Harder to generate conversational explanations; requires specific fine-tuning.

### Approach B: Quantized Open Source LLM (The "GenAI" Solution)
*   **Model:** `deepseek-ai/deepseek-coder-1.3b-instruct` (Quantized to 4-bit).
*   **Mechanism:** Generative text-to-text. Prompt the model with the diff and ask for JSON output.
*   **Pros:** Excellent reasoning, understands context, easy to implement.
*   **Cons:** Requires ~2-4GB RAM, slower inference (1-5 seconds on CPU).

**Recommendation for Portfolio:** Implement the **Cloud Approach (Gemini)** for the main demo (reliability) but include the **Code structure** for the Local Approach to prove you understand ML Ops.

## 3. Dataset Strategy

To train or fine-tune the local model, we utilize:

1.  **BigVul:** A large-scale C/C++ vulnerability dataset from real-world commits.
2.  **Devign:** Graph-based vulnerability dataset.
3.  **Synthetic Data (Augmentation):**
    *   Use Gemini Pro to take safe code samples and "insert a SQL injection vulnerability".
    *   This generates balanced training pairs (Clean code vs. Vulnerable code).

## 4. Endpoints

### `POST /analyze`
Analyzes a commit diff.

**Input:**
```json
{
  "code": "function login(u, p) { query('SELECT * FROM users WHERE u=' + u); }",
  "language": "javascript",
  "context": "auth-service login flow"
}
```

**Output:**
```json
{
  "risk_score": 95,
  "vulnerabilities": [
    { "type": "SQL Injection", "location": "line 1", "confidence": "HIGH" }
  ]
}
```

### `POST /explain` (For Local Models)
If using the lightweight model (which only gives a score), this endpoint uses a template-based or smaller LLM to generate human-readable text explaining *why* line X is bad.

## 5. Technical Deep Dive

### Code Embeddings
How do we turn code into math?
1.  **Tokenization:** Code is broken into sub-words (e.g., `function`, `log`, `in`).
2.  **Transformer Layers:** The model (CodeBERT) processes these tokens using Self-Attention. It learns that `query` and `SELECT` are semantically related.
3.  **Pooling:** We take the vector of the `[CLS]` (start) token, which represents the *entire* snippet's semantic meaning, and pass it to a classification layer.

### Commit-Level Context
Detecting vulnerabilities often requires more than just the changed lines.
*   **Data Flow:** A variable might be sanitized in a file *not* included in the diff.
*   **Optimization:** We feed the AI the **Commit Message**. If the message says "Fix parsing bug", the AI enters a specific context frame. If it says "Add user input", the AI heightens sensitivity to Injection attacks.

## 6. Limitations & Improvements
*   **False Positives:** Static analysis often flags unreached code. *Improvement:* Use Reachability Analysis (Control Flow Graph).
*   **Token Limits:** Large files exceed the context window. *Improvement:* Use Sliding Window Attention or RAG (Retrieval Augmented Generation) to fetch only relevant function definitions.
