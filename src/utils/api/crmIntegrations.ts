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

const postZohoCRMCode = async (payload: any) => {
    // return await axios.post(`${baseUrl}/integrations/zoho/exchange-code`, payload)
    return await axios.post(`${baseUrl}/integrations/zoho/callback`, payload)
}

const exportToZohoApi = async (payload: any) => {
    return await axios.post(`${baseUrl}/integrations/zoho/export`, payload)
}

const disconnetZohoCRMCode = async () => {
    return await axios.delete(`${baseUrl}/integrations/zoho/delete`)
}

const connectionZohoCRM = import.meta.env.VITE_ZOHO_URL
// ZohoCRM.users.ALL
// `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCRM.modules.ALL&client_id=${import.meta.env.VITE_ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${import.meta.env.VITE_FRONTEND_BASE}`



// /api/integrations/checkAll
const checkAllIntegration = async () => {
    return await axios.get(`${baseUrl}/integrations/checkAll`, )
}

export {
    checkHubspotConnection,
    postHubspotCRMCode,
    disconnetHubspotCRMCode,
    exportToHubspotApi,
    
    
    checkZohoConnection,
    postZohoCRMCode,
    disconnetZohoCRMCode,

    exportToZohoApi,
    
    connectionHubspotCRM,
    connectionZohoCRM,

    checkAllIntegration
}