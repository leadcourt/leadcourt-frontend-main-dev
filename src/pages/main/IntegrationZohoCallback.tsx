import { useState, useEffect } from "react";
import {
  connectionZohoCRM,
  disconnetZohoCRMCode,
  // disconnetHubspotCRMCode,
  // postHubspotCRMCode,
  postZohoCRMCode,
} from "../../utils/api/crmIntegrations";
import { Link, useLocation, useNavigate } from "react-router-dom";
import hubspotLogo from "../../assets/integrations/hubspot/HubSpot.png";
import { toast } from "react-toastify";
// import { toast } from "react-toastify";

const IntegrationZohoCallback = () => {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setloading] = useState(false)

  const navigate = useNavigate();

  const urlParams = new URLSearchParams(location.search);
  const qy = urlParams.get("code");

  const state = useLocation();
  const navigationState = state?.state;

  const processCallback = async () => {
    try {
      // Get the authorization code from URL search params
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      // const state = urlParams.get('state');
      const error = urlParams.get("error");

      // Check for OAuth errors
      if (error) {
        setStatus("error");
        setErrorMessage(`Authorization failed: ${error}`);
        return;
      }

      // Check if code exists
      if (navigationState != null) {
        setStatus(navigationState.status);

        return;
      } else if (!code) {
        setStatus("error");
        setErrorMessage("No authorization code received");
        handleReturnToIntegrations();
        return;
      }

      console.log('theres codee', urlParams);
      
      // Send code to backend
      await postZohoCRMCode({ code: qy })
        .then((response) => {
          console.log("zoho code response:", response.data);

          if (response.status === 200) {
            // console.log('Integration successful:', response.data);
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMessage("Failed to complete integration");
          }
          // toast.success('Zoho code sent successfully!');
        })
        .catch(() => {
            setStatus("error");
        });
    } catch (error) {
      console.error("Callback processing error:", error);
      setStatus("error");
      setErrorMessage("An unexpected error occurred");
    }
  };

  useEffect(() => {
    console.log("navigationState", navigationState);

    processCallback();
  }, []);

  const handleReturnToIntegrations = () => {
    navigate("/integrations");
  };

  const disconnectZoho = async () => {
  setloading(true)
    await disconnetZohoCRMCode().then((res) => {
      if (res.data.message.endsWith("Zoho connection removed")) {
        toast.info("Zoho disconnected!");
        navigate("/integrations");
      }
    });
  setloading(false)

  };

  const handleTryAgain = () => {
    window.location.href = "/integrations";
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connecting to Zoho
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we complete your integration...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full relative">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Zoho Integration</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Integration Successful!
            </h2>

            <p className="text-gray-600 mb-6">
              Your Zoho account has been successfully connected. You can now successfully export data directly to your Zoho CRM.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 p-1 bg-orange-500 rounded-lg flex items-center justify-center">
                  <img
                    src={hubspotLogo}
                    className="w-full h-full bg-white rounded p-1"
                    alt=""
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Zoho
                  </div>
                  <div className="text-xs text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReturnToIntegrations}
                className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Return to Integrations
              </button>

              <button
                onClick={disconnectZoho}
                className="max-w-[400px] m-auto flex items-center gap-3 px-6 py-2 button_hover text-white font-medium rounded-lg transition-colors duration-150 "
              >
              {loading ? <i className="pi pi-spinner pi-spin"></i> :''}
                Disconnect
              </button>

              <p className="text-xs text-gray-500">
                Your integration is now active and ready to use.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Integration Failed
            </h2>

            <p className="text-gray-600 mb-4">
              We couldn't complete your Zoho integration.
            </p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <Link target="_blank" to={connectionZohoCRM}>
                <div
                  onClick={handleTryAgain}
                  className=" cursor-pointer w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  Try Again
                </div>
              </Link>

              <button
                onClick={handleReturnToIntegrations}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Return to Integrations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IntegrationZohoCallback;


/*
https://leadcourt-frontend-main-dev.vercel.app/integrations/zoho/callback
?code=1000.da728a0bbf09863e4be3136d54c49f88.4a8362be5603923a3823fb02f38d7276
&location=us
&accounts-server=https%3A%2F%2Faccounts.zoho.com&

*/