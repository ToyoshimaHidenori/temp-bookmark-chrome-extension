import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import {Bookmark} from './Contract';

const Popup = () => {
  const [currentURL, setCurrentURL] = useState<string>();
  const [bookmarks, setBookmarks] = useState<Array<Bookmark>>([]);
  const [archives, setArchives] = useState<Array<Bookmark>>([]);

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
    chrome.storage.sync.get(['archives'], function(result) {
        setBookmarks(result.archives)
        console.log('Value currently is ' + result.archives);
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
    const archiveBookmark = (bookmark: Bookmark) => {
        let tmp_archives:Array<Bookmark> = [];
        if(archives){
            tmp_archives = archives.slice();
        }
        tmp_archives.push({url:bookmark.url, date:bookmark.date, info:{title:bookmark.info.title,},});
        setArchives(tmp_archives);
        chrome.storage.sync.set({"archives": tmp_archives}, () =>{
            console.log('added archives' + currentURL);
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
        <button onClick={addBookmark}>add bookmark</button>
        <button onClick={()=>setBookmarks([])}>clear all bookmark</button>
        <button onClick={changeBackground}>change background</button>
        <h2>Bookmarks</h2>
      {bookmarks && bookmarks.length != 0 &&
        bookmarks.map((bookmark, index) => (
            <div onClick={() => chrome.tabs.create({ url: bookmark.url})} key={index}><h3>{bookmark.info.title}</h3><p>{bookmark.url}</p><p>{bookmark.date}</p>
                <button onClick={
                    (e) => {
                        e.stopPropagation()
                        archiveBookmark(bookmarks[index])
                        let tmp_bookmarks:Array<Bookmark> = [...bookmarks];
                        tmp_bookmarks.splice(index, 1);
                        setBookmarks(tmp_bookmarks);
                    }
                }>
                Archive</button></div>
        ))
      }

        <h2>Archives</h2>
        {archives && archives.length != 0 &&
        archives.map((bookmark, index) => (
            <div onClick={() => chrome.tabs.create({ url: bookmark.url})} key={index}><h3>{bookmark.info.title}</h3><p>{bookmark.url}</p><p>{bookmark.date}</p>
                <button onClick={
                    (e) => {
                        e.stopPropagation()
                        let tmp_archives:Array<Bookmark> = [...archives];
                        tmp_archives.splice(index, 1);
                        setArchives(tmp_archives);
                    }
                }>
                    Remove Completely</button></div>
        ))
        }
    </>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
