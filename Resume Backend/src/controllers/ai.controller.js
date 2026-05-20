import Resume from '../models/Resume.js';
import {
  rewriteResume,
  getRecruiterFeedback,
  analyzeSkillsGap,
  chatCoach,
} from '../services/gemini.service.js';
import { calculateInterviewProbability } from '../services/ats.service.js';

export const rewriteResumeController = async (req, res, next) => {
  try {
    const { resumeId, targetRole } = req.body;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const rewrittenText = await rewriteResume(resume.parsedText, targetRole);

    res.json({
      success: true,
      data: {
        original: resume.parsedText,
        rewritten: rewrittenText,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecruiterFeedbackController = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const feedback = await getRecruiterFeedback(resume.parsedText);

    res.json({
      success: true,
      data: {
        feedback,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const skillsGapController = async (req, res, next) => {
  try {
    const { resumeId, targetRole } = req.body;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const skillsAnalysis = await analyzeSkillsGap(resume.parsedText, targetRole);

    res.json({
      success: true,
      data: skillsAnalysis,
    });
  } catch (error) {
    next(error);
  }
};

export const interviewProbabilityController = async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    if (resume.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const probability = calculateInterviewProbability(
      resume.atsScore,
      resume.sectionScores.keywords,
      resume.sectionScores.experience,
      20
    );

    res.json({
      success: true,
      data: {
        probability,
        atsScore: resume.atsScore,
        factors: {
          atsScore: resume.atsScore,
          keywordMatch: resume.sectionScores.keywords,
          experience: resume.sectionScores.experience,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const chatCoachController = async (req, res, next) => {
  try {
    const { resumeId, question } = req.body;

    let resumeText = '';

    if (resumeId) {
      const resume = await Resume.findById(resumeId);

      if (resume && resume.userId.toString() === req.user._id.toString()) {
        resumeText = resume.parsedText;
      }
    }

    const answer = await chatCoach(question, resumeText);

    res.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    next(error);
  }
};
