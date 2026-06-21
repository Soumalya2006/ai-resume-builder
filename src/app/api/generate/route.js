import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: "⚠️ API Key nahi mili! .env.local check karo." });
    }

    // Auto-detect valid model
    const checkModelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const modelsData = await checkModelsResponse.json();
    const validModel = modelsData.models?.find(m => 
      m.supportedGenerationMethods.includes("generateContent") && 
      (m.name.includes("flash") || m.name.includes("pro"))
    );

    const exactModelName = validModel ? validModel.name.replace('models/', '') : "gemini-1.5-flash";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: exactModelName });
    
    // User se tier (level) bhi receive karenge
    const { name, profession, skills, tier } = await request.json();

    // 🌟 Tier ke hisab se alag-alag aur powerful prompts
    let prompt = "";
    if (tier === "pro") {
      // ₹49 Plan: Industry-specific keywords aur metric-oriented summary
      prompt = `You are a premium resume writer. Write a highly professional, keyword-optimized 3-sentence executive summary for ${name} who is a ${profession}. Core skills: ${skills}. Include strong action verbs and make it highly attractive for top MNC companies.`;
    } else if (tier === "elite") {
      // ₹99 Plan: World-class FAANG/Ivy-League standard summary
      prompt = `You are a world-class elite executive resume consultant. Write an outstanding, metrics-driven, prestigious resume summary for ${name} who is a ${profession}. Core skills: ${skills}. Use advanced Harvard-style vocabulary, weave in industry impact, and optimize perfectly for global applicant tracking systems (ATS) like Google, Meta, or Netflix. Keep it to 3-4 high-impact sentences.`;
    } else {
      // Free Plan: Standard short summary
      prompt = `Write a basic, standard 2-sentence resume summary for a person named ${name} who is a ${profession} with skills: ${skills}.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return NextResponse.json({ summary: response.text() });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ summary: "⚠️ AI service temporary unavailable." });
  }
}