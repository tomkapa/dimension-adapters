import request, { gql } from "graphql-request";
import { Adapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";

const endpoints: { [key: string]: string } = {
  [CHAIN.LIGHTLINK_PHOENIX]:
    "https://graph.phoenix.lightlink.io/query/subgraphs/name/amped-finance/trades",
  [CHAIN.SONIC]:
    "https://api.goldsky.com/api/public/project_cm9j641qy0e0w01tzh6s6c8ek/subgraphs/sonic-trades/1.0.1/gn",
  // [CHAIN.BSC]: "https://api.studio.thegraph.com/query/91379/amped-trades-bsc/version/latest"
  [CHAIN.BERACHAIN]: "https://api.studio.thegraph.com/query/91379/amped-trades-bera/version/latest",
  [CHAIN.BASE]: "https://api.studio.thegraph.com/query/91379/trades-base/version/latest",
  [CHAIN.SSEED]: "https://api.goldsky.com/api/public/project_cm9j641qy0e0w01tzh6s6c8ek/subgraphs/superseed-trades/1.0.1/gn",
};

const historicalDataQuery = gql`
  query get_fees($period: String!, $id: String!) {
    feeStats(where: { period: $period, id: $id }) {
      liquidation
      margin
      swap
    }
  }
`;

interface IGraphResponse {
  feeStats: Array<{
    liquidation: string;
    margin: string;
    swap: string;
  }>;
}

const getFetch = (endpoint: string) => async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(
    new Date(timestamp * 1000)
  );

  const dailyData: IGraphResponse = await request(endpoint, historicalDataQuery, {
    id: String(dayTimestamp) + ":daily" ,
    period: "daily",
  });
  const totalData: IGraphResponse = await request(endpoint, historicalDataQuery, {
    id: "total",
    period: "total",
  });

  const dailyFees = dailyData.feeStats?.length == 1
    ? Number(
      Object.values(dailyData.feeStats[0]).reduce((sum, element) =>
        String(Number(sum) + Number(element))
      )
    ) * 10 ** -30
    : undefined;

  const totalFees = totalData.feeStats?.length == 1
    ? Number(
      Object.values(totalData.feeStats[0]).reduce((sum, element) =>
        String(Number(sum) + Number(element))
      )
    ) * 10 ** -30
    : undefined;

  return {
    timestamp: dayTimestamp,
    dailyFees,
    totalFees,
  };
};

const adapter: Adapter = {
  version: 1,
  adapter: {
    [CHAIN.LIGHTLINK_PHOENIX]: {
      fetch: getFetch(endpoints[CHAIN.LIGHTLINK_PHOENIX]),
      start: '2024-06-01',
      meta: {
        methodology: {
          Fees: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
        },
      },
    },
    [CHAIN.SONIC]: {
      fetch: getFetch(endpoints[CHAIN.SONIC]),
      start: '2024-12-31',
      meta: {
        methodology: {
          Fees: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
        }
      },
    },
    // [CHAIN.BSC]: {
    //   fetch: getFetch(endpoints[CHAIN.BSC]),
    //   start: '2024-10-01',
    //   meta: {
    //     methodology: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
    //   },
    // },
    [CHAIN.BERACHAIN]: {
      fetch: getFetch(endpoints[CHAIN.BERACHAIN]),
      start: '2025-02-06',
      meta: {
        methodology: {
          Fees: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
        }
      },
    },
    [CHAIN.BASE]: {
      fetch: getFetch(endpoints[CHAIN.BASE]),
      start: '2025-02-20',
      meta: {
        methodology: {
          Fees: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
        }
      },
    },
    [CHAIN.SSEED]: {
      fetch: getFetch(endpoints[CHAIN.SSEED]),
      start: '2025-04-22',
      meta: {
        methodology: {
          Fees: "Fees collected from trading, liquidation, and margin activities. All fees go to liquidity providers.",
        }
      },
    },
  }
};

export default adapter;
