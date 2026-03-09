<script setup lang="ts">
import HeroSection from '@/components/HeroSection.vue'

interface FeatureCard {
  title: string
  description: string
  d: string
  color: string
  bg: string
}

const features: FeatureCard[] = [
  {
    title: 'Connect',
    description:
      'Plug into any data source — databases, APIs, flat files, or streaming platforms — with a growing library of pre-built connectors.',
    d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
  },
  {
    title: 'Transform',
    description:
      'Apply filters, joins, aggregations, and custom logic through an intuitive visual designer — no SQL or code required.',
    d: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950',
  },
  {
    title: 'Deliver',
    description:
      'Schedule and automate pipeline runs that push clean, reliable data to your warehouses, dashboards, or downstream services.',
    d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
  },
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection />

    <!-- Divider -->
    <div class="max-w-5xl mx-auto px-6">
      <hr class="border-gray-200 dark:border-gray-800" />
    </div>

    <!-- Feature Cards -->
    <section class="max-w-5xl mx-auto px-6 py-16" aria-labelledby="features-heading">
      <h2
        id="features-heading"
        class="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2"
      >
        Everything you need, nothing you don't
      </h2>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-10">
        Three simple steps to turn raw data into business value.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <article
          v-for="card in features"
          :key="card.title"
          class="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-800
                 bg-white dark:bg-gray-900
                 hover:shadow-md dark:hover:shadow-gray-900
                 transition-shadow duration-200"
        >
          <!-- Icon -->
          <div :class="['self-start p-3 rounded-lg', card.bg]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              :class="['w-6 h-6', card.color]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="card.d" />
            </svg>
          </div>

          <!-- Title -->
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{ card.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ card.description }}
          </p>
        </article>
      </div>
    </section>
  </div>
</template>
