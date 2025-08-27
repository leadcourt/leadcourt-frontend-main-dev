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

const connectionHubspotCRM = import.meta.env.VITE_HUBSPOT_URL



// Zoho API Routes

const checkZohoConnection = async () => {
    return await axios.get(`${baseUrl}/integrations/zoho/check`, )
}

const postZohoCRMCode = async (payload: any) => {
    return await axios.post(`${baseUrl}/integrations/zoho/callback`, payload)
}

const exportToZohoApi = async (payload: any) => {
    return await axios.post(`${baseUrl}/integrations/zoho/export`, payload)
}

const disconnetZohoCRMCode = async () => {
    return await axios.delete(`${baseUrl}/integrations/zoho/delete`)
}

const connectionZohoCRM = import.meta.env.VITE_ZOHO_URL

const checkAllIntegration = async () => {
    return await axios.get(`${baseUrl}/integrations/checkAll`, )
}

export {
    checkHubspotConnection,
    postHubspotCRMCode,
    disconnetHubspotCRMCode,
    exportToHubspotApi,
    connectionHubspotCRM,
    
    
    checkZohoConnection,
    postZohoCRMCode,
    disconnetZohoCRMCode,
    exportToZohoApi,
    connectionZohoCRM,
    
    checkAllIntegration
}