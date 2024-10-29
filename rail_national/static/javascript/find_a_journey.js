function getNFastestJourneys() {
    journeyStart = document.getElementById("journey-start-input").value;
    journeyEnd = document.getElementById("journey-end-input").value;
    journeyStartTime = document.getElementById("journey-departure-time").value;
}

class searchBarWithSuggestions {

    constructor(suggestionsArray, searchBarContainerID, maxNumberOfSuggestionsDisplayed) {
        this.suggestions = suggestionsArray;
        this.filteredSuggestions = [...suggestionsArray];
        this.searchBarContainer = document.getElementById(searchBarContainerID);
        this.maxNumberOfSuggestionsDisplayed = maxNumberOfSuggestionsDisplayed;
        this.dropdownExists = false;
        this.dropdown = null;
        this.attachSearchBar();
    }

    attachSearchBar() {
        console.log(this.searchBarContainer);
        this.searchBar = this.searchBarContainer.getElementsByTagName("input")[0];
        this.searchBar.classList.add("searchbar-with-suggestions-input");
        this.searchBar.onkeyup = () => {
            console.log(this);
            console.log(`Searchbar value: ${this.searchBar.value}`);

            // If no text, destroy dropdown
            if (this.searchBar.value == "") {
                this.destroyDropdown();
                return;
            }

            // If dropdown doesnt exists, create it
            if (!this.dropdownExists) {
                this.createDropdown();
            }

            // Populate the dropdown
            this.filterSuggestions();
            this.populateDropdown();
        }
        this.searchBarContainer.appendChild(this.searchBar);
    }

    createDropdown() {
        const fragment = new DocumentFragment();
        var parent = document.createElement("div");
        var list = document.createElement("ul");

        parent.appendChild(list);
        fragment.appendChild(parent);

        parent.classList.add("searchbar-suggestion-dropdown");

        this.searchBarContainer.appendChild(fragment);

        this.dropdown = parent;
        this.list = list;
        this.dropdownExists = true;
    }

    destroyDropdown() {
        if (this.dropdownExists) {
            this.searchBarContainer.removeChild(this.dropdown);
            this.dropdownExists = false;
        }
    }

    clearDropdown() {
        while (this.list.firstChild) {
            this.list.removeChild(this.list.lastChild);
        }
    }

    populateDropdown() {
        this.clearDropdown();
        var maxSuggestions = Math.min(this.maxNumberOfSuggestionsDisplayed, this.filteredSuggestions.length);
        var searchBarInstance = this;
        for (var i = 0; i < maxSuggestions; i++) {
            var listElement = document.createElement("li");
            listElement.classList.add("searchbar-suggestion");
            listElement.textContent = this.filteredSuggestions[i];
            listElement.onclick = function () {
                searchBarInstance.searchBar.value = this.textContent;
                searchBarInstance.destroyDropdown();
            }
            this.list.appendChild(listElement);
        }
    }

    filterSuggestions() {
        this.filteredSuggestions.length = 0; // Clear array
        for (var i = 0; i < this.suggestions.length; i++) {
            if (this.suggestions[i].toUpperCase().startsWith(this.searchBar.value.toUpperCase())) {
                this.filteredSuggestions.push(this.suggestions[i]);
            }
        }
    }

    checkInitialData() {
        if (this.searchBar.value == "") {
            return;
        }

    }

}