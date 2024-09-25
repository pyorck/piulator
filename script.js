// Call fetchData to initialize the process
fetchData();

let allCities = [];
let fuse;

function fetchData() {
    console.log('Fetching data...');
    fetch('cities.json')
        .then(response => response.json())
        .then(citiesData => {
            allCities = citiesData;
            console.log('Cities fetched:', allCities); // Debugging - check if cities are correctly loaded
            setupFuzzySearch(); // Setup Fuse.js for fuzzy search
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

function clearCity() {
    console.log('Clearing city...');
    document.getElementById('city').value = '';
    document.getElementById('suggestions').innerHTML = '';
    validateForm();
}

// SETTING UP FUZZY SEARCH FOR SUGGESTION DISPLAY
function setupFuzzySearch() {
    console.log('Setting up fuzzy search...');
    const options = {
        threshold: 0.2,
        distance: 100,
        minMatchCharLength: 3,
        keys: ['name']
    };
    // Initialize Fuse with city names
    fuse = new Fuse(allCities.map(city => ({ name: city })), options);
}

// FORM VALIDATION
function validateForm() {
    console.log('Validating form...');
    const city = document.getElementById('city').value.trim();
    const button = document.getElementById('searchButton');
    const errorMessage = document.getElementById('error-message');
    const citiesDiv = document.getElementById('cities');
    const suggestionsBox = document.getElementById('suggestions');

    // Check if city is in the list of valid cities
    const isValid = allCities.includes(city);
    button.disabled = !isValid;

    if (isValid) {
        // Valid city, hide suggestions and update cities div
        errorMessage.textContent = '';
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none'; // Hide suggestions box
        citiesDiv.innerHTML = city; // Show valid city
    } else {
        // Invalid city, show error message and suggestions
        errorMessage.textContent = `Ciudad "${city}" no encontrada. Quizás querías decir:`;
        displaySuggestions(city);
    }
}

// SUGGESTIONS BOX DISPLAY
let typingTimer; // Timer identifier
const typingDelay = 500; // Delay in ms (500ms = 0.5 seconds)
const maxSuggestions = 25; // Set the maximum number of suggestions

function displaySuggestions(input) {
    console.log('Displaying suggestions for:', input);
    const suggestionsBox = document.getElementById('suggestions');

    // Clear the previous timer every time a new character is typed
    clearTimeout(typingTimer);

    if (input.length < 3) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
        return;
    }

    // Set a timer to run the suggestion function once the user stops typing
    typingTimer = setTimeout(() => {
        // Only display suggestions if input is invalid
        if (!allCities.includes(input)) {
            const fuzzyResults = fuse.search(input);
            const suggestions = fuzzyResults.map(result => result.item.name);

            // Limit the number of suggestions to maxSuggestions
            const limitedSuggestions = suggestions.slice(0, maxSuggestions);

            if (limitedSuggestions.length > 0) {
                // Format suggestions as clickable items with underline
                const suggestionsHTML = limitedSuggestions
                    .map(city => `<span class="suggestion-item" onclick="selectSuggestion('${city}')" style="text-decoration:underline;">${city}</span>`)
                    .join(', ');
                suggestionsBox.innerHTML = suggestionsHTML;
                suggestionsBox.style.display = 'block';
                validateForm();
            } else {
                suggestionsBox.innerHTML = 'No hay más sugerencias.';
                suggestionsBox.style.display = 'block';
            }
        } else {
            // Hide suggestions if the city is valid
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    }, typingDelay); // Set the delay to 0.5 seconds (500ms) after user stops typing
}

// ENABLES USER TO CLICK ON SUGGESTIONS
function selectSuggestion(city) {
    console.log('Selecting suggestion:', city);
    document.getElementById('city').value = city;
    document.getElementById('suggestions').innerHTML = '';
    validateForm();
}

// Ensure suggestions box is hidden if input is cleared or invalid
document.getElementById('city').addEventListener('input', function() {
    const inputBox = this;
    inputBox.classList.add('show');  // Add 'show' class to keep input visible
    validateForm(); // Re-validate on input change
});


document.addEventListener('DOMContentLoaded', fetchData);


/////////////////////////////////// HOTWORDS //////////////////////////////////////
/////////////////////////////////// HOTWORDS //////////////////////////////////////
/////////////////////////////////// HOTWORDS //////////////////////////////////////
/////////////////////////////////// HOTWORDS //////////////////////////////////////
/////////////////////////////////// HOTWORDS //////////////////////////////////////
/////////////////////////////////// HOTWORDS //////////////////////////////////////

// Function to count words from the JSON response
async function countWords() {

    // Step 1: Fetch the content from the response.json file
    const response = await fetch('response.json');
    const data = await response.json();
    const textContent = data.content; // Get content from the JSON

    // Step 2: Split the content into words (using regex to match words)
    const wordsArray = textContent.toLowerCase().match(/\w+/g) || [];

    // Step 3: Count word occurrences
    const wordCounts = {};
    wordsArray.forEach(word => {
        // Check if the word length is greater than 1
        if (word.length > 1) {  // Only count words with length greater than 1
            if (wordCounts[word]) {
                wordCounts[word]++;
            } else {
                wordCounts[word] = 1;
            }
        }
    });

    // Step 4: Calculate trending words (for example, words that occur more than 1 time)
    const trendingWords = {};
    for (const [word, count] of Object.entries(wordCounts)) {
        if (count > 1) { // Define your own threshold for trending
            trendingWords[word] = count;
        }
    }

    // Step 5: Display results
    displayTrendingWords(trendingWords);
}

// Function to display trending words

function displayTrendingWords(trendingWords) {
    const trendingWordsDiv = document.getElementById("hotwords");
    trendingWordsDiv.innerHTML = ""; // Clear previous results

    if (Object.keys(trendingWords).length === 0) {
        trendingWordsDiv.innerHTML = "<p></p>";
        return;
    }

    // Define font sizes based on thresholds
    const fontSizeThresholds = [
        5,   // Size for count 1
        10,   // Size for count 2
        15,   // Size for count 3
        20,   // Size for count 4
        25,   // Size for count 5
        30,   // Size for count 6
        35,   // Size for count 7
        40,   // Size for count 8
        45,   // Size for count 9
        50   // Size for count 10 and above
    ];

    // Create a string to hold the HTML content
    let htmlContent = "";

    for (const [word, count] of Object.entries(trendingWords)) {
        // Determine the font size based on the count
        let fontSizeIndex = Math.min(count - 1, fontSizeThresholds.length - 1); // Cap at max index
        let fontSize = fontSizeThresholds[fontSizeIndex];

        // Append the word with its corresponding font size
        htmlContent += `<span style="font-size: ${fontSize}px; margin-right: 10px;">${word}</span>`;
    }

    trendingWordsDiv.innerHTML = htmlContent; // Insert the content into the div
}

        // Run the function when the document is fully loaded
        window.onload = countWords;

// Keep input box visible after typing
document.getElementById('city').addEventListener('input', function() {
    const inputBox = this;
    inputBox.classList.add('show');  // Add 'show' class to keep input visible
});