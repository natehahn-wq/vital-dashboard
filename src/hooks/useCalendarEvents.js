// Fetches Google Calendar events directly via /api/calendar endpoint.
// Returns events for "today" before 6pm, "tomorrow" after 6pm, merged across all calendars.
import { useState, useEffect } from "react";

export function useCalendarEvents(){
  const [events, setEvents]  = useState(null);   // null=loading, []=empty, [...]=loaded
  const [label,  setLabel]   = useState("today"); // "today" | "tomorrow"
  const [error,  setError]   = useState(null);

  useEffect(()=>{
    const run = async ()=>{
      const now   = new Date();
      const hour  = now.getHours();
      const isAfter6 = hour >= 18;

      // Build date window
      const targetDate = new Date(now);
      if(isAfter6) targetDate.setDate(targetDate.getDate()+1);

      const yyyy = targetDate.getFullYear();
      const mm   = String(targetDate.getMonth()+1).padStart(2,"0");
      const dd   = String(targetDate.getDate()).padStart(2,"0");
      const dayStart = `${yyyy}-${mm}-${dd}T00:00:00`;
      const dayEnd   = `${yyyy}-${mm}-${dd}T23:59:59`;
      const dayLabel = isAfter6 ? "tomorrow" : "today";
      setLabel(dayLabel);

      const CALS = [
        "natehahn@gmail.com",
        "nate@epidemic.agency",
        "nate@lasushico.com",
        "nate@with.partners",
        "family05212513149394648654@group.calendar.google.com",
      ];

      try {
        // Fetch events from all calendars in parallel
        const results = await Promise.all(
          CALS.map(async (calId) => {
            try {
              const url = `/api/calendar?calendarId=${encodeURIComponent(calId)}&timeMin=${encodeURIComponent(dayStart)}&timeMax=${encodeURIComponent(dayEnd)}`;
              const res = await fetch(url);
              if (!res.ok) return [];
              const data = await res.json();
              return (data.items || []).map(ev => ({
                summary: ev.summary || "(No title)",
                start: ev.start && (ev.start.dateTime || ev.start.date) || "",
                end: ev.end && (ev.end.dateTime || ev.end.date) || "",
                location: ev.location || "",
                calendar_id: calId,
              }));
            } catch { return []; }
          })
        );

        // Merge and sort by start time
        const allEvents = results.flat().sort((a, b) => {
          const ta = a.start ? new Date(a.start).getTime() : 0;
          const tb = b.start ? new Date(b.start).getTime() : 0;
          return ta - tb;
        });

        setEvents(allEvents);
        setError(null);
      } catch(e) {
        setEvents([]);
        setError(e.message);
      }
    };
    run();
  }, []);

  return { events, label, error };
}
