import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every entry is its own file so a headless CMS (Decap, Sanity export, ...) can map
 * one document to one file. Images are paths relative to the entry file.
 */

const lang = z.enum(['en', 'nl', 'all']).default('all');

const highlights = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/highlights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      speaker: z.string(),
      date: z.coerce.date(),
      /** The 11-character YouTube video ID, e.g. "dQw4w9WgXcQ". */
      youtubeId: z.string().regex(/^[\w-]{11}$/, 'Must be an 11-character YouTube video ID'),
      thumbnail: image(),
      /** Optional Dutch title/speaker, used on the /nl/ pages when lang is "all". */
      nl: z.object({ title: z.string().optional(), speaker: z.string().optional() }).optional(),
      lang,
    }),
});

const meetings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/meetings' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /** 24h local Dutch time, e.g. "19:30". */
      time: z.string().regex(/^\d{2}:\d{2}$/, 'Use 24h HH:MM'),
      timezone: z.enum(['CET', 'CEST']),
      zoomLink: z.url(),
      /** Zoom meeting ID as printed on the flyer, e.g. "839 0399 8030". */
      meetingId: z.string().optional(),
      description: z.string(),
      /** Poster image (portrait, ~4:5). Meetings without one show a text card instead. */
      flyer: image().optional(),
      lang,
    }),
});

const pastors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/pastors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      photo: image(),
      /** Lower numbers are shown first. */
      order: z.number().default(0),
    }),
});

const settings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/settings' }),
  schema: z.object({
    siteName: z.string(),
    email: z.email(),
    phone: z.string(),
    faithline: z.string(),
    /** Shown on the Contact page map, e.g. 'Oudegracht, Utrecht'. */
    address: z.string(),
    globalChurchUrl: z.url(),
    ministryUrl: z.url(),
    social: z.object({
      facebook: z.url().optional(),
      linkedin: z.url().optional(),
      instagram: z.url().optional(),
      youtube: z.url().optional(),
    }),
  }),
});

export const collections = { highlights, meetings, pastors, settings };
