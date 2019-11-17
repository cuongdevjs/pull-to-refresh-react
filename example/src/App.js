import React, { Component } from "react";

import PullToRefresh from "pull-to-refresh-react";

export default class App extends Component {
  onRefresh() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }

  render() {
    return (
      <div>
        <PullToRefresh options={{ height: 60 }} onRefresh={this.onRefresh}>
          <div
            style={{
              height: "500px",
              width: "100%",
              backgroundColor: "black"
            }}
          ></div>
        </PullToRefresh>
      </div>
    );
  }
}
