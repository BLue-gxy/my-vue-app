import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink, from } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'https://backend.palebluedot.ai/graphql'
})

// Cache implementation
const cache = new InMemoryCache()
const errorLink = onError(({ graphQLErrors, networkError }) => {
  console.log('graphQLErrors: ', graphQLErrors)
  if (graphQLErrors) {
    graphQLErrors.map((g) => {
      console.log('g: ', g)
    })
  } else if (networkError) {
    console.log(`[Network error]: ${networkError}`)
  }
})

const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    headers: {}
  })
  return forward(operation)
})

// Create the apollo client
export const apolloClient = new ApolloClient({
  link: from([middlewareLink, errorLink, httpLink]),
  cache
})
