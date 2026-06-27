import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

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

console.log('--- Supabase Storage Connection Test ---');
console.log(`URL: ${supabaseUrl || 'Not provided'}`);
console.log(`Key: ${supabaseKey ? '***Provided***' : 'Not provided'}`);
console.log(`Bucket: ${supabaseBucket}`);
console.log('----------------------------------------');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in your backend/.env file.');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false
    }
  });

  console.log('⏳ Attempting to connect & upload test file...');

  const testFileName = `test_${Date.now()}.txt`;
  const fileContent = 'EduManage Pro Supabase Storage Connection Test Successful!';
  const fileBuffer = Buffer.from(fileContent, 'utf-8');

  // 1. Try to upload file
  const { data, error } = await supabase.storage
    .from(supabaseBucket)
    .upload(`tests/${testFileName}`, fileBuffer, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    throw error;
  }

  console.log('✅ File uploaded successfully!');
  console.log('Response Data:', data);

  // 2. Try to get public URL
  const { data: urlData } = supabase.storage
    .from(supabaseBucket)
    .getPublicUrl(`tests/${testFileName}`);

  console.log(`🔗 Public URL: ${urlData.publicUrl}`);

  // 3. Clean up (delete the test file)
  console.log('⏳ Cleaning up (deleting test file from Supabase)...');
  const { error: deleteError } = await supabase.storage
    .from(supabaseBucket)
    .remove([`tests/${testFileName}`]);

  if (deleteError) {
    console.warn('⚠️ Warning: Failed to clean up test file:', deleteError.message);
  } else {
    console.log('🧹 Cleaned up successfully.');
  }

  console.log('\n🎉 SUCCESS! Supabase Storage is configured correctly and fully functional!');
} catch (error) {
  console.error('\n❌ Connection / Upload Test Failed!');
  console.error('Error Details:', error.message || error);
  console.log('\nTroubleshooting Checklist:');
  console.log('1. Verify your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are copied correctly.');
  console.log(`2. Verify that the bucket "${supabaseBucket}" actually exists in your Supabase Console.`);
  console.log(`3. Make sure the bucket is set to PUBLIC in the Supabase console, or your storage policies allow uploads.`);
  process.exit(1);
}
