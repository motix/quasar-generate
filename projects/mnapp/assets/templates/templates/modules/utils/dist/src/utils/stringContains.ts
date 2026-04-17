export default function stringContains(str: string, search: string) {
  // Char code 160: non-breaking space &nbsp;
  str = str.replaceAll(String.fromCharCode(160), String.fromCharCode(32)).toLowerCase();
  search = search.replaceAll(String.fromCharCode(160), String.fromCharCode(32)).toLowerCase();

  return str.indexOf(search) > -1;
}
