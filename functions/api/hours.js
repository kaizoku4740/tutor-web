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

    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Store current hours in KV
    const hoursKey = `tutor-hours-${taId}`
    await context.env.REVIEWS.put(hoursKey, JSON.stringify({ taId, hours: numHours, updatedAt: now }))

    // Store history entry
    const historyKey = `tutor-hours-history-${taId}-${today}`
    const existingHistory = await context.env.REVIEWS.get(historyKey, 'json')
    
    const historyEntry = {
      taId,
      hours: numHours,
      date: today,
      timestamp: now,
      entries: existingHistory?.entries || [],
    }
    
    // Add to entries array (keep track of multiple updates on same day)
    historyEntry.entries.push({
      hours: numHours,
      timestamp: now,
    })

    await context.env.REVIEWS.put(historyKey, JSON.stringify(historyEntry))

    return new Response(JSON.stringify({ success: true, taId, hours: numHours, date: today }), {
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
    const url = new URL(context.request.url)
    const taId = url.searchParams.get('taId')
    const historyMode = url.searchParams.get('history') === 'true'

    if (historyMode && taId) {
      // Get history for specific TA
      const listResult = await context.env.REVIEWS.list({ prefix: `tutor-hours-history-${taId}-` })
      const history = []

      for (const key of listResult.keys) {
        const data = await context.env.REVIEWS.get(key.name, 'json')
        if (data) {
          history.push(data)
        }
      }

      // Sort by date descending
      history.sort((a, b) => new Date(b.date) - new Date(a.date))

      return new Response(JSON.stringify({ success: true, taId, history }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (historyMode) {
      // Get all history
      const listResult = await context.env.REVIEWS.list({ prefix: 'tutor-hours-history-' })
      const allHistory = {}

      for (const key of listResult.keys) {
        const data = await context.env.REVIEWS.get(key.name, 'json')
        if (data && data.taId) {
          if (!allHistory[data.taId]) {
            allHistory[data.taId] = []
          }
          allHistory[data.taId].push(data)
        }
      }

      // Sort each TA's history by date descending
      Object.keys(allHistory).forEach((taId) => {
        allHistory[taId].sort((a, b) => new Date(b.date) - new Date(a.date))
      })

      return new Response(JSON.stringify({ success: true, history: allHistory }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (taId) {
      // Get current hours for specific TA
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

    // Get all current hours
    const hoursData = {}
    const listResult = await context.env.REVIEWS.list({ prefix: 'tutor-hours-' })
    for (const key of listResult.keys) {
      if (!key.name.includes('history')) {
        const data = await context.env.REVIEWS.get(key.name, 'json')
        if (data && data.taId) {
          hoursData[data.taId] = data.hours || 0
        }
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
