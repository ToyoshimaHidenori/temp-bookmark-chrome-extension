import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [bookmarks, setBookmarks] = useState<Array<string>>();

  useEffect(() => {
    chrome.browserAction.setBadgeText({ text: bookmarks?.length.toString() });
  }, [bookmarks]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
    chrome.storage.sync.get(['bookmarks'], function(result) {
        setBookmarks(result.bookmarks)
        console.log('Value currently is ' + result.bookmarks);
    });
  }, []);

  const addBookmark = () => {
      if(currentURL===undefined){
          console.error("Current url is not provided");
          return;
      }

      let tmp_bookmarks:Array<string> = [];
      if(bookmarks){
          tmp_bookmarks = bookmarks.slice();
      }
      tmp_bookmarks.push(currentURL);
      setBookmarks(tmp_bookmarks);
      chrome.storage.sync.set({"bookmarks": tmp_bookmarks}, () =>{
          console.log('added bookmark' + currentURL);
      })

  }

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#ff5599",
          },
          (msg) => {
            console.log("result message:", msg);
          }
        );
      }
    });
  };

  return (
    <>
      <ul style={{ minWidth: "700px" }}>
        <li>Current URL: {currentURL}</li>
        <li>Current Time: {new Date().toLocaleTimeString()}</li>
      </ul>
        {bookmarks &&
            bookmarks.map((bookmark, index) => (
                <button key={index}>{bookmark}</button>
            ))
        }
        <button onClick={addBookmark}>add bookmark</button>
      <button
        onClick={() => setCount(count + 1)}
        style={{ marginRight: "5px" }}
      >
        count up
      </button>
      <button onClick={changeBackground}>change background</button>
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
