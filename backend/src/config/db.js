import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Firebase Configuration Variables
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;

if (!firebaseProjectId || !firebaseClientEmail || !firebasePrivateKey) {
  throw new Error(
    "❌ Firebase Admin SDK configurations are missing! " +
    "Please populate FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your backend/.env file."
  );
}

// Format private key properly
if (firebasePrivateKey.startsWith('"') && firebasePrivateKey.endsWith('"')) {
  firebasePrivateKey = firebasePrivateKey.slice(1, -1);
}
const formattedKey = firebasePrivateKey.replace(/\\n/g, '\n');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: formattedKey,
  }),
  storageBucket: firebaseStorageBucket || `${firebaseProjectId}.appspot.com`,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
console.log('🔥 Connected to Firebase Services (Firestore & Auth) successfully!');

// Supabase configuration
let supabaseUrl = process.env.SUPABASE_URL;
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.trim();
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
  supabaseUrl = supabaseUrl.replace(/\/$/, '');
}

let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (supabaseKey) {
  supabaseKey = supabaseKey.trim();
}

let supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'edumanage-pro';
if (supabaseBucket) {
  supabaseBucket = supabaseBucket.trim();
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ Supabase Storage credentials are missing! " +
    "Please check and populate SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your backend/.env file."
  );
}

const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});
console.log('⚡ Connected to Supabase Storage successfully!');

// DB operations facade
export const dbOps = {
  isFirebase: () => true,

  getCollection: async (collectionName) => {
    const snapshot = await db.collection(collectionName).get();
    const list = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  },

  getDocument: async (collectionName, docId) => {
    const doc = await db.collection(collectionName).doc(docId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  createDocument: async (collectionName, docData, docId = null) => {
    const id = docId || Math.random().toString(36).substring(2, 15);
    const dataWithTimestamp = {
      ...docData,
      createdAt: docData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).doc(id).set(dataWithTimestamp);
    return { id, ...dataWithTimestamp };
  },

  updateDocument: async (collectionName, docId, docData) => {
    const dataWithTimestamp = {
      ...docData,
      updatedAt: new Date().toISOString(),
    };
    await db.collection(collectionName).doc(docId).update(dataWithTimestamp);
    return { id: docId, ...dataWithTimestamp };
  },

  deleteDocument: async (collectionName, docId) => {
    await db.collection(collectionName).doc(docId).delete();
    return true;
  },

  // Auth User creation
  createUser: async (email, password, role) => {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: role,
    });
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    return userRecord.uid;
  },

  deleteUser: async (uid) => {
    try {
      await admin.auth().deleteUser(uid);
    } catch (e) {
      console.error('Firebase user deletion failed or user did not exist.', e.message);
    }
  },

  // File Upload
  uploadFile: async (file, destinationPath) => {
    if (supabaseClient) {
      // Supabase Storage upload
      const { data, error } = await supabaseClient
        .storage
        .from(supabaseBucket)
        .upload(destinationPath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (error) {
        throw new Error('Supabase Storage upload failed: ' + error.message);
      }

      const { data: urlData } = supabaseClient
        .storage
        .from(supabaseBucket)
        .getPublicUrl(destinationPath);

      return urlData.publicUrl;
    } else if (bucket) {
      // Fallback to Firebase Storage if Supabase was bypassed
      const blob = bucket.file(destinationPath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', async () => {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(publicUrl);
        });
        blobStream.end(file.buffer);
      });
    } else {
      throw new Error('No storage backend configured.');
    }
  },

  deleteFile: async (fileUrl) => {
    if (!fileUrl) return;
    try {
      if (fileUrl.includes('supabase.co')) {
        const urlParts = fileUrl.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const pathAndBucket = urlParts[1];
          const firstSlashIndex = pathAndBucket.indexOf('/');
          if (firstSlashIndex !== -1) {
            const bucketName = pathAndBucket.substring(0, firstSlashIndex);
            const filePath = decodeURIComponent(pathAndBucket.substring(firstSlashIndex + 1));
            console.log(`🗑️ Deleting file from Supabase bucket [${bucketName}]: [${filePath}]`);
            const { error } = await supabaseClient
              .storage
              .from(bucketName)
              .remove([filePath]);
            if (error) {
              console.error('❌ Supabase storage file deletion error:', error);
            }
          }
        }
      } else if (fileUrl.includes('storage.googleapis.com')) {
        const bucketPrefix = `https://storage.googleapis.com/${bucket.name}/`;
        if (fileUrl.startsWith(bucketPrefix)) {
          const filePath = decodeURIComponent(fileUrl.substring(bucketPrefix.length));
          console.log(`🗑️ Deleting file from Firebase bucket [${bucket.name}]: [${filePath}]`);
          await bucket.file(filePath).delete();
        }
      }
    } catch (err) {
      console.error('⚠️ Failed to delete physical file from storage:', err.message);
    }
  },
};

export default dbOps;

