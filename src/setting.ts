import * as dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
export const dirname = path.dirname(fileURLToPath(import.meta.url));
export const channels = new Set<string>();
channels.add(process.env.CHANNEL);
channels.add(process.env.CHANNEL2);