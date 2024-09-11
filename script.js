  let data = {};
  let allCities = [];

    function fetchData() {
        Promise.all([
            fetch('data.json').then(response => response.json()),
            fetch('cities.json').then(response => response.json())
        ])
        .then(([jsonData, citiesData]) => {
            data = jsonData;
            allCities = citiesData;
            populateCommunities();
            setupFuzzySearch(); // Setup Fuse.js for fuzzy search
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }

    function populateCommunities() {
        const communitySelect = document.getElementById('community');
        for (const community in data) {
            const option = document.createElement('option');
            option.value = community;
            option.textContent = community;
            communitySelect.appendChild(option);
        }
    }

    function updateProvinces() {
        const communitySelect = document.getElementById('community');
        const provinceSelect = document.getElementById('province');
        const community = communitySelect.value;
        const provinces = data[community] || {};

        provinceSelect.innerHTML = '<option value="">Provincia</option>';
        for (const province in provinces) {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            provinceSelect.appendChild(option);
        }

        clearCity();
    }

    function clearCity() {
        document.getElementById('city').value = '';
        document.getElementById('suggestions').innerHTML = '';
        validateForm();
    }


// Setup Fuse.js for fuzzy search
let fuse;
function setupFuzzySearch() {
    const options = {
        threshold: 0.2, // Lower threshold for more precise matches
        distance: 100,  // Prioritize matches closer to the start of the string
        minMatchCharLength: 3, // Only consider matches with at least 3 characters
        keys: ['name'] // Key for the Fuse search, assuming cities.json contains city names
    };
    fuse = new Fuse(allCities.map(city => ({ name: city })), options);
}

// Form validation function
function validateForm() {
    const community = document.getElementById('community').value;
    const province = document.getElementById('province').value;
    const city = document.getElementById('city').value.trim();
    const button = document.getElementById('searchButton');
    const errorMessage = document.getElementById('error-message');

    let missingFields = [];
    if (!community) missingFields.push('Comunidad');
    if (!province) missingFields.push('Provincia');
    if (!city) missingFields.push('Ciudad/Pueblo');

    if (missingFields.length) {
        button.disabled = true;
        errorMessage.textContent = `Selecciona: ${missingFields.join(', ')}.`;
        return;
    }

    const isValid = allCities.includes(city);
    button.disabled = !isValid;

    if (!isValid) {
        errorMessage.textContent = `Ciudad "${city}" no encontrada.`;
        displaySuggestions(city);
    } else {
        errorMessage.textContent = '';
        document.getElementById('suggestions').innerHTML = '';
    }
}

// Display city suggestions with improved fuzzy matching
function displaySuggestions(input) {
    const suggestionsBox = document.getElementById('suggestions');
    
    if (input.length < 3) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none'; // Hide suggestions box when input is short
        return;
    }

    const fuzzyResults = fuse.search(input);
    const suggestions = fuzzyResults.map(result => result.item.name);

    if (suggestions.length > 0) {
        const suggestionHTML = suggestions
            .map(city => `<div class="suggestion-item" onclick="selectSuggestion('${city}')">${city}</div>`)
            .join('');
        suggestionsBox.innerHTML = suggestionHTML;
        suggestionsBox.style.display = 'block'; // Show suggestions box when there are results
    } else {
        suggestionsBox.innerHTML = '<div>No suggestions found</div>';
        suggestionsBox.style.display = 'block'; // Show suggestions box even if no matches
    }
}

// Handle city selection from suggestions
function selectSuggestion(city) {
    document.getElementById('city').value = city;
    document.getElementById('suggestions').innerHTML = '';
    validateForm();
}

// Handle search button click
function searchComments() {
    const city = document.getElementById('city').value.trim();
    if (city && allCities.includes(city)) {
        alert(`Buscando comentarios y entradas de usuario para ${city}`);
    } else {
        alert('Por favor, selecciona una ciudad/pueblo válida.');
    }
}

// Fetch data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', fetchData);
