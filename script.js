let data = {};
let allCities = [];
let fuse;

function fetchData() {
    console.log('Fetching data...');
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
    console.log('Populating communities...');
    const communitySelect = document.getElementById('community');
    for (const community in data) {
        const option = document.createElement('option');
        option.value = community;
        option.textContent = community;
        communitySelect.appendChild(option);
    }
}

function updateProvinces() {
    console.log('Updating provinces...');
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
    console.log('Clearing city...');
    document.getElementById('city').value = '';
    document.getElementById('suggestions').innerHTML = '';
    validateForm();
}

function setupFuzzySearch() {
    console.log('Setting up fuzzy search...');
    const options = {
        threshold: 0.2,
        distance: 100,
        minMatchCharLength: 3,
        keys: ['name']
    };
    fuse = new Fuse(allCities.map(city => ({ name: city })), options);
}

function validateForm() {
    console.log('Validating form...');
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

function displaySuggestions(input) {
    console.log('Displaying suggestions...');
    const suggestionsBox = document.getElementById('suggestions');
    
    if (input.length < 3) {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
        return;
    }

    const fuzzyResults = fuse.search(input);
    const suggestions = fuzzyResults.map(result => result.item.name);

    if (suggestions.length > 0) {
        const suggestionHTML = suggestions
            .map(city => `<div class="suggestion-item" onclick="selectSuggestion('${city}')">${city}</div>`)
            .join('');
        suggestionsBox.innerHTML = suggestionHTML;
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.innerHTML = '<div>No suggestions found</div>';
        suggestionsBox.style.display = 'block';
    }
}

function selectSuggestion(city) {
    console.log('Selecting suggestion:', city);
    document.getElementById('city').value = city;
    document.getElementById('suggestions').innerHTML = '';
    validateForm();
}

function searchComments() {
    console.log('Searching comments...');
    const city = document.getElementById('city').value.trim();
    if (city && allCities.includes(city)) {
        alert(`Buscando comentarios y entradas de usuario para ${city}`);
    } else {
        alert('Por favor, selecciona una ciudad/pueblo válida.');
    }
}

function updateSelection(selectElement) {
    const dropdownContent = selectElement.parentElement.querySelector('.dropdown-content');
    dropdownContent.style.display = 'block';
    setTimeout(() => {
        dropdownContent.style.opacity = '1';
    }, 100);
}


document.addEventListener('DOMContentLoaded', fetchData);
