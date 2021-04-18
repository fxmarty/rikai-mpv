import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    lng: 'en',
    fallbackLng: 'en',
    ns: 'messages',
    defaultNS: 'messages',
    backend: {
        loadPath: path.join(__dirname, '..', 'locales/{{lng}}/{{ns}}.json'),
    },
    debug: false
}

i18next.use(Backend).init(options);

export { i18next };