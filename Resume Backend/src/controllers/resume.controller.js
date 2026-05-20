import Resume from '../models/Resume.js';
import JobDescription from '../models/JobDescription.js';
import AnalysisResult from '../models/AnalysisResult.js';
import cloudinary from '../config/cloudinary.js';
import { parseResume } from '../utils/fileParser.js';
import { calculateATSScore, calculateRanking, generateHeatmapData, calculateInterviewProbability } from '../services/ats.service.js';
import { analyzeResume } from '../services/gemini.service.js';
import fs from 'fs';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'auto',
    });

    const parsedText = await parseResume(req.file.path, req.file.mimetype);

    fs.unlinkSync(req.file.path);

    const { overallScore, sectionScores } = calculateATSScore(parsedText);

    const heatmapData = generateHeatmapData(parsedText, sectionScores);

    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: uploadResult.secure_url,
      parsedText,
      atsScore: overallScore,
      sectionScores,
      heatmapData,
    });

    const ranking = await calculateRanking(overallScore, Resume);
    const interviewProbability = calculateInterviewProbability(
      overallScore,
      sectionScores.keywords,
      sectionScores.experience,
      0
    );

    resume.ranking = ranking;
    resume.interviewProbability = interviewProbability;
    await resume.save();

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResumeWithJD = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const jd = await JobDescription.create({
      userId: req.user._id,
      text: jobDescription,
    });

    const aiAnalysis = await analyzeResume(resume.parsedText, jobDescription);

    const analysisResult = await AnalysisResult.create({
      resumeId: resume._id,
      jdId: jd._id,
      matchScore: aiAnalysis.matchScore || 70,
      matchedKeywords: aiAnalysis.matchedKeywords || [],
      missingKeywords: aiAnalysis.missingKeywords || [],
      recruiterFeedback: aiAnalysis.recruiterFeedback || '',
      suggestions: aiAnalysis.suggestions || [],
      interviewProbability: calculateInterviewProbability(
        resume.atsScore,
        aiAnalysis.matchScore || 70,
        resume.sectionScores.experience,
        20
      ),
    });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    next(error);
  }
};

export const compareResumes = async (req, res, next) => {
  try {
    const { resume1Id, resume2Id } = req.body;

    const resume1 = await Resume.findById(resume1Id);
    const resume2 = await Resume.findById(resume2Id);

    if (!resume1 || !resume2) {
      return res.status(404).json({ message: 'One or both resumes not found' });
    }

    if (
      resume1.userId.toString() !== req.user._id.toString() ||
      resume2.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const improvement = resume2.atsScore - resume1.atsScore;

    const sectionComparison = {};
    Object.keys(resume1.sectionScores).forEach(section => {
      sectionComparison[section] = {
        resume1: resume1.sectionScores[section],
        resume2: resume2.sectionScores[section],
        difference: resume2.sectionScores[section] - resume1.sectionScores[section],
      };
    });

    const insights = [];
    if (improvement > 0) {
      insights.push(`Great progress! Your ATS score improved by ${improvement} points.`);
    } else if (improvement < 0) {
      insights.push(`Your score decreased by ${Math.abs(improvement)} points. Review the changes made.`);
    }

    Object.entries(sectionComparison).forEach(([section, data]) => {
      if (data.difference > 10) {
        insights.push(`Strong improvement in ${section} section (+${data.difference} points).`);
      } else if (data.difference < -10) {
        insights.push(`${section} section needs attention (${data.difference} points).`);
      }
    });

    res.json({
      success: true,
      data: {
        resume1Score: resume1.atsScore,
        resume2Score: resume2.atsScore,
        resume1Date: resume1.createdAt,
        resume2Date: resume2.createdAt,
        improvement,
        sectionComparison,
        insights,
      },
    });
  } catch (error) {
    next(error);
  }
};
