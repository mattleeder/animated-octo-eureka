function getNFastestJourneys() {
    journeyStart = document.getElementById("journey-start-input").value;
    journeyEnd = document.getElementById("journey-end-input").value;
    journeyStartTime = document.getElementById("journey-departure-time").value;
}

class searchBarWithSuggestions {

    constructor(suggestionsEndpoint, maxNumberOfSuggestionsDisplayed) {
        this.suggestionsEndpoint = suggestionsEndpoint;
        this.maxNumberOfSuggestionsDisplayed = maxNumberOfSuggestionsDisplayed;
        this.dropdownExists = false;
        this.dropdown = null;
        this.suggestions = [];
    }

    createSearchBar() {

    }

    attachOnKeyUpListener(targetForListener) {
        targetForListener.onkeyup = function() {

        }
    }

    createDropdown() {
        const fragment = new DocumentFragment();
        var parent = document.createElement("div");
        var list = document.createElement("ul");

        parent.appendChild(list);
        fragment.appendChild(parent);

        parent.style.backgroundColor = "#ffffff";
        parent.style.height = "300px";
        parent.style.width = "300px";

        var section = document.getElementsByTagName("section")[0];
        section.appendChild(fragment);

        this.parent = section;
        this.dropdown = parent;
        this.list = list;
        this.dropdownExists = true;
    }

    destroyDropdown() {
        if (this.dropdownExists) {
            this.parent.removeChild(this.dropdown);
            this.dropdownExists = false;
        }
    }

    resizeDropdown() {

    }

    clearDropdown() {
        while (this.list.firstChild) {
            this.list.removeChild(this.list.lastChild);
        }
    }

    populateDropdown() {
        var maxSuggestions = Math.min(this.maxNumberOfSuggestionsDisplayed, this.suggestions.length);
        for (var i = 0; i < maxSuggestions; i++) {
            var listElement = document.createElement("li");
            listElement.textContent = this.suggestions[i];
            this.list.appendChild(listElement);
            console.log(`Appending: ${this.suggestions[i]}`);
        }
    }

    getSuggestions() {
        this.suggestions = ["a", "b", "c"];
    }

    checkInitialData() {

    }

}