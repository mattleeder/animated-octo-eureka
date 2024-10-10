console.log("Base JS loaded");

// Get the container element
var navbar = document.getElementById("navbar");

// Get the list inside the navbar
var navbarList = navbar.getElementsByTagName("ul")[0];

// Get all list items inside the list
var listItems = navbarList.getElementsByTagName("li")

// Loop through the list items and add the active class to the current page
const currentURL = window.location.href;
console.log("Looping");
console.log(listItems);
for (var i = 0; i < listItems.length; i++) {
  console.log(listItems[i].childNodes[0].href);
  if (listItems[i].childNodes[0].href == currentURL) {
    listItems[i].className += " active";
    console.log("Set active");
  }
} 

// Add search icon after input in table
span = document.createElement("span");
span.className += "material-symbols-outlined";
span.innerHTML = "search";

tableInputs = document.getElementsByClassName("myInput");
console.log(tableInputs);
for (let i = 0; i < tableInputs.length; i++) {
    console.log("Blah");
    tableInputs[i].after(span);
}