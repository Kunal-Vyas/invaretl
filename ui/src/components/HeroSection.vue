<template>
  <section class="flex flex-col items-center justify-center text-center py-20 px-6">
    <!-- Icon / Logo mark -->
    <div class="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-14 h-14"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
        />
      </svg>
    </div>

    <!-- Heading -->
    <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
      Welcome to
      <span class="text-blue-600 dark:text-blue-400">InvarETL</span>
    </h1>

    <!-- Subheading -->
    <p class="text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed">
      The no-code data fabric platform. Connect any source, transform with ease,
      and deliver clean data — without writing a single line of pipeline code.
    </p>

    <!-- CTA -->
    <button
      type="button"
      class="inline-flex items-center gap-2 px-7 py-3 rounded-lg
             bg-blue-600 hover:bg-blue-700 active:bg-blue-800
             text-white text-base font-semibold
             shadow-md hover:shadow-lg
             transition-all duration-150
             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label="Get started with InvarETL"
    >
      Get Started
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </button>
  </section>
</template>
