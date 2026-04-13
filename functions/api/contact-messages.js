// Cloudflare Pages Function — /api/contact-messages
// Handles signup submissions for the math tutoring calendar.
// POST: Submit new signup
// GET: Retrieve signups (requires X-Admin-Key)
// DELETE: Clear all signups (requires X-Admin-Key)

const ADMIN_PASSWORD = 'admin-password-change-me';
const SIGNUPS_KEY = 'math-tutor-signups';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'
  };
}

// Email validation regex
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation regex (basic - accepts formats like 123-456-7890, (123) 456-7890, etc.)
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\(\)\+\.]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  return phoneRegex;
}

// Validate signup data
function validateSignup(data) {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.emailOrPhone || data.emailOrPhone.trim().length === 0) {
    errors.push('Email or phone is required');
  } else {
    const contact = data.emailOrPhone.trim();
    if (!isValidEmail(contact) && !isValidPhone(contact)) {
      errors.push('Please provide a valid email address or phone number');
    }
  }

  if (!data.goal || data.goal.trim().length === 0) {
    errors.push('Session goal is required');
  }

  if (!data.tutor || data.tutor.trim().length === 0) {
    errors.push('Tutor selection is required');
  }

  if (!data.date || data.date.trim().length === 0) {
    errors.push('Date selection is required');
  }

  if (!data.time || data.time.trim().length === 0) {
    errors.push('Time slot is required');
  }

  return { valid: errors.length === 0, errors };
}

// Create a new signup object
function createSignup(data) {
  return {
    id: `signup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name.trim(),
    contact: data.emailOrPhone.trim(),
    isEmail: isValidEmail(data.emailOrPhone.trim()),
    goal: data.goal.trim(),
    tutor: data.tutor.trim(),
    date: data.date.trim(),
    time: data.time.trim(),
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };
}

// Parse JSON body
async function parseJSONBody(request) {
  try {
    return await request.json();
  } catch (_) {
    return {};
  }
}

// GET: Retrieve all signups (admin only)
export async function onRequestGet({ request, env }) {
  const adminKey = request.headers.get('X-Admin-Key');
  if (adminKey !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders() });
  }

  try {
    const data = await env.REVIEWS.get(SIGNUPS_KEY);
    const signups = data ? JSON.parse(data) : [];
    return Response.json({ success: true, count: signups.length, signups }, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: 'Failed to fetch signups' }, { status: 500, headers: corsHeaders() });
  }
}

// POST: Submit new signup
export async function onRequestPost({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  try {
    const body = await parseJSONBody(request);
    
    // Validate the signup data
    const validation = validateSignup(body);
    if (!validation.valid) {
      return Response.json(
        { success: false, errors: validation.errors },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create the signup object
    const signup = createSignup(body);

    // Retrieve existing signups
    const existing = await env.REVIEWS.get(SIGNUPS_KEY);
    const signups = existing ? JSON.parse(existing) : [];

    // Check for duplicate bookings (same tutor, date, and contact)
    const isDuplicate = signups.some(s => 
      s.tutor === signup.tutor && 
      s.date === signup.date && 
      s.contact === signup.contact
    );

    if (isDuplicate) {
      return Response.json(
        { success: false, error: 'You have already signed up for this time slot' },
        { status: 409, headers: corsHeaders() }
      );
    }

    // Check slot capacity (max 3 per slot)
    const slotsForTutorDate = signups.filter(s => 
      s.tutor === signup.tutor && 
      s.date === signup.date && 
      s.time === signup.time
    );

    if (slotsForTutorDate.length >= 3) {
      return Response.json(
        { success: false, error: 'This slot is now full. Please select another time.' },
        { status: 409, headers: corsHeaders() }
      );
    }

    // Add new signup
    signups.unshift(signup);

    // Keep only recent signups (max 1000 entries)
    const boundedSignups = signups.slice(0, 1000);
    await env.REVIEWS.put(SIGNUPS_KEY, JSON.stringify(boundedSignups));

    return Response.json(
      { 
        success: true, 
        message: 'Signup confirmed!',
        signup: {
          id: signup.id,
          tutor: signup.tutor,
          date: signup.date,
          time: signup.time
        }
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (err) {
    console.error('Signup error:', err);
    return Response.json({ error: 'Failed to process signup' }, { status: 500, headers: corsHeaders() });
  }
}

// DELETE: Clear all signups (admin only)
export async function onRequestDelete({ request, env }) {
  const adminKey = request.headers.get('X-Admin-Key');
  if (adminKey !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Unauthorized' }, { status: 403, headers: corsHeaders() });
  }

  try {
    await env.REVIEWS.put(SIGNUPS_KEY, JSON.stringify([]));
    return Response.json({ success: true, message: 'All signups cleared' }, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: 'Failed to clear signups' }, { status: 500, headers: corsHeaders() });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
