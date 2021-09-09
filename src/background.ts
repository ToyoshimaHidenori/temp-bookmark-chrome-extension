const checkBookmarks = () => {
  console.log("check");

}

const polling = () => {
  console.log("polling");
  setTimeout(polling, 1000 * 30);
  checkBookmarks();
}

polling();
