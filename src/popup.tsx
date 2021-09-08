import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {Bookmark} from './Contract';

const Popup = () => {
  const [currentURL, setCurrentURL] = useState<string>();
  const [bookmarks, setBookmarks] = useState<Array<Bookmark>>([]);

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

  // const getTitle = (url: string) => {
  //   new Promise(function (resolve, reject) {
  //       const xhr = new XMLHttpRequest()
  //       xhr.onload = () => {
  //           if (xhr.readyState === 4 && xhr.status === 200) {
  //               resolve(this.responseXML.title || "no title");
  //           }else{
  //               reject(new Error(xhr.statusText));
  //           }
  //       }
  //       xhr.open("GET", url ,true);
  //       xhr.responseType="document";
  //       xhr.send();
  //   })
  // }

  const addBookmark = () => {
      if(currentURL===undefined){
          console.error("Current url is not provided");
          return;
      }
      const currentDate = new Date();
      let tmp_bookmarks:Array<Bookmark> = [];
      if(bookmarks){
          tmp_bookmarks = bookmarks.slice();
      }
      chrome.tabs.query({ active: true, currentWindow: true },function(tabs) {
          const currentWebTitle: string = tabs[0].title || "No title";
          tmp_bookmarks.push({url:currentURL, date:currentDate.toString(), info:{title:currentWebTitle,},});
          setBookmarks(tmp_bookmarks);
          chrome.storage.sync.set({"bookmarks": tmp_bookmarks}, () =>{
              console.log('added bookmark' + currentURL);
          })
      })
  }

  const changeBackground = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            color: "#0000ff",
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
        {bookmarks && bookmarks.length != 0 &&
            bookmarks.map((bookmark, index) => (
                <button onClick={() => chrome.tabs.create({ url: bookmark.url})} key={index}><p>{bookmark.url}</p><p>title:{bookmark.info.title}</p><p>{bookmark.date}</p></button>
            ))
        }
        <button onClick={addBookmark}>add bookmark</button>
        <button onClick={()=>setBookmarks([])}>clear all bookmark</button>
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
