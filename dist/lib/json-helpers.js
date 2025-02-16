import fs from 'fs';
import { get, set, unset } from 'lodash-es';
export async function extendJsonFile(filePath, pathAdnValues) {
    const json = (await import(filePath, { with: { type: 'json' } })).default;
    if (json) {
        for (let { path, value } of pathAdnValues) {
            if (path.endsWith('[]')) {
                path = path.substring(0, path.length - 2);
                const currentValue = get(json, path);
                if (!currentValue.includes(value)) {
                    currentValue.push(value);
                }
                value = currentValue;
            }
            set(json, path, value);
        }
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    }
}
export async function reduceJsonFile(filePath, paths) {
    const json = (await import(filePath, { with: { type: 'json' } })).default;
    if (json) {
        for (const path of paths) {
            unset(json, path);
        }
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    }
}
export async function reduceJsonFileArray(filePath, pathAndValues) {
    const json = (await import(filePath, { with: { type: 'json' } })).default;
    if (json) {
        for (const { path, value } of pathAndValues) {
            const values = get(json, path);
            values?.includes(value) && values.splice(values.indexOf(value), 1);
        }
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    }
}
