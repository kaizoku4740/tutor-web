// Cloudflare Pages Function — /api/ta-dashboard
// Public endpoint for TAs to view their signups
// Filters signups by tutor name (passed as query parameter)

const SIGNUPS_KEY = 'math-tutor-signups';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

// GET: Retrieve signups for a specific tutor
export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const tutor = url.searchParams.get('tutor');
    const date = url.searchParams.get('date');

    if (!tutor) {
      return Response.json(
        { error: 'Tutor name required', example: '/api/ta-dashboard?tutor=Neha%20M.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const data = await env.REVIEWS.get(SIGNUPS_KEY);
    let signups = data ? JSON.parse(data) : [];

    // Filter by tutor
    signups = signups.filter(s => s.tutor === decodeURIComponent(tutor));

    // Filter by date if provided
    if (date) {
      signups = signups.filter(s => s.date === date);
    }

    // Sort by date and time
    signups.sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    // Group by date and time for easier viewing
    const groupedBySession = {};
    signups.forEach(signup => {
      const sessionKey = `${signup.date}-${signup.time}`;
      if (!groupedBySession[sessionKey]) {
        groupedBySession[sessionKey] = {
          date: signup.date,
          time: signup.time,
          students: []
        };
      }
      groupedBySession[sessionKey].students.push({
        id: signup.id,
        name: signup.name,
        contact: signup.contact,
        goal: signup.goal,
        isEmail: signup.isEmail,
        signedUpAt: signup.createdAt
      });
    });

    // Convert to array and sort
    const sessions = Object.values(groupedBySession).sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return Response.json({
      success: true,
      tutor: decodeURIComponent(tutor),
      totalStudents: signups.length,
      totalSessions: sessions.length,
      sessions
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Error fetching TA dashboard:', err);
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500, headers: corsHeaders() });
  }
}
