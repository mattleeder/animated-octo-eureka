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

  break;
}

const svgPlusIcon = `<path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>`;
const svgMinusIcon = `<path d="M200-440v-80h560v80H200Z"/>`;

// Find and highlight active (current) link in navbar
var dropdownButtons = document.getElementsByClassName("dropdown-button");
for (var i = 0; i < dropdownButtons.length; i++) {

    // Check if dropdown has active link
    var dropDownContainer = dropdownButtons[i].nextElementSibling;
    if (dropDownContainer.getElementsByClassName("active").length > 0) {
      
        // Toggle the active state without the transition period
        var originalTransitionDuration = window.getComputedStyle(dropDownContainer).transitionDuration;
        dropDownContainer.style.transitionDuration = "0s";
        dropDownContainer.classList.toggle("dropdown-container-visible");
        console.log(`Original transition duration ${originalTransitionDuration}`);
        var activeDropdownContainer = dropDownContainer;
        setTimeout(() => {
            console.log(activeDropdownContainer);
            activeDropdownContainer.style.transitionDuration = originalTransitionDuration;
        }, 50);

        // Draw the correct icon and set to the correct state
        var svgIcon = dropdownButtons[i].getElementsByTagName("svg")[0];
        svgIcon.innerHTML = `<path d="M200-440v-80h560v80H200Z"/>`;
        dropdownButtons[i].dataset.iconState = 1;

    // Otherwise just set iconState to 0
    } else {
        dropdownButtons[i].dataset.iconState = 0;
    }

    // Add click listener to dropdown buttons
    dropdownButtons[i].addEventListener("click", function() {

        // Toggle visibility
        this.classList.toggle("active-dropdown-button");
        var dropdownContent = this.nextElementSibling;

        console.log("Checking height");
        console.log(dropdownContent);
        dropdownContent.classList.toggle("dropdown-container-visible");

        // Toggle icon
        var svgIcon = this.getElementsByTagName("svg")[0];
        console.log(svgIcon);
        if (this.dataset.iconState == 0) {
            svgIcon.innerHTML = svgMinusIcon;
            this.dataset.iconState = 1;
        } else {
            svgIcon.innerHTML = svgPlusIcon;
            this.dataset.iconState = 0;
        }
    });
}