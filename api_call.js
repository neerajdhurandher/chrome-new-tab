
export default async function get_motivation_quote() {

    let quote_details = undefined;
    const category_list = ["amazing", "art", "attitude", "bueaty", "best", "business", "chnage", "communication", "computers", "ccol", "courage", "design", "dream", "education", "environmental", "equality", "experience", "failure", "faith", "family", "famous", "fear", "fitness", "food", "forgiveness", "freedom", "friendship", "funny", "future", "god", "good", "government", "graduation", "great", "happiness", "health", "history", "home", "hope", "humor", "imagination", "inspirational", "intelligence", "knowledge", "leadership", "learning", "legal", "life", "love", "marriage", "medical", "men", "mom", "money", "morning", "movies", "success"];

    const category = category_list[Math.floor(Math.random() * category_list.length)]
    console.log("Quote category : " + category);

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
            console.log(response[0])
            console.log("response from api : \n \t Quote : " + response[0]["quote"] + " \n \t author : " + response[0]["author"]);
            quote_details = response[0];
            console.log("go for store...")
            // store_last_quote_deails(response[0])
        })
        .catch(err => console.error(err));
    
    
    console.log("return api response.....")
    return quote_details
}