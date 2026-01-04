const cookie = require('cookie');

exports.handler = async (event, context) => {
    // 1. TERA NAYA PASSWORD
    const MY_SECRET_PASSWORD = "36hgfc66gg66"; 
    const DEFAULT_RESPONSE_URL = "https://earnlinks.in/MGENo";
    
    const path = event.path;
    const queryParams = event.queryStringParameters;
    const cookies = cookie.parse(event.headers.cookie || '');

    // --- API LOGIC (/api) ---
    if (path.includes('/api')) {
        // Password Check
        if (queryParams.api !== MY_SECRET_PASSWORD) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ status: "error", message: "Invalid API Password" })
            };
        }

        let baseTarget = queryParams.url || "";
        let alias = queryParams.alias || "";
        
        // --- SMART LINK BUILDING LOGIC ---
        let finalRedirectUrl = baseTarget;
        
        if (alias && alias.trim() !== "") {
            // Agar alias hai, toh use URL ke peeche jod do (e.g., site.com/max)
            // Pehle check karo ki URL ke peeche / hai ya nahi
            if (baseTarget.endsWith('/')) {
                finalRedirectUrl = baseTarget + alias;
            } else {
                finalRedirectUrl = baseTarget + "/" + alias;
            }
        }

        const setCookie = cookie.serialize('user_dest', finalRedirectUrl, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 24, 
            path: '/'
        });

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
        const target = cookies.user_dest || DEFAULT_RESPONSE_URL;
        return {
            statusCode: 302,
            headers: { 'Location': target },
            body: null
        };
    }

    return { statusCode: 404, body: "Not Found" };
};
