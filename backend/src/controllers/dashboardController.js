import dbOps from '../config/db.js';

export const getAdminDashboardData = async (req, res) => {
  try {
    const students = await dbOps.getCollection('students');
    const batches = await dbOps.getCollection('batches');
    const tests = await dbOps.getCollection('tests');
    const announcements = await dbOps.getCollection('announcements');
    const queries = await dbOps.getCollection('queries');
    const results = await dbOps.getCollection('results');

    // 1. KPI Calculations
    const totalStudents = students.length;
    const totalBatches = batches.length;
    
    let totalPendingFees = 0;
    students.forEach(s => {
      if (s.feeDetails && s.feeDetails.remaining) {
        totalPendingFees += parseFloat(s.feeDetails.remaining);
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingTests = tests.filter(t => t.date >= todayStr).length;

    // 2. Recent Announcements (max 5)
    const sortedAnnouncements = [...announcements]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // 3. Pending Queries count
    const pendingQueriesCount = queries.filter(q => q.status === 'Pending').length;

    // 4. Fee Reminders (students with remaining fees)
    const feeReminders = students
      .filter(s => s.feeDetails && s.feeDetails.remaining > 0)
      .map(s => ({
        id: s.id,
        name: s.name,
        batchName: s.batchName,
        phone: s.phone,
        parentPhone: s.parentPhone,
        total: s.feeDetails.total,
        paid: s.feeDetails.paid,
        remaining: s.feeDetails.remaining,
        dueDate: s.feeDetails.dueDate,
        status: s.feeDetails.status
      }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Urgency first

    // 5. Chart 1: Students per Batch
    const studentsPerBatch = batches.map(b => {
      const count = students.filter(s => s.batchId === b.id).length;
      return { name: b.name, students: count };
    });

    // 6. Chart 2: Fee Collection Overview
    let collectedFeesTotal = 0;
    students.forEach(s => {
      if (s.feeDetails && s.feeDetails.paid) {
        collectedFeesTotal += parseFloat(s.feeDetails.paid);
      }
    });
    const feeCollectionStats = [
      { name: 'Collected', amount: collectedFeesTotal },
      { name: 'Pending', amount: totalPendingFees }
    ];

    // 7. Chart 3: Monthly Admissions (current year)
    const currentYear = new Date().getFullYear().toString();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyAdmissions = months.map((m, index) => {
      const monthNum = (index + 1).toString().padStart(2, '0');
      const count = students.filter(s => {
        if (!s.admissionDate) return false;
        const [year, month] = s.admissionDate.split('-');
        return year === currentYear && month === monthNum;
      }).length;
      return { name: m, admissions: count };
    });

    // 8. Chart 4: Test Performance averages
    const testPerformance = tests.map(t => {
      const testResults = results.filter(r => r.testId === t.id);
      if (testResults.length === 0) return { name: t.title, average: 0 };
      const totalScore = testResults.reduce((acc, curr) => acc + curr.marksObtained, 0);
      const averagePercentage = ((totalScore / testResults.length) / t.totalMarks) * 100;
      return { name: t.title, average: Math.round(averagePercentage) };
    }).slice(0, 6); // Max 6 tests

    res.json({
      success: true,
      kpis: {
        totalStudents,
        totalBatches,
        totalPendingFees,
        upcomingTests,
        pendingQueriesCount
      },
      recentAnnouncements: sortedAnnouncements,
      feeReminders,
      charts: {
        studentsPerBatch,
        feeCollectionStats,
        monthlyAdmissions,
        testPerformance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentDashboardData = async (req, res) => {
  const { uid } = req.user;

  try {
    const student = await dbOps.getDocument('students', uid);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const announcements = await dbOps.getCollection('announcements');
    const tests = await dbOps.getCollection('tests');
    const homework = await dbOps.getCollection('homework');
    const timetable = await dbOps.getCollection('timetable');
    const notes = await dbOps.getCollection('notes');

    const batchId = student.batchId;

    // 1. Filtered resources
    const myHomework = homework.filter(h => h.batchId === batchId);
    const myTests = tests.filter(t => t.batchId === batchId);
    const myNotes = notes.filter(n => n.batchId === batchId);
    const myTimetable = timetable.filter(tt => tt.batchId === batchId);

    // 2. Upcoming deadlines & schedules
    const todayStr = new Date().toISOString().split('T')[0];
    const pendingHomeworkCount = myHomework.filter(h => h.dueDate >= todayStr).length;
    const upcomingTestsCount = myTests.filter(t => t.date >= todayStr).length;

    // 3. Sort announcements
    const sortedAnnouncements = [...announcements]
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 5);

    // 4. Collect updates feed
    const updates = [];
    myNotes.forEach(n => updates.push({ type: 'note', title: n.title, time: n.createdAt, details: n.subject }));
    myHomework.forEach(h => updates.push({ type: 'homework', title: h.title, time: h.createdAt, details: `Due: ${h.dueDate}` }));
    myTests.forEach(t => updates.push({ type: 'test', title: t.title, time: t.createdAt, details: `Date: ${t.date}` }));

    updates.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({
      success: true,
      studentProfile: {
        name: student.name,
        batchName: student.batchName,
        feeDetails: student.feeDetails
      },
      kpis: {
        pendingHomeworkCount,
        upcomingTestsCount,
        notesCount: myNotes.length
      },
      todayTimetable: myTimetable,
      recentAnnouncements: sortedAnnouncements,
      recentUpdates: updates.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
