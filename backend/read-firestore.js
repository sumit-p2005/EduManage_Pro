import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
  console.error("❌ Firebase Admin credentials missing from backend/.env");
  process.exit(1);
}

if (firebasePrivateKey.startsWith('"') && firebasePrivateKey.endsWith('"')) {
  firebasePrivateKey = firebasePrivateKey.slice(1, -1);
}
const formattedKey = firebasePrivateKey.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: formattedKey,
  })
});

const db = admin.firestore();

async function readNotes() {
  console.log("⏳ Fetching notes from live Firestore...");
  try {
    const snapshot = await db.collection('notes').get();
    if (snapshot.empty) {
      console.log("ℹ️ No notes found in Firestore notes collection.");
      process.exit(0);
    }

    console.log(`\n🎉 Found ${snapshot.size} notes:`);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`----------------------------------------`);
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${data.title}`);
      console.log(`Subject: ${data.subject}`);
      console.log(`File Name: ${data.fileName}`);
      console.log(`File URL: ${data.fileUrl}`);
      console.log(`Uploaded By: ${data.uploadedBy}`);
      console.log(`Created At: ${data.createdAt}`);
    });
    console.log(`----------------------------------------`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to read from Firestore:", err.message || err);
    process.exit(1);
  }
}

readNotes();
