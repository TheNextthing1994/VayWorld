import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes FIRST
app.post("/api/chat-officer", async (req, res) => {
  try {
    const { systemPrompt, history, message } = req.body;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.parts?.[0]?.text || '' }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ text: response.text || "Keine Antwort erhalten." });
  } catch (error: any) {
    console.error("Error in chat-officer API:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

app.post("/api/refine-idea", async (req, res) => {
  try {
    const { seedTitle, seedDescription, modus } = req.body;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const promptsByMode: Record<string, string> = {
      "Gap Attack": "Fokusmodus: Gap Attack. Analysiere das Saatkorn. Identifiziere ungenutzte Delta-Ressourcen, Schnittstellenbrüche oder Markt-Ineffizienzen zwischen Systemen und überbrücke diese Arbitrage-Lücke.",
      "Analoge Märkte": "Fokusmodus: Analoge Märkte. Übertrage ein bewährtes Business-Model aus einer anderen Branche oder einem anderen Markt (z.B. Airbnb für X, Spotify für Y) auf diese spezifische Nische.",
      "First Principles": "Fokusmodus: First Principles. Zerlege das Problem in seine fundamentalsten physikalischen oder wirtschaftlichen Wahrheiten. Baue von Grund auf eine radikal neue Lösung auf, ohne Analogien zu kopieren.",
      "Inversion": "Fokusmodus: Inversion. Versetze dich zuerst in die Situation, wie man das Problem maximal verschlimmert (maximale Passivität, hohe Frustration). Kehre diese Faktoren konsequent ins Gegenteil um, um eine robuste Lösung zu definieren.",
      "Trend-Intersection": "Fokusmodus: Trend-Intersection. Nimm das traditionelle Szenario und kreuze es mit einem technologischen oder demografischen Megatrend (z.B. generative KI, Dezentralisierung, Hyper-Lokalisierung).",
      "Blue Ocean": "Fokusmodus: Blue Ocean. Frage dich, welche Faktoren der Industrie weggelassen, reduziert, gesteigert oder neu kreiert werden können, um eine konkurrenzfreie Marktnische mit hohem Systemwert zu besetzen.",
      "Jobs-to-be-Done": "Fokusmodus: Jobs-to-be-Done. Ignoriere traditionelle Features. Konzentriere dich komplett auf den emotionalen, sozialen und funktionalen Fortschritt (den 'Job'), für den der Kunde dieses System anheuern möchte."
    };

    const scaffold = promptsByMode[modus] || promptsByMode["Gap Attack"];

    const promptMessage = `Du bist die VayWorld Ideen-Synthese-Unit. Deine Aufgabe ist es, folgendes Saatkorn mit höchster Präzision im angeforderten Modus zu verfeinert und zu veredeln:
    
Saat-Titel: "${seedTitle}"
Saat-Beschreibung: "${seedDescription}"

${scaffold}

Fülle die Antwort streng im angeforderten JSON-Format aus. Denke tief über jedes Feld nach und liefere nützliche, hochinnovative, handfeste Business- und Technologie-Einblicke.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titel: { type: Type.STRING, description: "Ein prägnanter, extrem cooler Name für das veredelte Projekt." },
            kundenproblem: { type: Type.STRING, description: "Das tiefere, emotionale oder funktionale Kundenproblem (Echtes Jobs-to-be-Done)." },
            loesung: { type: Type.STRING, description: "Wie das Produkt/System konkret, einfach und brillant das Problem löst." },
            zielgruppen_nische: { type: Type.STRING, description: "Das genaue Kundensegment (Die perfekte Einstiegsnische)." },
            monetarisierung: { type: Type.STRING, description: "Das primäre Ertragsmodell (z.B. Arbitrage-Schnitt-Marge, Micro-SaaS Abo, Transaktionsgebühr)." },
            erster_validierungsschritt: { type: Type.STRING, description: "Ein unkomplizierter, schneller Testschritt zur Validierung ohne Code/Kosten." },
            unfair_advantage: { type: Type.STRING, description: "Der unfaire Vorteil / Burggraben, der die Kopie extrem erschwert." }
          },
          required: [
            "titel",
            "kundenproblem",
            "loesung",
            "zielgruppen_nische",
            "monetarisierung",
            "erster_validierungsschritt",
            "unfair_advantage"
          ]
        }
      }
    });

    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text);
    res.json({ refined: parsed });
  } catch (error: any) {
    console.error("Error in refine-idea API:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

// --- Stufe 3: Bewertung & Selbstkritik (Gemini als Judge) ---
app.post('/api/judge-idea', async (req, res) => {
  const { idea, recentTitles } = req.body || {};
  const avoidList = Array.isArray(recentTitles) ? recentTitles.slice(-12) : [];
  try {
    const ideaJson = JSON.stringify(idea ?? {});
    const avoidText = avoidList.length
      ? `Bereits kuerzlich generierte Titel (fuer Novelty-Abwertung bei Aehnlichkeit beruecksichtigen): ${avoidList.join(' | ')}.`
      : 'Es liegen keine vorherigen Ideen vor.';
    const prompt = [
      'Du bist ein strenger, erfahrener Venture-Capital-Juror und Startup-Kritiker.',
      'Bewerte die folgende veredelte Geschaeftsidee NUECHTERN und reproduzierbar.',
      'Sei bei Feasibility besonders kritisch (LLM-Ideen ueberschaetzen oft die Machbarkeit).',
      avoidText,
      'Idee (JSON):',
      ideaJson,
      'Gib NUR valides JSON zurueck mit Ganzzahl-Scores 0-100 fuer novelty, feasibility, impact, specificity,',
      'dem groessten Risiko (biggest_risk) und einem konkreten Verbesserungsvorschlag (improvement).'
    ].join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            novelty: { type: Type.NUMBER },
            feasibility: { type: Type.NUMBER },
            impact: { type: Type.NUMBER },
            specificity: { type: Type.NUMBER },
            biggest_risk: { type: Type.STRING },
            improvement: { type: Type.STRING },
          },
          required: ['novelty','feasibility','impact','specificity','biggest_risk','improvement'],
        },
      },
    });

    const parsed = JSON.parse(response.text);
    const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    return res.json({
      novelty: clamp(parsed.novelty),
      feasibility: clamp(parsed.feasibility),
      impact: clamp(parsed.impact),
      specificity: clamp(parsed.specificity),
      biggest_risk: String(parsed.biggest_risk || 'Unbekanntes Risiko.'),
      improvement: String(parsed.improvement || 'Keine Verbesserung vorgeschlagen.'),
      source: 'gemini',
    });
  } catch (err) {
    // Lokaler Fallback-Judge: heuristische Scores, damit das Spiel nie blockiert.
    const txt = JSON.stringify(idea ?? {});
    const len = txt.length;
    const titel = String((idea && idea.titel) || '');
    const dup = avoidList.some(t => typeof t === 'string' && t.trim().toLowerCase() === titel.trim().toLowerCase());
    const seed = (len * 7 + titel.length * 13) % 31;
    const base = (offset) => Math.max(30, Math.min(92, 55 + ((seed + offset) % 30) - 12));
    return res.json({
      novelty: dup ? 28 : base(3),
      feasibility: base(11),
      impact: base(19),
      specificity: Math.min(95, 40 + Math.floor(len / 18)),
      biggest_risk: 'Offline-Bewertung: Markt-Validierung und reale Zahlungsbereitschaft sind ungeprueft.',
      improvement: 'Fuehre 5 Problem-Interviews mit der Zielgruppe, um das Kundenproblem zu schaerfen.',
      source: 'fallback',
    });
  }
});

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
