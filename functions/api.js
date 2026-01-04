const cookie = require('cookie');

exports.handler = async (event, context) => {
    // Tumhara default response URL
    const DEFAULT_RESPONSE_URL = "https://earnlinks.in/MGENo";
    const path = event.path;
    const query = event.queryStringParameters;
    
    // Browser ki cookies padhna
    const cookies = cookie.parse(event.headers.cookie || '');

    // --- API LOGIC ---
    if (path.includes('/api')) {
        // User ne request mein jo URL bheja use pakadna
        const receivedUrl = query.url;
        
        // Browser session cookie set karna (24 hours ke liye)
        const setCookie = cookie.serialize('user_dest', receivedUrl || '', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 24, 
            path: '/'
        });

        // Hamesha wahi purana default response dena
        return {
            statusCode: 200,
            headers: { 
                'Set-Cookie': setCookie,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' 
            },
            body: JSON.stringify({
                "status": "success",
                "message": "",
                "shortenedUrl": DEFAULT_RESPONSE_URL
            })
        };
    }

    // --- REDIRECT LOGIC (/go) ---
    if (path.includes('/go')) {
        // Cookie se wahi URL nikalna jo request ke time receive hua tha
        const target = cookies.user_dest || DEFAULT_RESPONSE_URL;
        
        return {
            statusCode: 302,
            headers: { 'Location': target },
            body: null
        };
    }

    return { statusCode: 404, body: "Not Found" };
};
  
