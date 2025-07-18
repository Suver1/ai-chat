/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import appCss from '../styles/app.css?url'
import googleSignIn from '../styles/google-sign-in.css?url'
import DefaultCatchBoundary from '~/components/DefaultCatchBoundary'
import PageNotFound from '~/components/PageNotFound'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import InitData from '~/components/initData'
import { fetchUser } from '~/serverFn/user'

export const Route = createRootRoute({
  beforeLoad: async () => {
    // We need to auth on the server so we have access to secure cookies
    return await fetchUser()
  },
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'AI Chat',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet',
        href: googleSignIn,
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: PageNotFound,
  errorComponent: DefaultCatchBoundary,
})

const queryClient = new QueryClient()

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <InitData>
          <Outlet />
        </InitData>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
