import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { getSeedData } from './src/config/seedData.js';

dotenv.config();

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
  console.error("❌ Error: Firebase Admin credentials missing from backend/.env file.");
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
const auth = admin.auth();
const seed = getSeedData();

async function runSeed() {
  console.log("⏳ Starting Live Firestore Database Seeding...");

  const adminEmail = "admin@edumanage.com";
  const adminPassword = "admin123";
  const adminUid = "admin_demo_uid";

  try {
    // 1. Create Admin user in Firebase Auth
    let authUser;
    try {
      authUser = await auth.getUserByEmail(adminEmail);
      console.log(`✅ Admin user in Auth already exists (UID: ${authUser.uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        authUser = await auth.createUser({
          uid: adminUid,
          email: adminEmail,
          password: adminPassword,
          displayName: 'admin'
        });
        console.log(`✨ Created Admin user in Auth (UID: ${authUser.uid})`);
      } else {
        throw err;
      }
    }

    // Set custom user claims for Admin
    await auth.setCustomUserClaims(authUser.uid, { role: 'admin' });
    console.log("👑 Set Admin custom claims successfully");

    // 2. Clear & Seed Firestore collections
    const collectionsToSeed = ['users', 'students', 'admins', 'batches', 'notes', 'fees', 'tests', 'results', 'homework', 'announcements', 'gallery', 'queries', 'timetable', 'toppers'];

    for (const collName of collectionsToSeed) {
      console.log(`⏳ Seeding collection: ${collName}...`);
      const dataToSeed = seed[collName];

      for (const [id, docData] of Object.entries(dataToSeed)) {
        // Map user profile mapping correctly for admin UIDs
        const targetId = (collName === 'users' && id === 'admin_demo') ? authUser.uid : ((collName === 'admins' && id === 'admin_demo') ? authUser.uid : id);
        
        // Remove password from Firestore users collection for safety (since auth handles password)
        const cleanedDocData = { ...docData };
        if (cleanedDocData.password) {
          delete cleanedDocData.password;
        }

        await db.collection(collName).doc(targetId).set({
          ...cleanedDocData,
          createdAt: docData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      console.log(`✅ Collection "${collName}" seeded successfully.`);
    }

    console.log("\n🎉 Live Firestore Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

runSeed();
