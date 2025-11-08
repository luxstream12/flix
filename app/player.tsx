import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useContent } from '../contexts/ContentContext';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { colors, spacing, typography } from '../constants/theme';

// Convert Google Drive link to embeddable URL
const getEmbedUrl = (url: string): string => {
  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  // If already an embed URL or other format, return as is
  if (url.includes('/preview')) {
    return url;
  }

  // For other platforms (YouTube, Vimeo, etc.)
  return url;
};

export default function PlayerScreen() {
  const { id, url: paramUrl } = useLocalSearchParams<{ id: string; url?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getContentById } = useContent();
  const { updateProgress } = useContinueWatching();
  
  const [loading, setLoading] = useState(true);

  const content = getContentById(id);
  const videoUrl = paramUrl || content?.videoUrl;

  useEffect(() => {
    // Track that user started watching
    if (content) {
      updateProgress(id, 0.1, content.duration || 0);
    }
  }, [id]);

  if (!content || !videoUrl) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, styles.centerContent]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.errorText}>Vídeo não disponível</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  const embedUrl = getEmbedUrl(videoUrl);

  const handleBack = () => {
    router.back();
  };

  // Inject JavaScript to handle fullscreen on web
  const injectedJavaScript = `
    (function() {
      var video = document.querySelector('video');
      if (video) {
        video.addEventListener('fullscreenchange', function() {
          if (!document.fullscreenElement) {
            window.ReactNativeWebView.postMessage('exitFullscreen');
          }
        });
      }
    })();
    true;
  `;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={handleBack}
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.videoContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Carregando vídeo...</Text>
            </View>
          )}
          
          <WebView
            source={{ uri: embedUrl }}
            style={styles.webview}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccessFromFileURLs={true}
            allowUniversalAccessFromFileURLs={true}
            injectedJavaScript={injectedJavaScript}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              alert('Erro ao carregar o vídeo');
            }}
            onMessage={(event) => {
              if (event.nativeEvent.data === 'exitFullscreen') {
                console.log('Exited fullscreen');
              }
            }}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {content.title}
          </Text>
          {content.description && (
            <Text style={styles.description} numberOfLines={2}>
              {content.description}
            </Text>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.base,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 5,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  info: {
    padding: spacing.base,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.base,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
