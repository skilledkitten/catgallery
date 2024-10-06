document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementsByClassName('gallery')[0];
    const inputField = document.querySelector('.sidebar-input');
    const sendButton = document.querySelector('.send-button');
    const loadingIcon = document.querySelector('.loading-icon');
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalPrompt = document.getElementById('modalPrompt');
    const closeButton = document.querySelector('.close-button');
    const escapeButton = document.querySelector('.esc-text');
    const modalDescription = document.getElementById('modalDescription'); // Assuming this is the ID for the description element

    async function fetchImages() {
        const response = await fetch('/images');
        const images = await response.json();

        gallery.innerHTML = ''; // Clear existing images
        images.forEach(image => {
            if (!image.url) return; // Skip if URL is not available

            const artworkDiv = document.createElement('div');
            artworkDiv.className = 'artwork';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'artwork-title';
            titleSpan.textContent = image.prompt;

            const imgElement = document.createElement('img');
            imgElement.src = image.url;
            imgElement.alt = image.prompt;

            // Add click event to open modal
            imgElement.addEventListener('click', () => {
                modal.style.display = 'block'; // Show modal
                modalImage.src = image.url; // Set modal image
                modalPrompt.textContent = image.prompt; // Set prompt
                modalDescription.textContent = image.pixtral_desc; // Set Pixtral description
                document.getElementById('modalScore').textContent = `${image.score}/100`; // Set score text
                document.body.classList.add('modal-open'); // Add class to body
            });

            artworkDiv.appendChild(titleSpan);
            artworkDiv.appendChild(imgElement);

            gallery.appendChild(artworkDiv);
        });
    };

    const sendRequest = async () => {
        const prompt = inputField.value;
        if (prompt.trim() === '') return;
        document.getElementsByClassName('send-button')[0].style.display = 'none';
        document.getElementsByClassName('loading-icon')[0].style.display = 'block';
        sendButton.classList.add('loading'); // Start spinning animation

        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });

        if (response.ok) {
            inputField.value = ''; // Clear input field
            await fetchImages(); // Update gallery
        }

        sendButton.classList.remove('loading'); // Stop spinning animation
        document.getElementsByClassName('loading-icon')[0].style.display = 'none';
    };

    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            sendRequest();
        }
    });

    sendButton.addEventListener('click', sendRequest);

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Close modal
        document.body.classList.remove('modal-open'); // Remove class from body
    });

    escapeButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Close modal
        document.body.classList.remove('modal-open'); // Remove class from body
    });

    // Close the modal if the user presses the Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none'; // Close modal
            document.body.classList.remove('modal-open'); // Remove class from body
        }
    });

    await fetchImages(); // Initial fetch of images

    async function fetchScore() {
        const prompt = modalPrompt.textContent; // Get the prompt from the modal
        const description = modalDescription.textContent; // Get the description from the modal

        const response = await fetch('/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Prompt: ${prompt}\nDescription: ${description}` // Format the message
            }),
        });

        if (response.ok) {
            const data = await response.json();
            displayScore(data.score); // Assuming the score is returned in the 'score' field
        } else {
            console.error('Error fetching score:', response.statusText);
        }
    }

    function displayScore(score) {
        const pieChart = document.getElementById('pie-chart');
        pieChart.innerHTML = `<div class="score">${score}</div>`; // Display the score

        // Create a pie chart representation
        const pieChartStyle = `
            background: conic-gradient(
                black ${score * 3.6}deg,
                white ${score * 3.6}deg 360deg
            );
        `;
        pieChart.setAttribute('style', pieChartStyle);
    }

    // Call fetchScore when needed, e.g., after the modal is opened
    fetchScore();

    // Function to fetch suggestions from Brave API
    async function fetchSuggestions(query) {
        const apiKey = 'BSAXYZFwgCtVk6qB8WOZ5TiO3tDlNCM'; // Replace with your actual API key
        const response = await fetch(`https://api.search.brave.com/res/v1/suggest/search?q=${query}&country=US&count=1`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': apiKey // Use the API key directly
            }
        });
        const data = await response.json();
        return data.suggestions; // Return all suggestions
    }

    // Event listener for input field
    inputField.addEventListener('input', async (event) => {
        const query = event.target.value;
        if (query) {
            const suggestions = await fetchSuggestions(query);
            const suggestionsContainer = document.getElementById('suggestions');
            suggestionsContainer.innerHTML = ''; // Clear previous suggestions
            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.textContent = suggestion; // Set the suggestion text
                suggestionItem.addEventListener('click', () => {
                    inputField.value = suggestion; // Set the input field value to the suggestion
                    suggestionsContainer.style.display = 'none'; // Hide suggestions
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
            suggestionsContainer.style.display = suggestions.length ? 'block' : 'none'; // Show or hide suggestions
        } else {
            document.getElementById('suggestions').style.display = 'none'; // Hide if input is empty
        }
    });
});