const ADMIN_PASSWORD = 'password'

export async function onRequestPost(context) {
  const adminKey = context.request.headers.get('X-Admin-Key')
  if (adminKey !== ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { taId, hours } = await context.request.json()

    if (!taId || hours === undefined || hours === null) {
      return new Response(JSON.stringify({ success: false, error: 'Missing taId or hours' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const numHours = parseInt(hours, 10)
    if (isNaN(numHours) || numHours < 0) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid hours value' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Store hours in KV
    const hoursKey = `tutor-hours-${taId}`
    await context.env.REVIEWS.put(hoursKey, JSON.stringify({ taId, hours: numHours, updatedAt: new Date().toISOString() }))

    return new Response(JSON.stringify({ success: true, taId, hours: numHours }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating hours:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function onRequestGet(context) {
  try {
    const taId = new URL(context.request.url).searchParams.get('taId')

    if (taId) {
      // Get hours for specific TA
      const hoursKey = `tutor-hours-${taId}`
      const data = await context.env.REVIEWS.get(hoursKey, 'json')
      if (data) {
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(JSON.stringify({ taId, hours: 0 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get all hours
    const hoursData = {}
    const listResult = await context.env.REVIEWS.list({ prefix: 'tutor-hours-' })
    for (const key of listResult.keys) {
      const data = await context.env.REVIEWS.get(key.name, 'json')
      if (data && data.taId) {
        hoursData[data.taId] = data.hours || 0
      }
    }

    return new Response(JSON.stringify({ success: true, hours: hoursData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error retrieving hours:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
