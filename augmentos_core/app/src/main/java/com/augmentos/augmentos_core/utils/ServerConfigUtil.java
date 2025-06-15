package com.augmentos.augmentos_core.utils;

import com.augmentos.augmentos_core.BuildConfig;
import android.content.Context;
import android.content.SharedPreferences;
import androidx.preference.PreferenceManager;
import android.util.Log;

/**
 * Utility class for server configuration and URL management.
 * Centralizes server URL construction to ensure consistency across components.
 */
public class ServerConfigUtil {

    /**
     * Gets the base URL for the AugmentOS server.
     * Uses BuildConfig properties to dynamically construct the URL.
     * 
     * @return The complete server base URL
     * @throws IllegalStateException if required configuration is missing
     */
    public static String getServerBaseUrl(Context context) {
        // Try to get override from SharedPreferences
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        String overrideUrl = prefs.getString("augmentos_server_url_override", null);
        if (overrideUrl != null && !overrideUrl.isEmpty()) {
            Log.d("ServerConfigUtil", "Using override URL: " + overrideUrl);
            return overrideUrl;
        }
        String host = BuildConfig.AUGMENTOS_HOST;
        String port = BuildConfig.AUGMENTOS_PORT;
        boolean secureServer = Boolean.parseBoolean(BuildConfig.AUGMENTOS_SECURE);
        
        if (host == null || port == null) {
            throw new IllegalStateException("AugmentOS Server Config Not Found");
        }
        
        return String.format("%s://%s:%s", secureServer ? "https" : "http", host, port);
    }
    
    /**
     * Gets the full URL for a specific API endpoint.
     * Combines the base URL with the provided endpoint path.
     * 
     * @param endpointPath The API endpoint path (e.g., "/api/photos/upload")
     * @return The complete URL to the specified endpoint
     */
    public static String getApiUrl(Context context, String endpointPath) {
        String baseUrl = getServerBaseUrl(context);
        // Ensure path starts with a slash
        if (!endpointPath.startsWith("/")) {
            endpointPath = "/" + endpointPath;
        }
        return baseUrl + endpointPath;
    }
    
    /**
     * Gets the hardware button press endpoint URL.
     * 
     * @return Complete URL for the button press endpoint
     */
    public static String getButtonPressUrl(Context context) {
        return getApiUrl(context, "/api/hardware/button-press");
    }
    
    /**
     * Gets the photo upload endpoint URL.
     * 
     * @return Complete URL for the photo upload endpoint
     */
    public static String getPhotoUploadUrl(Context context) {
        return getApiUrl(context, "/api/photos/upload");
    }

    public static String getVideoUploadUrl(Context context) {
        return getApiUrl(context, "/api/videos/upload");
    }
}