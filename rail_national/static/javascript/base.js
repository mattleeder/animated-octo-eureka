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
  if (listItems[i].childNodes[0].href != currentURL) {
    continue;
  }
  listItems[i].className += " active";
  console.log("Set active");
  var grandparentNode = listItems[i].parentNode.parentNode;

  // Check if node is in a dropdown container
  if (grandparentNode.classList.contains("dropdown-container")) {
    console.log("Dropdown active");

    // Toggle the active state without the transition period
    var originalTransitionDuration = grandparentNode.style.transitionDuration;
    grandparentNode.style.transitionDuration = "0s";
    grandparentNode.classList.toggle("dropdown-container-visible");
    setTimeout(() => {
      grandparentNode.style.transitionDuration = originalTransitionDuration;
    }, 50);

    // Draw the correct icon and set to the correct state
    var svgIcon = grandparentNode.previousElementSibling.getElementsByTagName("svg")[0];
    svgIcon.innerHTML = `<path d="M200-440v-80h560v80H200Z"/>`;
    grandparentNode.previousElementSibling.dataset.iconState = 1;
  }
  break;
}