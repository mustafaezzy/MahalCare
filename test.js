import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkcbuawgidhkchwhxtbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrY2J1YXdnaWRoa2Nod2h4dGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzQyMDMsImV4cCI6MjEwMTE1MDIwM30._5Egi6JE3EAv3ztYCs2Ntr9PXSgWMyli5SL3vSGHTSs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing Supabase Insert...');
  const testBooking = {
    token: '001',
    name: 'Test Name',
    phone: '1234567890',
    its: '12345678',
    reason: 'Test Reason',
    doctor_name: 'Dr. Test',
    specialty: 'Test Spec',
    date: '2026-08-22',
    timing: '10:00 AM'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([testBooking])
    .select();

  if (error) {
    console.error('INSERT ERROR:', error);
  } else {
    console.log('INSERT SUCCESS:', data);
  }
}

testInsert();
