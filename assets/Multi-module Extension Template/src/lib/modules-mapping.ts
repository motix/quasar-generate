import fs from 'fs';
import path from 'path';

export default function () {
  const modules: {
    [key in string]: string;
  } = {};

  const modulesPath = path.resolve(import.meta.dirname, '../modules');
  const folders = fs
    .readdirSync(modulesPath)
    .filter((value) => fs.lstatSync(path.resolve(modulesPath, value)).isDirectory());

  folders.forEach((folder) => {
    const files = fs
      .readdirSync(path.resolve(modulesPath, folder))
      .filter((value) => fs.lstatSync(path.resolve(modulesPath, folder, value)).isFile());

    if (files.length === 0) {
      const subFolders = fs
        .readdirSync(path.resolve(modulesPath, folder))
        .filter((value) => fs.lstatSync(path.resolve(modulesPath, folder, value)).isDirectory());

      subFolders.forEach((subFolder) => {
        modules[`${folder}-${subFolder}`] = `${folder}/${subFolder}`;
      });
    } else {
      modules[folder] = folder;
    }
  });

  return modules;
}
