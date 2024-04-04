import * as jose from 'jose'

async function onGoogleLoginInt(response) {

    
    const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

    const { payload, protectedHeader } = await jose.jwtVerify(response.credential, JWKS, {
      issuer: 'urn:example:issuer',
      audience: 'urn:example:audience',
    })
    console.log(protectedHeader)
    console.log(payload)    

    // const responsePayload = decodeJwtResponse(response.credential);

    // console.log("ID: " + responsePayload.sub);
    // console.log('Full Name: ' + responsePayload.name);
    // console.log('Given Name: ' + responsePayload.given_name);
    // console.log('Family Name: ' + responsePayload.family_name);
    // console.log("Image URL: " + responsePayload.picture);
    // console.log("Email: " + responsePayload.email);
    
}