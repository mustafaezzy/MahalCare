import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loadBookings, saveBooking, clearBookings } from "../data/bookingService.js";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshBookings = useCallback(async () => {
    setLoading(true);
    const data = await loadBookings();
    setBookings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshBookings();
    // In a production app, you might use Supabase real-time subscriptions here.
    // For now, we fetch on mount.
  }, [refreshBookings]);

  const bookAppointment = useCallback(async (bookingDetails) => {
    const result = await saveBooking(bookingDetails);
    // Fire off the refresh in the background so it doesn't delay the user seeing their token
    refreshBookings();
    return result;
  }, [refreshBookings]);

  const clearAllBookings = useCallback(async () => {
    await clearBookings();
    await refreshBookings();
  }, [refreshBookings]);

  const value = {
    bookings,
    loading,
    bookAppointment,
    clearAllBookings,
    refreshBookings
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBookings must be used within a BookingProvider");
  return ctx;
}
