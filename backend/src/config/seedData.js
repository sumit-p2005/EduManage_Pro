export const getSeedData = () => {
  const seed = {
    users: {
      "admin_demo": {
        "email": "admin@edumanage.com",
        "password": "admin123",
        "role": "admin",
        "name": "Prof. Sumit Sharma",
        "createdAt": new Date().toISOString()
      },
      "student_demo": {
        "email": "student@edumanage.com",
        "password": "student123",
        "role": "student",
        "name": "Rahul Verma",
        "createdAt": new Date().toISOString()
      }
    },
    students: {
      "student_demo": {
        "name": "Rahul Verma",
        "email": "student@edumanage.com",
        "phone": "9876543210",
        "parentName": "Sanjay Verma",
        "parentPhone": "9876543211",
        "address": "123, Metro Heights, New Delhi",
        "admissionDate": "2026-01-10",
        "batchId": "batch_jee",
        "batchName": "JEE Elite 2026",
        "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "feeDetails": {
          "total": 120000,
          "paid": 80000,
          "remaining": 40000,
          "dueDate": "2026-08-15",
          "status": "Partially Paid"
        }
      },
      "student_2": {
        "name": "Ananya Sen",
        "email": "ananya@edumanage.com",
        "phone": "9876500002",
        "parentName": "Ramesh Sen",
        "parentPhone": "9876500003",
        "address": "45, Green Park, South Delhi",
        "admissionDate": "2026-02-15",
        "batchId": "batch_neet",
        "batchName": "NEET Focus 2026",
        "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "feeDetails": {
          "total": 130000,
          "paid": 130000,
          "remaining": 0,
          "dueDate": "2026-06-01",
          "status": "Paid"
        }
      },
      "student_3": {
        "name": "Kabir Das",
        "email": "kabir@edumanage.com",
        "phone": "9876500004",
        "parentName": "Manish Das",
        "parentPhone": "9876500005",
        "address": "Sector 15, Rohini, Delhi",
        "admissionDate": "2026-03-01",
        "batchId": "batch_foundation",
        "batchName": "Class 10 Foundation",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "feeDetails": {
          "total": 60000,
          "paid": 20000,
          "remaining": 40000,
          "dueDate": "2026-07-05",
          "status": "Pending"
        }
      }
    },
    admins: {
      "admin_demo": {
        "name": "Prof. Sumit Sharma",
        "email": "admin@edumanage.com",
        "phone": "9999988888",
        "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
      }
    },
    batches: {
      "batch_jee": {
        "name": "JEE Elite 2026",
        "teacher": "Prof. Sumit Sharma",
        "subjects": ["Physics", "Chemistry", "Mathematics"],
        "timings": "04:00 PM - 07:00 PM (Mon, Wed, Fri)",
        "status": "Active",
        "studentsCount": 1
      },
      "batch_neet": {
        "name": "NEET Focus 2026",
        "teacher": "Dr. Sunita Rao",
        "subjects": ["Physics", "Chemistry", "Biology"],
        "timings": "04:00 PM - 07:00 PM (Tue, Thu, Sat)",
        "status": "Active",
        "studentsCount": 1
      },
      "batch_foundation": {
        "name": "Class 10 Foundation",
        "teacher": "Mrs. Priya Patel",
        "subjects": ["Science", "Mathematics", "Social Studies"],
        "timings": "02:30 PM - 04:30 PM (Daily)",
        "status": "Active",
        "studentsCount": 1
      }
    },
    subjects: {
      "sub_phy": { "name": "Physics" },
      "sub_chem": { "name": "Chemistry" },
      "sub_math": { "name": "Mathematics" },
      "sub_bio": { "name": "Biology" },
      "sub_sci": { "name": "Science" }
    },
    notes: {
      "note_1": {
        "title": "Electrostatics Lecture Notes",
        "description": "Comprehensive notes detailing Coulomb's Law, Electric Fields, and Gauss Theorem with practice questions.",
        "subject": "Physics",
        "chapter": "Electrostatics",
        "topic": "Electric Field & Potential",
        "batchId": "batch_jee",
        "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "fileName": "Electrostatics_L1.pdf",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      "note_2": {
        "title": "Organic Chemistry - Nomenclature",
        "description": "Rules for naming IUPAC alkanes, alkenes, alkynes, and aromatic compounds.",
        "subject": "Chemistry",
        "chapter": "Organic Chemistry",
        "topic": "IUPAC Rules",
        "batchId": "batch_jee",
        "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "fileName": "Organic_Nomenclature.pdf",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      "note_3": {
        "title": "Human Physiology - Digestion & Absorption",
        "description": "Class notes on digestive organs and enzymes for quick review.",
        "subject": "Biology",
        "chapter": "Human Physiology",
        "topic": "Digestive System",
        "batchId": "batch_neet",
        "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "fileName": "Digestion_Notes.pdf",
        "uploadedBy": "Dr. Sunita Rao",
        "createdAt": new Date().toISOString()
      }
    },
    fees: {
      "fee_rahul_1": {
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "amount": 40000,
        "type": "Installment 1",
        "status": "Paid",
        "date": "2026-01-15"
      },
      "fee_rahul_2": {
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "amount": 40000,
        "type": "Installment 2",
        "status": "Paid",
        "date": "2026-04-10"
      },
      "fee_rahul_3": {
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "amount": 40000,
        "type": "Installment 3",
        "status": "Pending",
        "date": "2026-08-15"
      },
      "fee_ananya_1": {
        "studentId": "student_2",
        "studentName": "Ananya Sen",
        "amount": 130000,
        "type": "Full Fee",
        "status": "Paid",
        "date": "2026-02-15"
      },
      "fee_kabir_1": {
        "studentId": "student_3",
        "studentName": "Kabir Das",
        "amount": 20000,
        "type": "Installment 1",
        "status": "Paid",
        "date": "2026-03-01"
      },
      "fee_kabir_2": {
        "studentId": "student_3",
        "studentName": "Kabir Das",
        "amount": 40000,
        "type": "Installment 2",
        "status": "Pending",
        "date": "2026-07-05"
      }
    },
    tests: {
      "test_1": {
        "title": "Kinematics & Laws of Motion Test",
        "subject": "Physics",
        "batchId": "batch_jee",
        "totalMarks": 100,
        "date": "2026-05-10",
        "questionPaperUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "questionPaperName": "Physics_Kinematics_QP.pdf",
        "answerKeyUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "answerKeyName": "Physics_Kinematics_AK.pdf",
        "solutionUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "solutionName": "Physics_Kinematics_Solutions.pdf",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date().toISOString()
      },
      "test_2": {
        "title": "Chemical Bonding Unit Test",
        "subject": "Chemistry",
        "batchId": "batch_jee",
        "totalMarks": 50,
        "date": "2026-06-20",
        "questionPaperUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "questionPaperName": "Chemistry_Bonding_QP.pdf",
        "answerKeyUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "answerKeyName": "Chemistry_Bonding_AK.pdf",
        "solutionUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "solutionName": "Chemistry_Bonding_Solutions.pdf",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date().toISOString()
      }
    },
    results: {
      "res_1": {
        "testId": "test_1",
        "testTitle": "Kinematics & Laws of Motion Test",
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "marksObtained": 85,
        "totalMarks": 100,
        "rank": 1,
        "grade": "A+",
        "remarks": "Excellent work. Keep it up!",
        "createdAt": new Date().toISOString()
      }
    },
    homework: {
      "hw_1": {
        "title": "Quadratic Equations Assignment",
        "description": "Solve all questions in exercise 4.2. Show step-by-step working.",
        "subject": "Mathematics",
        "dueDate": "2026-07-02",
        "batchId": "batch_jee",
        "attachmentUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        "attachmentName": "Math_Quadratic_HW.pdf",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date().toISOString()
      },
      "hw_2": {
        "title": "Periodic Table Trends Sheet",
        "description": "Complete the trends table detailing Electronegativity, Ionization Enthalpy and Atomic Radius.",
        "subject": "Chemistry",
        "dueDate": "2026-06-28",
        "batchId": "batch_jee",
        "attachmentUrl": "",
        "attachmentName": "",
        "uploadedBy": "Prof. Sumit Sharma",
        "createdAt": new Date().toISOString()
      }
    },
    announcements: {
      "ann_1": {
        "title": "Special Seminar on JEE/NEET Strategy",
        "content": "Join us this Sunday at 10:00 AM for an interactive seminar with IIT and AIIMS Alumni sharing toppers' revision strategies.",
        "pinned": true,
        "date": "2026-06-25",
        "author": "Prof. Sumit Sharma",
        "createdAt": new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      "ann_2": {
        "title": "Holiday Notice - Independence Day",
        "content": "Please note that the institute will remain closed on August 15th on account of Independence Day. Regular classes will resume on August 16th.",
        "pinned": false,
        "date": "2026-06-20",
        "author": "Administration",
        "createdAt": new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    gallery: {
      "g_1": {
        "title": "Topper Felicitations 2025",
        "category": "Toppers",
        "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500",
        "date": "2025-06-15"
      },
      "g_2": {
        "title": "Physics Lab Demonstration Session",
        "category": "Seminars",
        "imageUrl": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500",
        "date": "2025-11-20"
      },
      "g_3": {
        "title": "Annual Prize Distribution Ceremony",
        "category": "Events",
        "imageUrl": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500",
        "date": "2025-12-24"
      }
    },
    queries: {
      "q_1": {
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "type": "Doubt",
        "queryText": "Could you please explain question 5 in the Quadratic Equations homework? I am stuck on finding roots using complex conjugates.",
        "replyText": "Sure, Rahul. In complex conjugate roots, since the coefficients are real, if one root is a + ib, the other is a - ib. We will solve this step-by-step in our next class on Monday.",
        "date": "2026-06-25",
        "status": "Resolved",
        "repliedAt": new Date().toISOString()
      },
      "q_2": {
        "studentId": "student_demo",
        "studentName": "Rahul Verma",
        "type": "Leave Request",
        "queryText": "I need to take leave from Physics class on Monday, June 29th, due to a family medical checkup. Kindly approve.",
        "replyText": "",
        "date": "2026-06-26",
        "status": "Pending",
        "repliedAt": ""
      }
    },
    timetable: {
      "tt_jee_mon": {
        "batchId": "batch_jee",
        "batchName": "JEE Elite 2026",
        "day": "Monday",
        "classes": [
          { "time": "04:00 PM - 05:30 PM", "subject": "Physics", "room": "Classroom 1" },
          { "time": "05:30 PM - 07:00 PM", "subject": "Chemistry", "room": "Classroom 1" }
        ],
        "isCancelled": false,
        "isHoliday": false,
        "remarks": ""
      },
      "tt_jee_wed": {
        "batchId": "batch_jee",
        "batchName": "JEE Elite 2026",
        "day": "Wednesday",
        "classes": [
          { "time": "04:00 PM - 05:30 PM", "subject": "Mathematics", "room": "Classroom 1" },
          { "time": "05:30 PM - 07:00 PM", "subject": "Physics", "room": "Classroom 1" }
        ],
        "isCancelled": false,
        "isHoliday": false,
        "remarks": ""
      },
      "tt_jee_fri": {
        "batchId": "batch_jee",
        "batchName": "JEE Elite 2026",
        "day": "Friday",
        "classes": [
          { "time": "04:00 PM - 05:30 PM", "subject": "Chemistry", "room": "Classroom 1" },
          { "time": "05:30 PM - 07:00 PM", "subject": "Mathematics", "room": "Classroom 1" }
        ],
        "isCancelled": false,
        "isHoliday": false,
        "remarks": ""
      }
    },
    toppers: {
      "t_1": {
        "name": "Pranav Mehta",
        "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        "marks": "99.8 Percentile",
        "rank": "AIR 124",
        "quote": "EduManage Pro gave me organized test solutions and immediate doubt clearing which was key to my success."
      },
      "t_2": {
        "name": "Riya Singhal",
        "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "marks": "685 / 720",
        "rank": "AIR 412",
        "quote": "The structure and consistency of the mock tests simulated actual NEET pressure perfectly."
      }
    }
  };
  return seed;
};
