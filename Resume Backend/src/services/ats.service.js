export const calculateATSScore = (resumeText, parsedData = {}) => {
  const weights = {
    skills: 0.30,
    keywords: 0.25,
    experience: 0.20,
    formatting: 0.15,
    education: 0.10,
  };

  const scores = {
    skills: calculateSkillsScore(resumeText),
    keywords: calculateKeywordsScore(resumeText),
    experience: calculateExperienceScore(resumeText),
    formatting: calculateFormattingScore(resumeText),
    education: calculateEducationScore(resumeText),
  };

  const overallScore = Object.keys(weights).reduce((total, key) => {
    return total + (scores[key] * weights[key]);
  }, 0);

  return {
    overallScore: Math.round(overallScore),
    sectionScores: scores,
  };
};

const calculateSkillsScore = (text) => {
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'mongodb', 'sql',
    'aws', 'docker', 'kubernetes', 'git', 'agile', 'api', 'rest',
    'typescript', 'angular', 'vue', 'express', 'spring', 'django'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = skillKeywords.filter(skill => lowerText.includes(skill));

  const skillScore = (foundSkills.length / skillKeywords.length) * 100;
  return Math.min(Math.round(skillScore * 2), 100);
};

const calculateKeywordsScore = (text) => {
  const importantKeywords = [
    'experience', 'developed', 'managed', 'led', 'created', 'implemented',
    'designed', 'built', 'improved', 'optimized', 'achieved', 'delivered'
  ];

  const lowerText = text.toLowerCase();
  const foundKeywords = importantKeywords.filter(keyword => lowerText.includes(keyword));

  return Math.min(Math.round((foundKeywords.length / importantKeywords.length) * 100 * 1.5), 100);
};

const calculateExperienceScore = (text) => {
  const experiencePatterns = [
    /\d+\+?\s*years?\s*(of\s*)?experience/gi,
    /\d{4}\s*-\s*\d{4}/g,
    /\d{4}\s*-\s*present/gi,
  ];

  let experienceMatches = 0;
  experiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) experienceMatches += matches.length;
  });

  const baseScore = Math.min(experienceMatches * 20, 100);

  if (text.toLowerCase().includes('senior')) baseScore = Math.min(baseScore + 10, 100);
  if (text.toLowerCase().includes('lead')) baseScore = Math.min(baseScore + 10, 100);

  return Math.round(baseScore);
};

const calculateFormattingScore = (text) => {
  let score = 100;

  if (text.length < 500) score -= 30;
  else if (text.length > 5000) score -= 10;

  const sections = ['experience', 'education', 'skills'];
  const lowerText = text.toLowerCase();
  sections.forEach(section => {
    if (!lowerText.includes(section)) score -= 15;
  });

  const hasBulletPoints = text.includes('•') || text.includes('-') || text.includes('*');
  if (!hasBulletPoints) score -= 10;

  return Math.max(score, 0);
};

const calculateEducationScore = (text) => {
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'degree', 'university', 'college',
    'certification', 'certified', 'diploma'
  ];

  const lowerText = text.toLowerCase();
  const foundEducation = educationKeywords.filter(keyword => lowerText.includes(keyword));

  return Math.min(Math.round((foundEducation.length / 4) * 100), 100);
};

export const calculateInterviewProbability = (atsScore, keywordMatch, experienceScore, skillsGapScore) => {
  const probability =
    (atsScore * 0.4) +
    (keywordMatch * 0.3) +
    (experienceScore * 0.2) +
    ((100 - skillsGapScore) * 0.1);

  return Math.round(Math.min(probability, 100));
};

export const calculateRanking = async (currentScore, Resume) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const betterResumes = await Resume.countDocuments({ atsScore: { $gt: currentScore } });

    const percentile = ((totalResumes - betterResumes) / totalResumes) * 100;
    return Math.round(100 - percentile);
  } catch (error) {
    console.error('Error calculating ranking:', error);
    return 50;
  }
};

export const generateHeatmapData = (resumeText, sectionScores) => {
  const sections = ['skills', 'keywords', 'experience', 'formatting', 'education'];

  return sections.map(section => ({
    section: section.charAt(0).toUpperCase() + section.slice(1),
    importance: sectionScores[section] || 0,
  }));
};

export const simulateATSParsing = (resumeText) => {
  return {
    parsingSuccess: Math.random() * 20 + 80,
    keywordExtraction: Math.random() * 15 + 85,
    skillMatch: Math.random() * 25 + 75,
    rankingScore: Math.random() * 30 + 70,
  };
};
