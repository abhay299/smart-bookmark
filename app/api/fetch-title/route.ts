import { HTML_TITLE_REGEX } from '@/lib/constants'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Validate URL
    new URL(url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SmartBookmark/1.0)',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!response.ok) {
      throw new Error('Failed to fetch URL')
    }

    const html = await response.text()

    // Extract title using regex
    const titleMatch = html.match(HTML_TITLE_REGEX)
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error fetching title:', error)
    
    // Fallback to domain name
    try {
      const domain = new URL(url).hostname
      return NextResponse.json({ title: domain })
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }
  }
}
