exports.handler = async function handler(event) {
  try {
    const params = { ...(event.queryStringParameters || {}) }
    const endpoint = params.endpoint || 'search'
    delete params.endpoint

    let url
    if (endpoint.includes('/')) {
      url = `https://itunes.apple.com/${endpoint}`
    } else {
      const qs = new URLSearchParams(params).toString()
      url = `https://itunes.apple.com/${endpoint}?${qs}`
    }

    const response = await fetch(url)
    const text = await response.text()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=120',
      },
      body: text,
    }
  } catch {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ error: 'iTunes request failed' }),
    }
  }
}
