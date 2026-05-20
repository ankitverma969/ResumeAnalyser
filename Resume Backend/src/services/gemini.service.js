import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeResume = async (resumeText, jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Analyze the following resume against the job description and provide detailed insights:

      RESUME:
      ${resumeText}

      JOB DESCRIPTION:
      ${jobDescription}

      Please provide:
      1. Match score (0-100)
      2. Matched keywords (comma-separated)
      3. Missing keywords (comma-separated)
      4. Recruiter feedback (2-3 sentences)
      5. Top 5 improvement suggestions

      Format your response as JSON with keys: matchScore, matchedKeywords, missingKeywords, recruiterFeedback, suggestions
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      matchScore: 70,
      matchedKeywords: [],
      missingKeywords: [],
      recruiterFeedback: text.substring(0, 200),
      suggestions: [],
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze resume with AI');
  }
};

export const rewriteResume = async (resumeText, targetRole) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Rewrite the following resume to better match a ${targetRole} position.
      Optimize for ATS systems and make it more impactful:

      ${resumeText}

      Provide the rewritten resume with improved formatting and keyword optimization.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to rewrite resume with AI');
  }
};

export const getRecruiterFeedback = async (resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      As an experienced recruiter, provide honest feedback on this resume:

      ${resumeText}

      Focus on:
      - First impressions
      - Strengths
      - Areas for improvement
      - Overall hirability

      Keep the feedback constructive and professional (3-4 paragraphs).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get recruiter feedback');
  }
};

export const analyzeSkillsGap = async (resumeText, targetRole) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Analyze the skills gap for someone with this resume applying for a ${targetRole} position:

      ${resumeText}

      Provide:
      1. Current skills identified
      2. Required skills for ${targetRole}
      3. Missing skills
      4. Learning recommendations

      Format as JSON with keys: currentSkills, requiredSkills, missingSkills, recommendations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      currentSkills: [],
      requiredSkills: [],
      missingSkills: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze skills gap');
  }
};

export const chatCoach = async (question, resumeText) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are an AI Career Coach. A user with the following resume has a question:

      RESUME CONTEXT:
      ${resumeText ? resumeText.substring(0, 1000) : 'No resume provided'}

      QUESTION:
      ${question}

      Provide helpful, actionable advice. Be conversational but professional.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get AI coach response');
  }
};
