import express from 'express';
import {
  uploadResume,
  getResumes,
  getResumeById,
  analyzeResumeWithJD,
  compareResumes,
} from '../controllers/resume.controller.js';
import { protect } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validation.js';
import upload from '../utils/multerConfig.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resume
 *   description: Resume upload and ATS analysis APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Resume:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         fileUrl:
 *           type: string
 *         atsScore:
 *           type: number
 *           example: 78
 *         ranking:
 *           type: number
 *           example: 4
 *         interviewProbability:
 *           type: number
 *           example: 65
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 *     AnalysisResult:
 *       type: object
 *       properties:
 *         matchScore:
 *           type: number
 *           example: 72
 *         matchedKeywords:
 *           type: array
 *           items:
 *             type: string
 *         missingKeywords:
 *           type: array
 *           items:
 *             type: string
 *         recruiterFeedback:
 *           type: string
 *         suggestions:
 *           type: array
 *           items:
 *             type: string
 *         interviewProbability:
 *           type: number
 *           example: 68
 */

/**
 * @swagger
 * /api/resume/upload:
 *   post:
 *     summary: Upload resume and get ATS score
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - resume
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Resume uploaded and analyzed successfully
 *       400:
 *         description: No file uploaded
 */
router.post('/resume/upload', protect, upload.single('resume'), uploadResume);

/**
 * @swagger
 * /api/resume:
 *   get:
 *     summary: Get all resumes of logged-in user
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of resumes
 */
router.get('/resume', protect, getResumes);

/**
 * @swagger
 * /api/resume/{id}:
 *   get:
 *     summary: Get resume by ID
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resume details
 *       404:
 *         description: Resume not found
 */
router.get('/resume/:id', protect, getResumeById);

/**
 * @swagger
 * /api/resume/analyze:
 *   post:
 *     summary: Analyze resume with job description using AI
 *     tags: [Resume]
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
 *               - jobDescription
 *             properties:
 *               resumeId:
 *                 type: string
 *                 example: 65f2c1a9b1234567890abcd
 *               jobDescription:
 *                 type: string
 *                 example: We are looking for a MERN stack developer...
 *     responses:
 *       200:
 *         description: AI analysis result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalysisResult'
 */
router.post('/resume/analyze', protect, validate(schemas.analyze), analyzeResumeWithJD);

/**
 * @swagger
 * /api/resume/compare:
 *   post:
 *     summary: Compare two resumes ATS scores
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resume1Id
 *               - resume2Id
 *             properties:
 *               resume1Id:
 *                 type: string
 *               resume2Id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resume comparison result
 */
router.post('/resume/compare', protect, validate(schemas.compare), compareResumes);

export default router;