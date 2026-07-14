TABLEFLOW FINAL DARK CLIENT
===========================

This is a complete replacement frontend.

INSTALL
-------

1. Stop the current frontend using Ctrl + C.

2. Go to:
   C:\Users\STUDENT\Desktop\tableflow

3. Rename your existing client folder:
   client  ->  client-backup

4. Extract this ZIP.

5. Copy the extracted client folder into:
   C:\Users\STUDENT\Desktop\tableflow

6. Start it:

   cd "C:\Users\STUDENT\Desktop\tableflow\client"
   npm install
   npm run dev

7. Open:
   http://localhost:5173

8. Press Ctrl + Shift + R once.

FIXED
-----

- Keeps Overview and Reservations list dark design.
- Reservation table rows no longer turn white on hover.
- New Reservation page converted to readable dark cards.
- Reservation Details converted to readable dark cards.
- Reservation Success converted to dark theme.
- Profile, Waitlist, and Service Desk contrast repaired.
- Customer Service Desk now calls /api/service-requests/me.
- Backend and MongoDB files are not included or changed.
