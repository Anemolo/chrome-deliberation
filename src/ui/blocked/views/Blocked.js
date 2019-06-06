import React from "react";

import { Box } from "../../components/primitives";

export function BlockedView(props) {
  return (
    <div className="container view" id="blocked">
      <header>
        <h1 className="title">No more time left</h1>
        <h3 className="subtitle">
          If you really want to keep using this website click the buttom below.
          After 5 minutes, you'll have a 5 minute window to choose how much
          time.
          <br />
          <br />I won't notify you when the window is open, you'll have to check
          by youself
        </h3>
      </header>
      <Box mt={2} className="content">
        <button className=" btn btn-outlined" id="blocked-moreTime">
          See you in 4
        </button>
      </Box>
    </div>
  );
}
