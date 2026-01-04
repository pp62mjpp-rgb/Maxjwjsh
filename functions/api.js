const cookie = require('cookie');

exports.handler = async (event, context) => {
    // 1. Password aur Default Link
    const MY_SECRET_PASSWORD = "Mx92gh44kL88pq2x"; 
    const DEFAULT_RESPONSE_URL = "https://earnlinks.in/MGENo";
    
    const path = event.path;
    const queryParams = event.queryStringParameters || {};
    const cookies = cookie.parse(event.headers.cookie || '');

    // --- API SECTION (/api) ---
    if (path.includes('/api')) {
        let finalRedirectUrl = DEFAULT_RESPONSE_URL;

        // Agar password sahi hai, tabhi link process karo, warna default pe rehne do
        // Lekin response hamesha "success" hi jayega taaki aapka system na ruke
        if (queryParams.api === MY_SECRET_PASSWORD) {
            let baseTarget = queryParams.url || "";
            let alias = queryParams.alias || "";

            if (baseTarget) {
                if (alias && alias.trim() !== "") {
                    const separator = baseTarget.endsWith('/') ? '' : '/';
                    finalRedirectUrl = `${baseTarget}${separator}${alias}`;
                } else {
                    finalRedirectUrl = baseTarget;
                }
            }
        }

        // Cookie hamesha set hogi, chahe password sahi ho ya galat (Fail-safe)
        const setCookie = cookie.serialize('user_dest', finalRedirectUrl, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 60 * 60 * 24, 
            path: '/'
        });

        // Hamesha SUCCESS response jayega, Error kabhi nahi dikhayega
        return {
            statusCode: 200,
            headers: { 
                'Set-Cookie': setCookie,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                "status": "success",
                "shortenedUrl": DEFAULT_RESPONSE_URL
            })
        };
    }

    // --- REDIRECT SECTION (/go) ---
    if (path.includes('/go')) {
        const target = cookies.user_dest || DEFAULT_RESPONSE_URL;
        return {
            statusCode: 302,
            headers: { 'Location': target, 'Cache-Control': 'no-cache' },
            body: null
        };
    }

    return { statusCode: 200, body: "System Active" };
};
