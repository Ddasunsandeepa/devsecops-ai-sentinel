from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import os
import logging
import json
import abc
from enum import Enum

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = FastAPI(title="Sentinel AI Engine", version="2.0.0")

# --- DATA MODELS ---
class AnalysisStrategy(str, Enum):
    CLOUD_GEMINI = "gemini"
    LOCAL_LIGHTWEIGHT = "local_ml"

class AnalyzeRequest(BaseModel):
    code: str
    repo: str
    commit_hash: str
    strategy: AnalysisStrategy = AnalysisStrategy.CLOUD_GEMINI

class Vulnerability(BaseModel):
    type: str
    severity: str
    description: str
    location: str
    remediation: str

class AnalysisResult(BaseModel):
    status: str
    risk_score: int
    summary: str
    vulnerabilities: list[Vulnerability]

# --- STRATEGY PATTERN FOR MODELS ---

class BaseScanner(abc.ABC):
    @abc.abstractmethod
    async def scan(self, code: str, context: str) -> AnalysisResult:
        pass

# class GeminiScanner(BaseScanner):
#     """
#     Production-grade scanner using Google's Gemini Flash.
#     Optimized for complex reasoning and explanation.
#     """
#     def __init__(self):
#         import google.generativeai as genai
#         self.api_key = os.getenv("API_KEY")
#         if self.api_key:
#             genai.configure(api_key=self.api_key)
#             self.model = genai.GenerativeModel('gemini-1.5-flash')
#         else:
#             logger.warning("Gemini API Key missing. Service may fail if Cloud strategy selected.")

#     async def scan(self, code: str, context: str) -> AnalysisResult:
#         if not self.api_key:
#             raise HTTPException(status_code=500, detail="Cloud API not configured")

#         system_prompt = """
#         You are a Senior Security Engineer. Analyze the code for OWASP Top 10 vulnerabilities.
#         Return strictly valid JSON.
#         Format:
#         {
#             "risk_score": <0-100>,
#             "summary": "...",
#             "vulnerabilities": [{ "type": "...", "severity": "...", "description": "...", "location": "...", "remediation": "..." }]
#         }
#         """
#         prompt = f"{system_prompt}\n\nContext: {context}\nCode:\n{code}"
        
#         try:
#             response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
#             data = json.loads(response.text)
#             return AnalysisResult(status="success", **data)
#         except Exception as e:
#             logger.error(f"Gemini Error: {e}")
#             raise HTTPException(status_code=502, detail="AI Provider Error")

class LocalLightweightScanner(BaseScanner):
    """
    Simulated Local Scanner (e.g., CodeBERT / DeepSeek-Coder-1.3B-Quantized).
    Demonstrates ability to run offline/local inference.
    """
    def __init__(self):
        # In a real implementation, load PyTorch model here:
        # self.tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")
        # self.model = RobertaForSequenceClassification.from_pretrained("...")
        logger.info("Initializing Local Lightweight Model (Simulation)")

    async def scan(self, code: str, context: str) -> AnalysisResult:
        logger.info("Running local inference on CPU...")
        
        # 1. Preprocessing (Tokenization)
        # inputs = self.tokenizer(code, return_tensors="pt")
        
        # 2. Inference
        # logits = self.model(**inputs).logits
        
        # 3. Simulated Heuristics for the demo
        risk_score = 0
        vulns = []
        
        if "eval(" in code or "exec(" in code:
            risk_score = 90
            vulns.append(Vulnerability(
                type="RCE Risk",
                severity="CRITICAL",
                description="Detected dangerous execution function.",
                location="Detected in diff",
                remediation="Remove dynamic execution."
            ))
        elif "password" in code.lower() and "=" in code:
            risk_score = 75
            vulns.append(Vulnerability(
                type="Hardcoded Secret",
                severity="HIGH",
                description="Potential hardcoded credential.",
                location="Variable assignment",
                remediation="Use environment variables."
            ))
            
        return AnalysisResult(
            status="success", 
            risk_score=risk_score, 
            summary="Local offline scan completed. " + ("Issues found." if risk_score > 0 else "Clean."),
            vulnerabilities=vulns
        )

# --- DEPENDENCY INJECTION ---

scanners = {
    # AnalysisStrategy.CLOUD_GEMINI: GeminiScanner(),
    AnalysisStrategy.LOCAL_LIGHTWEIGHT: LocalLightweightScanner(),
}

def get_scanner(strategy: AnalysisStrategy):
    return scanners.get(strategy, scanners[AnalysisStrategy.CLOUD_GEMINI])

# --- ENDPOINTS ---

@app.get("/health")
def health():
    return {"status": "ok", "strategies_available": list(scanners.keys())}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_code(
    request: AnalyzeRequest,
    scanner: BaseScanner = Depends(lambda: scanners[AnalysisStrategy.CLOUD_GEMINI]) # Default to Cloud
):
    # Dynamic strategy selection based on request body
    selected_scanner = scanners.get(request.strategy)
    
    logger.info(f"Analyzing {request.repo} using {request.strategy}")
    
    context = f"Repository: {request.repo}, Commit: {request.commit_hash}"
    return await selected_scanner.scan(request.code, context)
