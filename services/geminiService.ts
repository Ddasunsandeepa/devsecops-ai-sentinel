import { GoogleGenAI, Type } from "@google/genai";
import { SecurityScanResult } from "../types";

export const analyzeCodeWithGemini = async (
  code: string, 
  repo: string = "manual-scan", 
  commitHash: string = "draft"
): Promise<SecurityScanResult> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert DevSecOps Security Engineer AI. 
    Your job is to analyze code snippets for security vulnerabilities (OWASP Top 10, CWE).
    You must identify issues like SQL Injection, XSS, Hardcoded Secrets, Insecure Deserialization, etc.
    Be precise and provide actionable remediation advice.
  `;

  const prompt = `
    Analyze the following code snippet for security vulnerabilities.
    
    Code Snippet:
    \`\`\`
    ${code}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { 
              type: Type.INTEGER, 
              description: "A score from 0 (secure) to 100 (critical risk)" 
            },
            summary: { 
              type: Type.STRING, 
              description: "A brief executive summary of the security posture of this snippet." 
            },
            vulnerabilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "The type of vulnerability (e.g., SQL Injection)" },
                  severity: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"] },
                  description: { type: Type.STRING, description: "Detailed explanation of the flaw" },
                  location: { type: Type.STRING, description: "Line number or specific code block" },
                  remediation: { type: Type.STRING, description: "How to fix the issue securely" }
                },
                required: ["type", "severity", "description", "location", "remediation"]
              }
            }
          },
          required: ["riskScore", "summary", "vulnerabilities"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const jsonResult = JSON.parse(resultText);

    return {
      scanId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      repository: repo,
      commitHash: commitHash,
      author: "Current User",
      riskScore: jsonResult.riskScore,
      summary: jsonResult.summary,
      vulnerabilities: jsonResult.vulnerabilities.map((v: any) => ({
        id: crypto.randomUUID(),
        ...v
      }))
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Return a fallback error result instead of crashing
    return {
      scanId: "error",
      timestamp: new Date().toISOString(),
      repository: repo,
      commitHash: commitHash,
      author: "System",
      riskScore: 0,
      summary: "Analysis failed due to API error.",
      vulnerabilities: []
    };
  }
};
