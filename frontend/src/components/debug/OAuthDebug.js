import React, { useState, useEffect } from 'react';

const OAuthDebug = () => {
  const [oauthStatus, setOauthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/oauth-status');
        const data = await response.json();
        setOauthStatus(data.oauth_status);
      } catch (error) {
        console.error('Error checking OAuth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOAuthStatus();
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800">Checking OAuth configuration...</p>
      </div>
    );
  }

  if (!oauthStatus) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p className="text-red-800">Unable to check OAuth configuration</p>
      </div>
    );
  }

  const isConfigured = oauthStatus.google.configured || oauthStatus.facebook.configured;

  return (
    <div className={`border rounded-lg p-4 mb-4 ${
      isConfigured 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <h3 className={`font-semibold mb-2 ${
        isConfigured ? 'text-green-800' : 'text-red-800'
      }`}>
        OAuth Configuration Status
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Google OAuth:</span>
          <span className={`font-medium ${
            oauthStatus.google.configured ? 'text-green-600' : 'text-red-600'
          }`}>
            {oauthStatus.google.configured ? '✅ Configured' : '❌ Not Configured'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Facebook OAuth:</span>
          <span className={`font-medium ${
            oauthStatus.facebook.configured ? 'text-green-600' : 'text-red-600'
          }`}>
            {oauthStatus.facebook.configured ? '✅ Configured' : '❌ Not Configured'}
          </span>
        </div>
      </div>
      
      <p className={`mt-3 text-sm ${
        isConfigured ? 'text-green-700' : 'text-red-700'
      }`}>
        {oauthStatus.message}
      </p>
      
      {!isConfigured && (
        <div className="mt-3 text-xs text-red-600">
          <p><strong>To fix this:</strong></p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Check the OAUTH_SETUP.md file in the project root</li>
            <li>Create OAuth apps with Google and Facebook</li>
            <li>Update the .env file with real credentials</li>
            <li>Restart the backend server</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default OAuthDebug;
