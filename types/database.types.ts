export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark
        Insert: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Bookmark, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
