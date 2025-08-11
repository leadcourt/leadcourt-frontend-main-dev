import axios from "axios";


const baseUrl = import.meta.env.VITE_BE_URL


// Hubspot API Routes
const checkHubspotConnection = async () => {
    return await axios.get(`${baseUrl}/integrations/hubspot/check`, )
}
const postHubspotCRMCode = async (payload: any) => {
    return await axios.post(`${baseUrl}/integrations/hubspot/exchange-code`, payload)
}
const disconnetHubspotCRMCode = async () => {
    return await axios.delete(`${baseUrl}/integrations/hubspot/remove`)
}
const exportToHubspotApi = async (payload: any) => {
    return await axios.post(`${baseUrl}/integrations/hubspot/export`, payload)
}
const connectionHubspotCRM = 'https://app-na2.hubspot.com/oauth/authorize?client_id=eb0927e7-a1c9-461b-9be4-73eaa4848a4c&redirect_uri=https://app.leadcourt.com/integrations/hubspot/callback&scope=crm.objects.contacts.write%20crm.schemas.contacts.write%20crm.import%20oauth%20files%20crm.schemas.contacts.read%20crm.objects.contacts.read'

// /api/integrations/zoho

// Zoho API Routes

const checkZohoConnection = async () => {
    return await axios.get(`${baseUrl}/integrations/zoho/check`, )
}

const connectionZohoCRM = 'https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.users.ALL&client_id={client_id}&response_type=code&access_type={"offline"or"online"}&redirect_uri={redirect_uri}'


export {
    checkHubspotConnection,
    postHubspotCRMCode,
    disconnetHubspotCRMCode,
    exportToHubspotApi,
    
    connectionHubspotCRM,
    
    checkZohoConnection,
    connectionZohoCRM,
}