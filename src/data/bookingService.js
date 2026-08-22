import { supabase } from "../supabaseClient.js";

/**
 * Generate a sequential token starting at 001 using Supabase count.
 * Now creates a unique counter per doctor per date.
 */
export async function generateDailyToken(date, doctorName) {
  try {
    const { count, error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('date', date)
      .eq('doctor_name', doctorName);

    if (error) {
      console.error("Supabase count error:", error);
      throw error;
    }

    const nextCount = (count || 0) + 1;
    return String(nextCount).padStart(3, "0");
  } catch (e) {
    console.error("Failed to generate token from Supabase", e);
    // Fallback if Supabase fails (e.g. offline)
    return "001";
  }
}

export async function loadBookings() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case to camelCase for the frontend
    return (data || []).map(b => ({
      ...b,
      doctorName: b.doctor_name
    }));
  } catch (e) {
    console.error("Failed to load bookings from Supabase", e);
    return [];
  }
}

export async function saveBooking(booking) {
  try {
    const token = await generateDailyToken(booking.date, booking.doctorName);
    
    const newBooking = {
      token,
      name: booking.name,
      phone: booking.phone,
      its: booking.its,
      reason: booking.reason,
      doctor_name: booking.doctorName,
      specialty: booking.specialty,
      date: booking.date,
      timing: booking.timing,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([newBooking])
      .select();

    if (error) throw error;

    const savedRecord = data[0];
    
    // Map back to camelCase
    return {
      ok: true,
      booking: {
        ...savedRecord,
        doctorName: savedRecord.doctor_name
      }
    };
  } catch (e) {
    console.error("Failed to save booking to Supabase", e);
    throw new Error("Unable to save booking");
  }
}

export async function clearBookings() {
  try {
    // Delete all records. Note: Supabase requires a filter for delete unless RLS or specific configuration allows it.
    // Using a filter that is always true (e.g. id is not null)
    const { error } = await supabase
      .from('bookings')
      .delete()
      .not('id', 'is', null);
      
    if (error) throw error;
  } catch (e) {
    console.error("Failed to clear bookings from Supabase", e);
  }
}
