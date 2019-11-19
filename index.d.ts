declare module "pull-to-refresh-react" {
  import React from "react";
  
  /**
   * PullToRefresh Component options
   */
  export interface PullToRefreshOptions {
    pullDownHeight?: number;
  }

  export interface PullToRefreshProps {
    onRefresh: () => Promise<any>;
    textError?: string,
    textStart?: string,
    textReady?: string,
    textRefresh?: string
    options?: PullToRefreshOptions;
  }
  
  const PullToRefresh: React.ComponentType<PullToRefreshProps>
  export default PullToRefresh;
}
