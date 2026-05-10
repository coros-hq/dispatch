import { createClient } from '@supabase/supabase-js'
import Cookies from 'js-cookie'

const COOKIE_KEYS = ['access_token', 'refresh_token']

const isCookieKey = (key: string) => COOKIE_KEYS.some((k) => key.includes(k))

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: {
        getItem: (key) => {
          if (isCookieKey(key)) {
            return Cookies.get(key) ?? null
          }
          return localStorage.getItem(key)
        },
        setItem: (key, value) => {
          if (isCookieKey(key)) {
            Cookies.set(key, value, {
              expires: 7,
              path: '/',
              sameSite: 'lax',
              secure: true,
            })
          } else {
            localStorage.setItem(key, value)
          }
        },
        removeItem: (key) => {
          if (isCookieKey(key)) {
            Cookies.remove(key, { path: '/' })
          } else {
            localStorage.removeItem(key)
          }
        },
      },
    },
  }
)