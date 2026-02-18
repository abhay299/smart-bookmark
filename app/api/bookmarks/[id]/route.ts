import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function isValidHttpUrl(url: string) {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const title =
    typeof (body as any)?.title === 'string' ? (body as any).title.trim() : undefined
  const url = typeof (body as any)?.url === 'string' ? (body as any).url.trim() : undefined

  if (!id) {
    return NextResponse.json({ error: 'Bookmark id is required' }, { status: 400 })
  }

  if (title === '' || url === '') {
    return NextResponse.json({ error: 'Title and URL cannot be empty' }, { status: 400 })
  }

  if (url && !isValidHttpUrl(url)) {
    return NextResponse.json(
      { error: 'Invalid URL (must start with http:// or https://)' },
      { status: 400 }
    )
  }

  if (typeof title === 'undefined' && typeof url === 'undefined') {
    return NextResponse.json(
      { error: 'At least one of title or url is required' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (typeof title !== 'undefined') updates.title = title
  if (typeof url !== 'undefined') updates.url = url

  const { data, error } = await supabase
    .from('bookmarks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) {
    // Postgres unique constraint violation
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'This URL is already bookmarked' },
        { status: 409 }
      )
    }

    // No rows found / not updated
    if ((error as any).code === 'PGRST116') {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    console.error('Error updating bookmark:', error)
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }

  return NextResponse.json({ bookmark: data })
}

