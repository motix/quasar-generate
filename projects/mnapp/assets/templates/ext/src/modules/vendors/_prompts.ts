import { definePrompts } from '../index.js';

export default definePrompts(function () {
  return [
    {
      name: 'vendors',
      type: 'input',
      message: `[vendors] Which to install?
- [fap] Font Awesome Pro (add .npmrc with Font Awesome Pro token before continuing)
- [axs] axios
- [lds] Lodash
- [jgd] js-guid
- [atm] AutoMapper TypeScript
- [vld] vee-validate
- [mkd] markdown-it
`,
      default: 'fap,axs,lds,jgd,atm,vld,mkd',
    },
  ];
});
