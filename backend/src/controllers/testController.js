import dbOps from '../config/db.js';

export const getTests = async (req, res) => {
  const { role, uid } = req.user;
  const { batchId } = req.query;

  try {
    const tests = await dbOps.getCollection('tests');
    let filteredTests = tests;

    if (role === 'student') {
      const student = await dbOps.getDocument('students', uid);
      if (!student || !student.batchId) {
        return res.json({ success: true, tests: [] });
      }
      filteredTests = tests.filter(t => t.batchId === student.batchId);
    } else {
      if (batchId) {
        filteredTests = filteredTests.filter(t => t.batchId === batchId);
      }
    }

    // Sort by date descending
    filteredTests.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, tests: filteredTests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTest = async (req, res) => {
  const { title, subject, batchId, totalMarks, date } = req.body;
  const files = req.files; // Multer upload multiple files

  if (!title || !subject || !batchId || !totalMarks || !date) {
    return res.status(400).json({ success: false, message: 'Required fields: title, subject, batchId, totalMarks, date' });
  }

  try {
    const batch = await dbOps.getDocument('batches', batchId);
    if (!batch) {
      return res.status(400).json({ success: false, message: 'Batch not found' });
    }

    let questionPaperUrl = '';
    let questionPaperName = '';
    let answerKeyUrl = '';
    let answerKeyName = '';
    let solutionUrl = '';
    let solutionName = '';

    if (files) {
      if (files.questionPaper && files.questionPaper[0]) {
        const file = files.questionPaper[0];
        questionPaperUrl = await dbOps.uploadFile(file, `tests/qp_${Date.now()}_${file.originalname}`);
        questionPaperName = file.originalname;
      }
      if (files.answerKey && files.answerKey[0]) {
        const file = files.answerKey[0];
        answerKeyUrl = await dbOps.uploadFile(file, `tests/ak_${Date.now()}_${file.originalname}`);
        answerKeyName = file.originalname;
      }
      if (files.solution && files.solution[0]) {
        const file = files.solution[0];
        solutionUrl = await dbOps.uploadFile(file, `tests/sol_${Date.now()}_${file.originalname}`);
        solutionName = file.originalname;
      }
    }

    const testData = {
      title,
      subject,
      batchId,
      batchName: batch.name,
      totalMarks: parseFloat(totalMarks),
      date,
      questionPaperUrl,
      questionPaperName,
      answerKeyUrl,
      answerKeyName,
      solutionUrl,
      solutionName,
      uploadedBy: req.user.email,
      createdAt: new Date().toISOString()
    };

    const newTest = await dbOps.createDocument('tests', testData);
    res.status(201).json({ success: true, test: newTest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTest = async (req, res) => {
  const { id } = req.params;
  try {
    const test = await dbOps.getDocument('tests', id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    // Delete physically stored files
    if (test.questionPaperUrl) await dbOps.deleteFile(test.questionPaperUrl);
    if (test.answerKeyUrl) await dbOps.deleteFile(test.answerKeyUrl);
    if (test.solutionUrl) await dbOps.deleteFile(test.solutionUrl);

    await dbOps.deleteDocument('tests', id);

    // Delete associated results
    const results = await dbOps.getCollection('results');
    const testResults = results.filter(r => r.testId === id);
    for (const resItem of testResults) {
      await dbOps.deleteDocument('results', resItem.id);
    }

    res.json({ success: true, message: 'Test and associated results deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Results management
export const uploadResult = async (req, res) => {
  const { testId, studentId, marksObtained, remarks = '' } = req.body;

  if (!testId || !studentId || marksObtained === undefined) {
    return res.status(400).json({ success: false, message: 'Required fields: testId, studentId, marksObtained' });
  }

  try {
    const test = await dbOps.getDocument('tests', testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const student = await dbOps.getDocument('students', studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const total = test.totalMarks;
    const obtained = parseFloat(marksObtained);
    const percentage = (obtained / total) * 100;

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else if (percentage >= 40) grade = 'E';

    // Look for previous results of this test to calculate Rank
    const results = await dbOps.getCollection('results');
    const siblingResults = results.filter(r => r.testId === testId && r.studentId !== studentId);
    
    // Add current result to rank calculation list
    const rankList = [
      ...siblingResults.map(r => ({ id: r.id, studentId: r.studentId, marks: r.marksObtained })),
      { studentId, marks: obtained }
    ];
    // Sort descending by marks
    rankList.sort((a, b) => b.marks - a.marks);
    
    // Determine ranks
    const rankUpdates = [];
    rankList.forEach((item, index) => {
      const rank = index + 1;
      if (item.id) {
        rankUpdates.push(dbOps.updateDocument('results', item.id, { rank }));
      } else {
        item.rank = rank;
      }
    });

    await Promise.all(rankUpdates);
    const myRank = rankList.find(item => item.studentId === studentId).rank;

    const resultData = {
      testId,
      testTitle: test.title,
      studentId,
      studentName: student.name,
      marksObtained: obtained,
      totalMarks: total,
      grade,
      rank: myRank,
      remarks,
      createdAt: new Date().toISOString()
    };

    // Check if result already exists for this student and test
    const existing = results.find(r => r.testId === testId && r.studentId === studentId);
    let finalResult;

    if (existing) {
      finalResult = await dbOps.updateDocument('results', existing.id, resultData);
    } else {
      finalResult = await dbOps.createDocument('results', resultData);
    }

    res.status(201).json({ success: true, result: finalResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentResults = async (req, res) => {
  const { studentId } = req.params;
  try {
    const results = await dbOps.getCollection('results');
    const filtered = results.filter(r => r.studentId === studentId);
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, results: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyResults = async (req, res) => {
  const { uid } = req.user;
  try {
    const results = await dbOps.getCollection('results');
    const filtered = results.filter(r => r.studentId === uid);
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, results: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTestResults = async (req, res) => {
  const { testId } = req.params;
  try {
    const results = await dbOps.getCollection('results');
    const filtered = results.filter(r => r.testId === testId);
    filtered.sort((a, b) => b.marksObtained - a.marksObtained); // Rank order
    res.json({ success: true, results: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
