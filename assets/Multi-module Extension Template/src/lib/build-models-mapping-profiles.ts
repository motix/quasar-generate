import fs from 'fs';
import path from 'path';

export default function buildModelsMappingProfiles(appDir: string, namespace: string) {
  const mappingProfiles = fs
    .readdirSync(path.resolve(appDir, `src/models/${namespace}/mapper`))
    .filter((item) => item !== `${namespace}Mapper.ts`)
    .map((item) => item.substring(0, item.length - '.ts'.length));

  let content = mappingProfiles
    .map((item) => `import ${item} from 'models/${namespace}/mapper/${item}.js';`)
    .join('\n');
  content = `${content}

export default [${mappingProfiles.join(', ')}]`;

  fs.writeFileSync(
    path.resolve(appDir, `.quasar/${namespace}ModelsMappingProfiles.ts`),
    content,
    'utf-8',
  );
}
