<script setup lang="ts">
import { ref } from 'vue';

import useFirebaseAuth from 'composables/useFirebaseAuth.js';
import usePageTitle from 'composables/usePageTitle.js';

// Composables

const { signInWithGoogle } = useFirebaseAuth();
const { appName } = usePageTitle();

// Data

const loading = ref<boolean>(false);

// Methods

async function handleGoogleLogin() {
  loading.value = true;
  try {
    await signInWithGoogle();
  } catch {
    // Error is logged in the composable
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <q-page class="row items-center justify-center">
    <div class="login-card-container">
      <q-card bordered class="login-card shadow-10">
        <q-card-section class="header-section text-center text-white">
          <div class="text-h4 text-weight-bold q-mb-xs">{{ appName }}</div>
          <div class="text-subtitle2 opacity-80">Authentication</div>
        </q-card-section>

        <q-card-section class="q-pa-xl content-section">
          <div class="column items-center">
            <q-avatar
              class="q-mb-lg shadow-2"
              color="white"
              font-size="60px"
              icon="fal fa-user-lock"
              size="100px"
              text-color="primary"
            />

            <div class="text-h6 q-mb-md text-grey-9 text-weight-medium">Welcome Back</div>
            <p class="text-grey-7 text-center q-mb-xl">
              Please sign in using your account to access the application.
            </p>

            <q-btn
              class="google-btn full-width"
              :loading="loading"
              unelevated
              @click="handleGoogleLogin"
            >
              <div class="row items-center full-width justify-center">
                <q-icon class="q-mr-md" name="fab fa-google" size="20px" />
                <div class="text-weight-bold">Sign in with Google</div>
              </div>
            </q-btn>
          </div>
        </q-card-section>

        <q-separator inset />

        <q-card-section class="q-pa-md text-center text-grey-6 text-caption">
          <div>By signing in, you agree to our</div>
          <div class="row justify-center q-gutter-x-sm">
            <RouterLink class="text-primary no-decoration" to="/auth/terms-of-service"
              >Terms of Service</RouterLink
            >
            <span>&bull;</span>
            <RouterLink class="text-primary no-decoration" to="/auth/privacy-policy"
              >Privacy Policy</RouterLink
            >
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.login-card-container {
  width: 100%;
  max-width: 450px;
  padding: 20px;
}

.login-card {
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.header-section {
  background-image: url('/overlay-bg.png');
  background-size: cover;
  background-position: center;
  background-color: $primary;
  padding: 60px 20px;
}

.google-btn {
  background-color: #ffffff;
  color: #757575;
  border: 1px solid #dadce0;
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f7f8f8;
    box-shadow:
      0 1px 2px 0 rgba(60, 64, 67, 0.3),
      0 1px 3px 1px rgba(60, 64, 67, 0.15);
  }

  :deep(.q-icon) {
    color: #4285f4;
  }
}

.no-decoration {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.opacity-80 {
  opacity: 0.8;
}
</style>
