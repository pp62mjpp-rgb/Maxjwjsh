const cookie = require('cookie');

exports.handler = async (event, context) => {
    // 1. AAPKA PASSWORD
    const MY_SECRET_PASSWORD = "36hgfc66gg66"; 
    const DEFAULT_RESPONSE_URL = "https://earnlinks.in/MGENo";
    
    const path = event.path;
    // URL se data nikalne ke liye
    const queryParams = event.queryStringParameters || {};
    // Cookies check karne ke liye
    const cookies = cookie.parse(event.headers.cookie || '');

    // --- API SECTION (/api) ---
    if (path.includes('/api')) {
        // Password Check (Security)
        if (queryParams.api !== MY_SECRET_PASSWORD) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ status: "error", message: "Invalid API Password" })
            };
        }

        const baseTarget = queryParams.url || "";
        const alias = queryParams.alias || "";
        
        // --- REAL LOGIC: URL + ALIAS ---
        let finalRedirectUrl = baseTarget;
        if (alias && alias.trim() !== "") {
            // Agar URL ke aakhri mein '/' nahi hai toh laga do, phir alias jodo
            const separator = baseTarget.endsWith('/') ? '' : '/';
            finalRedirectUrl = `${baseTarget}${separator}${alias}`;
        }

        // Cookie set karna (24 hours ke liye link yaad rakhega)
        const setCookie = cookie.serialize('user_dest', finalRedirectUrl, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 24, 
            path: '/'
        });

        // Response waisa hi jaisa ek standard API deti hai
        return {
            statusCode: 200,
            headers: { 
                'Set-Cookie': setCookie,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({
                "status": "success",
                "message": "Link updated successfully",
                "shortenedUrl": DEFAULT_RESPONSE_URL
            })
        };
    }

    // --- REDIRECT SECTION (/go) ---
    if (path.includes('/go')) {
        const target = cookies.user_dest || DEFAULT_RESPONSE_URL;
        
        return {
            statusCode: 302,
            headers: { 
                'Location': target,
                'Cache-Control': 'no-cache'
            },
            body: null
        };
    }

    return { statusCode: 404, body: "API Endpoint Not Found" };
};
