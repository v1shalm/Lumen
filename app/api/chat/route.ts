import { NextRequest } from "next/server";

// Simulated research-aware responses keyed to common query patterns
const responses: Record<string, string> = {
  default: `Based on your indexed sources, I've synthesized the following analysis:

The primary finding across your knowledge base indicates a **convergence of evidence** supporting the hypothesis. Sources #1, #3, and #7 all point toward consistent conclusions, while Source #5 presents a notable outlier worth investigating further.

Key insights identified:
• **84 entity relationships** mapped across 14 sources
• **2 active contradictions** flagged for review — primarily around methodology and sample size
• **Confidence score: 94%** weighted by source authority and recency

Would you like me to drill into the contradiction in Source #5, or generate a synthesis report on the full knowledge base?`,

  contradiction: `I've identified a **direct contradiction** between your indexed sources:

**Source #1** (nature.com/articles/s41586-024) asserts a threshold of **1% gate error rate** for logical qubits at scale, citing their 2024 experimental cohort.

**Source #3** (arxiv.org/abs/2104.xxxxx) argues the physical ceiling is **0.1%** for fault-tolerant systems, based on topological qubit decoherence data from Q4 2025 trials.

**Proposed resolution:** The Nature paper uses surface code architecture; the Arxiv paper uses a topological qubit model. These are non-competing claims — they describe different substrates. The 0.1% figure applies specifically to topological systems, making both papers internally consistent when substrate is factored in.

Shall I update the Verified Insights record to flag this as a **Resolution Found** rather than an active contradiction?`,

  summary: `Here's a synthesis of your current knowledge base across all 14 sources:

**Post-Quantum Cryptography (12 sources)**
NIST finalized 3 primary algorithms in Q2 2025. Industry transition roadmap now targets Q3 2026. High confidence (98%).

**Fusion Energy Timelines (8 sources)**
HELION claims commercial operation by 2028; ITER modeling suggests 2035. Contradiction active — tritium breeding ratios differ significantly. Confidence 82%.

**Solid-State Batteries (15 sources)**
QuantumScape's latest density claims (400 Wh/kg) lack independent verification. 3rd-party validation pending. Incomplete — confidence 91%.

**LLM Hallucination Mitigation (24 sources)**
RAG + Reflection loop architectures consistently outperform vanilla prompting by 38–43%. High confidence (95%).

Want me to generate a formatted report for export?`,

  compare: `**Comparative analysis** across your sources:

| Source | Methodology | Sample Size | Peer Reviewed | Confidence |
|--------|-------------|-------------|---------------|------------|
| nature.com #1 | Experimental | n=2,400 | ✓ | High |
| arxiv #3 | Theoretical | n=850 | ✓ | Medium |
| Intel whitepaper | Proprietary | n=12,000 | ✗ | Low |
| MIT Q-Lab | Mixed | n=1,200 | ✓ | High |

The Intel whitepaper is the weakest source — unreviewed and with potential commercial bias. I'd recommend weighting it at 0.3× when synthesizing conclusions.

Shall I re-run the synthesis with adjusted source weighting?`,

  citation: `I found **7 citation opportunities** in your current knowledge base:

1. **NIST PQC Final Standards (2024)** — supports your cryptography transition claims. Cite as: NIST IR 8413, doi:10.6028/NIST.IR.8413
2. **Preskill, J. (2018)** — "Quantum Computing in the NISQ Era and Beyond" — foundational for error rate discussion
3. **McKinsey Global Institute (2025)** — fusion energy market sizing report — supports timeline claims

Do you want me to format these in APA, Chicago, or Vancouver style?`,

  report: `**Generating synthesis report...**

📄 **Lumen Research Report**
*Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}*

---

**Executive Summary**
Your knowledge base of 14 sources across 4 research domains shows strong convergence on 3 of 4 topics, with one active contradiction requiring resolution before publication.

**Confidence Distribution**
- Verified (≥90%): 3 topics
- Flagged contradictions: 1 topic  
- Incomplete data: 1 topic

**Recommended Actions**
1. Resolve tritium breeding ratio contradiction (Sources #4 vs #8)
2. Obtain 3rd-party validation for QuantumScape data
3. Weight Intel whitepaper at reduced confidence

**Next Steps**
Export as PDF or share link? I can also push this to your Verified Insights board.`,
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("contradict") || lower.includes("conflict") || lower.includes("disagree")) return responses.contradiction;
  if (lower.includes("summar") || lower.includes("overview") || lower.includes("what do")) return responses.summary;
  if (lower.includes("compar") || lower.includes("vs") || lower.includes("versus")) return responses.compare;
  if (lower.includes("cit") || lower.includes("reference") || lower.includes("source")) return responses.citation;
  if (lower.includes("report") || lower.includes("export") || lower.includes("generat")) return responses.report;
  return responses.default;
}

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const responseText = getResponse(message as string);
  const words = responseText.split(" ");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Initial pause to feel like "thinking"
      await new Promise((r) => setTimeout(r, 380));

      for (let i = 0; i < words.length; i++) {
        const chunk = i === 0 ? words[i] : " " + words[i];
        controller.enqueue(encoder.encode(chunk));
        // Vary speed: faster for common words, slightly slower for longer ones
        const delay = words[i].length > 8 ? 28 : words[i].includes("**") ? 20 : 18;
        await new Promise((r) => setTimeout(r, delay));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
