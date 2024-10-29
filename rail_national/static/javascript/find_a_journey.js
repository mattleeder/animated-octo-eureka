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
        this.createSearchBar();
    }

    createSearchBar() {
        this.searchBar = document.createElement("input");
        this.searchBar.classList.add("searchbar-with-suggestions-input")
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
        for (var i = 0; i < maxSuggestions; i++) {
            var listElement = document.createElement("li");
            listElement.classList.add("searchbar-suggestion");
            listElement.textContent = this.filteredSuggestions[i];
            listElement.onclick = () => {
                this.searchBar.value = this.filteredSuggestions[i];
                this.destroyDropdown();
            }
            this.list.appendChild(listElement);
            console.log(`Appending: ${this.filteredSuggestions[i]}`);
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