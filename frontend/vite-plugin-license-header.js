/**
 * Vite plugin to add license headers to build output
 * Replaces gulp-append-prepend functionality
 */
export function licenseHeaderPlugin() {
  const jsLicense = `/*!

=========================================================
* Material Dashboard PRO React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2019 Creative Tim (http://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
`;

  const htmlLicense = `<!--

=========================================================
* Material Dashboard PRO React - v1.8.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2019 Creative Tim (http://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

-->
`;

  const cssLicense = jsLicense; // CSS uses same format as JS

  return {
    name: 'license-header',
    enforce: 'post',

    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];

        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          chunk.code = jsLicense + chunk.code;
        }

        if (chunk.type === 'asset') {
          if (fileName.endsWith('.css')) {
            chunk.source = cssLicense + chunk.source;
          } else if (fileName.endsWith('.html')) {
            chunk.source = htmlLicense + chunk.source;
          }
        }
      }
    }
  };
}
