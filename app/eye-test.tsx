import { useCameraPermissions } from 'expo-camera';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const mobileHtmlFile = require('../assets/eye_test.html');

export default function EyeTestScreen() {
  // --- WEB CONFIGURATION (Laptop) ---
  if (Platform.OS === 'web') {
    // We cast this to 'any' to stop TypeScript from complaining about the iframe
    const WebFrame = 'iframe' as any;
    
    return (
      <View style={styles.container}>
        <WebFrame
          src="/eye_test.html"
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="camera; microphone"
          title="Eye Test"
        />
      </View>
    );
  }

  // --- MOBILE CONFIGURATION (Android/iOS) ---
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  if (!permission) return <View style={styles.loading}><ActivityIndicator /></View>;
  if (!permission.granted) return <View style={styles.loading}><Text style={styles.text}>Camera permission needed.</Text></View>;

  return (
    <View style={styles.container}>
      <WebView
        source={mobileHtmlFile}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // FIXED: Added ': any' to prevent the red line here
        onPermissionRequest={(event: any) => {
          event.grant();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
  }
});