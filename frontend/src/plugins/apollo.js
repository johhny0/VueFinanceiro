import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-boost'

const link = new HttpLink({
  uri: 'http://localhost:4000'
})

const cache = new InMemoryCache({

})

const apollo = new ApolloClient({
  link,
  cache,
  connectToDevTools: process.env.NODE_ENV !== 'production'
})

export default apollo
