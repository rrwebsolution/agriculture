import { GoogleGenAI } from '@google/genai';

// I-setup ang Gemini gamit imong API Key
const ai = new GoogleGenAI({ apiKey: 'IPASTE_IMONG_API_KEY_DINHI' });

async function pangutanaSaGemini() {
    console.log("Waiting for AI response...");
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            // Gi-English na nato ang pangutana
            contents: 'Hello Gemini! What is a good breakfast in the Philippines?',
        });

        console.log("\nGemini's Answer:");
        console.log(response.text);
        
    } catch (error) {
        console.error("Naay error sa pag-connect:", error);
    }
}

pangutanaSaGemini();