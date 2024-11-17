import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',

	// eslint-disable-next-line security/detect-unsafe-regex, sonarjs/slow-regex
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
