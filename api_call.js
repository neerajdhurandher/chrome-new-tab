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

async function check_network_connection_status(){
    let network_connection_status = false
    await fetch('https://google.com').then(response => {
        network_connection_status = true
    })
    return network_connection_status
}

export { get_motivation_quote, get_location_weather_form_api, fetch_location_list, fetch_web_url_data, check_network_connection_status }
