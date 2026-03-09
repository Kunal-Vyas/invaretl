<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
    <div class="mb-6 text-gray-300 dark:text-gray-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-24 h-24 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <h1 class="text-6xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
      404
    </h1>

    <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
      Page Not Found
    </h2>

    <p class="text-gray-500 dark:text-gray-400 max-w-md mb-8">
      The page you're looking for doesn't exist or may have been moved.
      Check the URL or head back to the home page.
    </p>

    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700
             text-white text-sm font-medium transition-colors
             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Go to Home
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
