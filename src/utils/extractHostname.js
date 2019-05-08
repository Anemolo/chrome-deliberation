export function extractHostname(url) {
  var siteHostname;
  //find & remove protocol (http, ftp, etc.) and get siteHostname

  if (url.indexOf("//") > -1) {
    siteHostname = url.split("/")[2];
  } else {
    siteHostname = url.split("/")[0];
  }

  //find & remove port number
  siteHostname = siteHostname.split(":")[0];
  //find & remove "?"
  siteHostname = siteHostname.split("?")[0];

  return siteHostname;
}

// export { extractHostname };
