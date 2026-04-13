// Cloudflare Pages Function — /api/signups
// Admin endpoint to view, filter, and manage signup data

const ADMIN_PASSWORD = 'admin-password-change-me';
const SIGNUPS_KEY = 'math-tutor-signups';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
  };
}

// Verify admin authentication
function verifyAdmin(request) {
  const adminKey = request.headers.get('X-Admin-Key');
  return adminKey === ADMIN_PASSWORD;
}

// GET: Retrieve signups with optional filtering
export async function onRequestGet({ request, env }) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders() });
  }

  try {
    const url = new URL(request.url);
    const tutor = url.searchParams.get('tutor');
    const date = url.searchParams.get('date');

    const data = await env.REVIEWS.get(SIGNUPS_KEY);
    let signups = data ? JSON.parse(data) : [];

    // Apply filters
    if (tutor) {
      signups = signups.filter(s => s.tutor === tutor);
    }
    if (date) {
      signups = signups.filter(s => s.date === date);
    }

    // Group by date and tutor for analytics
    const analytics = {
      totalSignups: signups.length,
      byTutor: {},
      byDate: {},
      slotUtilization: {}
    };

    signups.forEach(s => {
      // Count by tutor
      analytics.byTutor[s.tutor] = (analytics.byTutor[s.tutor] || 0) + 1;

      // Count by date
      analytics.byDate[s.date] = (analytics.byDate[s.date] || 0) + 1;

      // Slot utilization
      const slotKey = `${s.tutor}-${s.date}-${s.time}`;
      if (!analytics.slotUtilization[slotKey]) {
        analytics.slotUtilization[slotKey] = { signups: 0, capacity: 3 };
      }
      analytics.slotUtilization[slotKey].signups += 1;
    });

    return Response.json({ 
      success: true, 
      count: signups.length,
      signups,
      analytics
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Error fetching signups:', err);
    return Response.json({ error: 'Failed to fetch signups' }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE: Remove a specific signup
export async function onRequestDelete({ request, env }) {
  if (!verifyAdmin(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders() });
  }

  try {
    const url = new URL(request.url);
    const signupId = url.searchParams.get('id');

    if (!signupId) {
      return Response.json({ error: 'Signup ID required' }, { status: 400, headers: corsHeaders() });
    }

    const data = await env.REVIEWS.get(SIGNUPS_KEY);
    let signups = data ? JSON.parse(data) : [];

    const originalLength = signups.length;
    signups = signups.filter(s => s.id !== signupId);

    if (signups.length === originalLength) {
      return Response.json({ error: 'Signup not found' }, { status: 404, headers: corsHeaders() });
    }

    await env.REVIEWS.put(SIGNUPS_KEY, JSON.stringify(signups));

    return Response.json({ 
      success: true, 
      message: 'Signup removed'
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error('Error deleting signup:', err);
    return Response.json({ error: 'Failed to delete signup' }, { status: 500, headers: corsHeaders() });
  }
}
