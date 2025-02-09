import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export class ScamIndexService {
  private client: ApolloClient<any>;

  constructor() {
    this.client = new ApolloClient({
      uri: process.env.NEXT_PUBLIC_SCAM_SUBGRAPH_URL,
      cache: new InMemoryCache(),
    });
  }

  private readonly SCAM_REPORTS_QUERY = gql`
    query GetScamReports($address: String!) {
      scamReports(where: { address: $address }) {
        id
        timestamp
        scamType
        severity
        confidence
        description
        status
        votes
        evidences {
          evidenceType
          data
        }
        patterns {
          patternType
          signature
          frequency
        }
      }
    }
  `;

  private readonly DETECTED_PATTERNS_QUERY = gql`
    query GetDetectedPatterns($address: String!) {
      detectedPatterns(
        where: { transaction_contains: $address }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        timestamp
        confidence
        pattern {
          patternType
          frequency
        }
      }
    }
  `;

  async getScamReports(address: string) {
    try {
      const { data } = await this.client.query({
        query: this.SCAM_REPORTS_QUERY,
        variables: { address: address.toLowerCase() },
      });
      return data.scamReports;
    } catch (error) {
      console.error("Error fetching scam reports:", error);
      throw error;
    }
  }

  async getDetectedPatterns(address: string) {
    try {
      const { data } = await this.client.query({
        query: this.DETECTED_PATTERNS_QUERY,
        variables: { address: address.toLowerCase() },
      });
      return data.detectedPatterns;
    } catch (error) {
      console.error("Error fetching detected patterns:", error);
      throw error;
    }
  }
}

export const scamIndexService = new ScamIndexService();
