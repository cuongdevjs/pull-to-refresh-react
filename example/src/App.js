import React, { Component } from "react";

import PullToRefresh from "./PullToRefresh";

export default class App extends Component {
  onRefresh() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5000);
    });
  }

  test() {
    alert("click");
  }

  render() {
    return (
      <PullToRefresh
        options={{ pullDownHeight: 100 }}
        onRefresh={this.onRefresh}
      >
        <div
          style={{
            height: "1000px",
            width: "100%",
            backgroundColor: "blur",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div>Nguyen Manh Cuong - CuongStf</div>
          <button
            style={{ border: "1px solid black" }}
            onClick={() => this.test()}
          >
            Disabled Click when refreshing
          </button>
        </div>
      </PullToRefresh>
    );
  }
}
