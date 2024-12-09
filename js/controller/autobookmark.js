// controller/autobookmark.js

let browser = typeof chrome !== "undefined" ? chrome : browser;

export function addBookmarkAutocomplete() {
    const taskUrlInput = document.getElementById("taskUrl");
    const dropdown = document.createElement("div");
    const clearUrlBtn = document.getElementById("clearUrlBtn");
    const addUrlCheckbox = document.getElementById("addUrlCheckbox");

    dropdown.id = "bookmarkSuggestions";
    dropdown.classList.add("suggestions-dropdown");

    // Add the suggestion container after the input
    taskUrlInput.parentNode.insertBefore(dropdown, taskUrlInput.nextSibling);

    // Apply styles for scrollable dropdown
    dropdown.style.maxHeight = "200px"; // Set a maximum height for the dropdown
    dropdown.style.overflowY = "auto"; // Enable vertical scrolling when content exceeds max height

    // Logic to search for bookmarks while typing in the input
    taskUrlInput.addEventListener("input", function () {
        const query = this.value;

        // Always hide the dropdown if the input is empty
        if (query.trim().length === 0) {
            dropdown.innerHTML = ""; // Clear any suggestions
            dropdown.style.display = "none"; // Hide the suggestions dropdown
            return; // Exit the function early
        }

        // Clear previous suggestions
        dropdown.innerHTML = "";
        dropdown.style.display = "none"; // Hide when there are no suggestions

        // Search for bookmarks that match the query
        browser.bookmarks.search(query, function (results) {
            if (results.length > 0) {
                dropdown.style.display = "block"; // Show the dropdown if there are results
            } else {
                // If there are no results, hide the dropdown and handle content not in bookmarks
                dropdown.style.display = "none";
                // Add some logic here if desired when no bookmarks match
            }

            results.forEach(bookmark => {
                const option = document.createElement("div");
                option.classList.add("bookmark-option");
                option.textContent = bookmark.title;
                option.setAttribute("data-url", bookmark.url);

                // When a suggestion is selected, autocomplete the field
                option.addEventListener("click", function () {
                    taskUrlInput.value = bookmark.url;
                    dropdown.innerHTML = ""; // Clear dropdown
                    dropdown.style.display = "none"; // Hide after selecting
                });

                dropdown.appendChild(option);
            });
        });
    });

    // Event listener for the clearUrlBtn to clear the input and hide the dropdown
    clearUrlBtn.addEventListener("click", function () {
        taskUrlInput.value = ""; // Clear the input field
        dropdown.innerHTML = ""; // Clear any suggestions
        dropdown.style.display = "none"; // Hide the suggestions dropdown
    });

    // Event listener for the addUrlCheckbox to hide the dropdown when unchecked
    addUrlCheckbox.addEventListener("change", function () {
        if (!this.checked) {
            taskUrlInput.value = ""; // Clear the input field if checkbox is unchecked
            dropdown.innerHTML = ""; // Clear any suggestions
            dropdown.style.display = "none"; // Hide the suggestions dropdown
        }
    });

    // Close the dropdown when clicking outside of the taskUrlInput or dropdown
    document.addEventListener("click", function (event) {
        if (!taskUrlInput.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none"; // Hide the dropdown when clicking outside
        }
    });

    // Optional: Add logic for when no bookmarks match
    taskUrlInput.addEventListener("blur", function () {
        const query = taskUrlInput.value.trim();
        if (query.length > 0) {
            browser.bookmarks.search(query, function (results) {
                if (results.length === 0) {
                    dropdown.style.display = "none"; // Hide dropdown if no match
                }
            });
        }
    });
}