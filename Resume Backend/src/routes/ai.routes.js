import express from 'express';
import {
  rewriteResumeController,
  getRecruiterFeedbackController,
  skillsGapController,
  interviewProbabilityController,
  chatCoachController,
} from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: Gemini AI powered resume features
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RewriteResponse:
 *       type: object
 *       properties:
 *         original:
 *           type: string
 *         rewritten:
 *           type: string
 *
 *     RecruiterFeedbackResponse:
 *       type: object
 *       properties:
 *         feedback:
 *           type: string
 *
 *     SkillsGapResponse:
 *       type: object
 *       properties:
 *         missingSkills:
 *           type: array
 *           items:
 *             type: string
 *         recommendedSkills:
 *           type: array
 *           items:
 *             type: string
 *         learningResources:
 *           type: array
 *           items:
 *             type: string
 *
 *     InterviewProbabilityResponse:
 *       type: object
 *       properties:
 *         probability:
 *           type: number
 *           example: 72
 *         atsScore:
 *           type: number
 *           example: 78
 *         factors:
 *           type: object
 *           properties:
 *             atsScore:
 *               type: number
 *             keywordMatch:
 *               type: number
 *             experience:
 *               type: number
 *
 *     ChatCoachResponse:
 *       type: object
 *       properties:
 *         answer:
 *           type: string
 */

/**
 * @swagger
 * /api/ai/rewrite:
 *   post:
 *     summary: Rewrite resume for a target role
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *               - targetRole
 *             properties:
 *               resumeId:
 *                 type: string
 *               targetRole:
 *                 type: string
 *                 example: MERN Stack Developer
 *     responses:
 *       200:
 *         description: Rewritten resume text
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RewriteResponse'
 */
router.post('/ai/rewrite', protect, validate(schemas.rewrite), rewriteResumeController);

/**
 * @swagger
 * /api/ai/recruiter-feedback:
 *   post:
 *     summary: Get recruiter-style feedback for a resume
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *             properties:
 *               resumeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recruiter feedback
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecruiterFeedbackResponse'
 */
router.post('/ai/recruiter-feedback', protect, getRecruiterFeedbackController);

/**
 * @swagger
 * /api/ai/skills-gap:
 *   post:
 *     summary: Analyze skills gap for a target role
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *               - targetRole
 *             properties:
 *               resumeId:
 *                 type: string
 *               targetRole:
 *                 type: string
 *                 example: Backend Developer
 *     responses:
 *       200:
 *         description: Skills gap analysis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SkillsGapResponse'
 */
router.post('/ai/skills-gap', protect, skillsGapController);

/**
 * @swagger
 * /api/ai/interview-probability:
 *   post:
 *     summary: Calculate interview probability based on ATS data
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeId
 *             properties:
 *               resumeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Interview probability result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewProbabilityResponse'
 */
router.post('/ai/interview-probability', protect, interviewProbabilityController);

/**
 * @swagger
 * /api/ai/chat-coach:
 *   post:
 *     summary: Ask AI career coach questions
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               resumeId:
 *                 type: string
 *                 description: Optional resume context
 *               question:
 *                 type: string
 *                 example: How can I improve my projects section?
 *     responses:
 *       200:
 *         description: AI coach answer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCoachResponse'
 */
router.post('/ai/chat-coach', protect, chatCoachController);

export default router;