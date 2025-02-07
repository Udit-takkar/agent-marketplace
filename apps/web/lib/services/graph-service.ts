import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Transaction } from "@/types/risk";

const GRAPH_URL = process.env.NEXT_PUBLIC_GRAPH_URL;

if (!GRAPH_URL) {
  throw new Error("Missing GRAPH_URL environment variable");
}

export const graphClient = new ApolloClient({
  uri: GRAPH_URL,
  cache: new InMemoryCache(),
});

const RECENT_TRANSACTIONS_QUERY = gql`
  query GetRecentTransactions($limit: Int!) {
    transactions(first: $limit, orderBy: timestamp, orderDirection: desc) {
      id
      hash
      from
      to
      value
      timestamp
    }
  }
`;

export async function queryRecentTransactions(
  limit: number = 10
): Promise<Transaction[]> {
  try {
    const { data } = await graphClient.query({
      query: RECENT_TRANSACTIONS_QUERY,
      variables: { limit },
    });
    return data.transactions;
  } catch (error) {
    console.error("Error querying transactions:", error);
    throw error;
  }
}
