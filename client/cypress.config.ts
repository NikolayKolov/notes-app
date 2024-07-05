import { defineConfig } from "cypress";
import vitePreprocessor from 'cypress-vite';
import path from 'path';

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// __dirname is not available in NodeJS modules, use this work around
const _dirname = typeof __dirname !== 'undefined' ?
    __dirname:
    dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
        // need cypress-vite for vite end-to-end testing,
        // otherwise cypress can use only component testing
        on('file:preprocessor', vitePreprocessor({
            configFile: path.resolve(_dirname, './vite.config.ts'),
            mode: 'development',
        }));
    },
    baseUrl: 'http://localhost:5173',
    env: {
        test_user: '', // Add your test user here
        test_user_password: '', // Add your test user password here
        test_user_name: '' // Add your test user display name here
    }
  },
});
