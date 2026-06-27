import express from 'express';
import upload from '../middleware/upload.js';
import { authenticate, requireAdmin, requireStudent } from '../middleware/auth.js';

// Controllers
import * as authCtrl from '../controllers/authController.js';
import * as studentCtrl from '../controllers/studentController.js';
import * as batchCtrl from '../controllers/batchController.js';
import * as notesCtrl from '../controllers/notesController.js';
import * as homeworkCtrl from '../controllers/homeworkController.js';
import * as feesCtrl from '../controllers/feesController.js';
import * as testCtrl from '../controllers/testController.js';
import * as annCtrl from '../controllers/announcementController.js';
import * as galleryCtrl from '../controllers/galleryController.js';
import * as queryCtrl from '../controllers/queryController.js';
import * as timetableCtrl from '../controllers/timetableController.js';
import * as dashCtrl from '../controllers/dashboardController.js';

const router = express.Router();

// --- AUTHENTICATION ROUTES ---
router.post('/auth/login', authCtrl.login);
router.post('/auth/sync', authenticate, authCtrl.syncProfile);
router.get('/auth/profile', authenticate, authCtrl.getProfile);
router.put('/auth/profile-picture', authenticate, upload.single('photo'), authCtrl.updateProfilePicture);
router.post('/auth/forgot-password', authCtrl.forgotPassword);

// --- STUDENT ROUTES (Admin Only) ---
router.get('/students', authenticate, requireAdmin, studentCtrl.getStudents);
router.get('/students/:id', authenticate, requireAdmin, studentCtrl.getStudentById);
router.post('/students', authenticate, requireAdmin, upload.single('photo'), studentCtrl.createStudent);
router.put('/students/:id', authenticate, requireAdmin, upload.single('photo'), studentCtrl.updateStudent);
router.delete('/students/:id', authenticate, requireAdmin, studentCtrl.deleteStudent);

// --- BATCH ROUTES ---
router.get('/batches', authenticate, batchCtrl.getBatches);
router.get('/batches/:id', authenticate, batchCtrl.getBatchById);
router.post('/batches', authenticate, requireAdmin, batchCtrl.createBatch);
router.put('/batches/:id', authenticate, requireAdmin, batchCtrl.updateBatch);
router.delete('/batches/:id', authenticate, requireAdmin, batchCtrl.deleteBatch);

// --- NOTES ROUTES ---
router.get('/notes', authenticate, notesCtrl.getNotes);
router.post('/notes', authenticate, requireAdmin, upload.single('file'), notesCtrl.createNote);
router.delete('/notes/:id', authenticate, requireAdmin, notesCtrl.deleteNote);

// --- HOMEWORK ROUTES ---
router.get('/homework', authenticate, homeworkCtrl.getHomework);
router.post('/homework', authenticate, requireAdmin, upload.single('file'), homeworkCtrl.createHomework);
router.delete('/homework/:id', authenticate, requireAdmin, homeworkCtrl.deleteHomework);

// --- FEES ROUTES ---
router.get('/fees', authenticate, requireAdmin, feesCtrl.getAllFees);
router.get('/fees/my-fees', authenticate, requireStudent, feesCtrl.getMyFees);
router.get('/fees/history/:studentId', authenticate, requireAdmin, feesCtrl.getStudentFeeHistory);
router.post('/fees/pay', authenticate, requireAdmin, feesCtrl.addFeePayment);
router.put('/fees/details/:studentId', authenticate, requireAdmin, feesCtrl.updateFeeDetails);

// --- TEST SERIES & RESULTS ROUTES ---
router.get('/tests', authenticate, testCtrl.getTests);
router.post('/tests', authenticate, requireAdmin, upload.fields([
  { name: 'questionPaper', maxCount: 1 },
  { name: 'answerKey', maxCount: 1 },
  { name: 'solution', maxCount: 1 }
]), testCtrl.createTest);
router.delete('/tests/:id', authenticate, requireAdmin, testCtrl.deleteTest);

router.post('/tests/result', authenticate, requireAdmin, testCtrl.uploadResult);
router.get('/tests/result/student/:studentId', authenticate, requireAdmin, testCtrl.getStudentResults);
router.get('/tests/result/my-results', authenticate, requireStudent, testCtrl.getMyResults);
router.get('/tests/result/test/:testId', authenticate, testCtrl.getTestResults);

// --- ANNOUNCEMENT ROUTES ---
router.get('/announcements', authenticate, annCtrl.getAnnouncements);
router.post('/announcements', authenticate, requireAdmin, annCtrl.createAnnouncement);
router.put('/announcements/:id', authenticate, requireAdmin, annCtrl.updateAnnouncement);
router.delete('/announcements/:id', authenticate, requireAdmin, annCtrl.deleteAnnouncement);

// --- GALLERY & TOPPERS ROUTES ---
router.get('/gallery', authenticate, galleryCtrl.getGallery);
router.post('/gallery', authenticate, requireAdmin, upload.single('image'), galleryCtrl.createGalleryItem);
router.delete('/gallery/:id', authenticate, requireAdmin, galleryCtrl.deleteGalleryItem);

router.get('/gallery/toppers', authenticate, galleryCtrl.getToppers);
router.post('/gallery/toppers', authenticate, requireAdmin, upload.single('photo'), galleryCtrl.createTopper);
router.delete('/gallery/toppers/:id', authenticate, requireAdmin, galleryCtrl.deleteTopper);

// --- QUERIES/INBOX ROUTES ---
router.get('/queries', authenticate, queryCtrl.getQueries);
router.post('/queries', authenticate, requireStudent, queryCtrl.createQuery);
router.put('/queries/reply/:id', authenticate, requireAdmin, queryCtrl.replyToQuery);
router.delete('/queries/:id', authenticate, queryCtrl.deleteQuery);

// --- TIMETABLE ROUTES ---
router.get('/timetable', authenticate, timetableCtrl.getTimetable);
router.post('/timetable', authenticate, requireAdmin, timetableCtrl.createTimetableEntry);
router.put('/timetable/:id', authenticate, requireAdmin, timetableCtrl.updateTimetableEntry);
router.delete('/timetable/:id', authenticate, requireAdmin, timetableCtrl.deleteTimetableEntry);

// --- DASHBOARD & ANALYTICS ROUTES ---
router.get('/dashboard/admin', authenticate, requireAdmin, dashCtrl.getAdminDashboardData);
router.get('/dashboard/student', authenticate, requireStudent, dashCtrl.getStudentDashboardData);

export default router;
