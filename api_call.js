async function get_motivation_quote() {

    let quote_details = undefined;
    const category_list = ["amazing", "art", "attitude", "bueaty", "best", "business", "change", "communication", "computers", "cool", "courage", "design", "dream", "education", "environmental", "equality", "experience", "failure", "faith", "family", "famous", "fear", "fitness", "food", "forgiveness", "freedom", "friendship", "funny", "future", "god", "good", "government", "graduation", "great", "happiness", "health", "history", "home", "hope", "humor", "imagination", "inspirational", "intelligence", "knowledge", "leadership", "learning", "legal", "life", "love", "marriage", "medical", "men", "mom", "money", "morning", "movies", "success"];

    const category = category_list[Math.floor(Math.random() * category_list.length)]

    const options = {
        method: 'GET',
        headers: {
            'X-Api-Key': 'g/Ob0D2BNbFU1BrGdV3Khw==zLDUTnwz8Gab065Q',
        },
        contentType: 'application/json',
    };

    await fetch('https://api.api-ninjas.com/v1/quotes?category=' + category, options)
        .then(response => response.json())
        .then(response => {
            quote_details = response[0];
        })
        .catch(err => console.error(err));
    return quote_details
}

async function get_location_weather_form_api(city) {
    let weather_details = undefined;

    const options = {
        method: 'GET',
        headers: {
            'Key': '7bb4e61a74b248e8ba6121521232804',
        },
        contentType: 'application/json',
    };

    await fetch('http://api.weatherapi.com/v1/current.json?q=' + city, options)
        .then(response => response.json())
        .then(response => {
            weather_details = response;
        })
        .catch(err => console.error(err));

    return weather_details;
}

async function fetch_location_list(query) {
    let location_data = undefined
    const options = {
        method: 'GET',
        headers: {
            'Key': '7bb4e61a74b248e8ba6121521232804',
        },
        contentType: 'application/json',
    };

    await fetch('http://api.weatherapi.com/v1/search.json?q=' + query, options)
        .then(response => response.json())
        .then(response => {
            location_data = response
        })
        .catch(err => console.error(err));
    return location_data
}

async function fetch_web_url_data(url) {
    const options = {
        method: 'GET',
        contentType: 'application/json',
    };
    const response = await fetch(url, options);
    const html_content = await response.text()
    return html_content
}

async function check_network_connection_status() {
    let network_connection_status = false
    await fetch('https://google.com').then(response => {
        network_connection_status = true
    })
    return network_connection_status
}

async function fetch_search_suggestions(query) {
    let suggestions_data = []
    await fetch('https://suggestqueries.google.com/complete/search?client=chrome&format=os&hl=en&gl=ind&q=' + query)
        .then(response => response.text())
        .then(data => {
            // the response is in 'text/javascript; charset=ISO-8859-1' format so we need to convert it to json
            // Decode the text using ISO-8859-1 charset
            const decoder = new TextDecoder('ISO-8859-1');
            const decodedText = decoder.decode(new TextEncoder().encode(data));
            // Parse the decoded text as JSON
            const jsonResponse = JSON.parse(decodedText);
            let suggestions = jsonResponse[1];
            let suggestion_types = jsonResponse[4]["google:suggesttype"]

            for (let i = 0; i < suggestions.length; i++) {
                suggestions_data.push({
                    "suggestion": suggestions[i],
                    "suggestion_type": suggestion_types[i]
                })
            }

        })
        .catch(err => console.error(err));
    return suggestions_data
}

export { get_motivation_quote, get_location_weather_form_api, fetch_location_list, fetch_web_url_data, check_network_connection_status, fetch_search_suggestions }
