// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Polymer Developer Docs',
  tagline: 'Learn. Build. Connect.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.polymerlabs.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'polymerdao', // Usually your GitHub org/user name.
  projectName: 'developer-hub', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/polymerdao/developer-hub',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-JQRLRMLBW3', // Your GA4 Measurement ID
          anonymizeIP: true, // Optional: Anonymizes the IP addresses of your visitors
        },
        googleTagManager: {
          containerId: 'GT-MR4MVJ8',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/poly-socialcard.jpg',
      navbar: {
        title: 'Docs',
        hideOnScroll: false,
        logo: {
          alt: 'Polymer Logo',
          src: 'img/logo-png-black.png',
          srcDark: 'img/logo-png-white.png',
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "learnSidebar",
            label : 'Learn', 
            position: 'left'
          },
          {
            type: 'docSidebar',
            sidebarId: 'buildSidebar', 
            label : 'Build', 
            position: 'left'
          },
          {
            type: 'docSidebar',
            sidebarId: 'quickstartSidebar',
            label : 'Quickstart', 
            position: 'left'
          },          
          {
            href: 'https://github.com/polymerdao',
            // label: 'GitHub',
            html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="github-icon">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0.300049C5.4 0.300049 0 5.70005 0 12.3001C0 17.6001 3.4 22.1001 8.2 23.7001C8.8 23.8001 9 23.4001 9 23.1001C9 22.8001 9 22.1001 9 21.1001C5.7 21.8001 5 19.5001 5 19.5001C4.5 18.1001 3.7 17.7001 3.7 17.7001C2.5 17.0001 3.7 17.0001 3.7 17.0001C4.9 17.1001 5.5 18.2001 5.5 18.2001C6.6 20.0001 8.3 19.5001 9 19.2001C9.1 18.4001 9.4 17.9001 9.8 17.6001C7.1 17.3001 4.3 16.3001 4.3 11.7001C4.3 10.4001 4.8 9.30005 5.5 8.50005C5.5 8.10005 5 6.90005 5.7 5.30005C5.7 5.30005 6.7 5.00005 9 6.50005C10 6.20005 11 6.10005 12 6.10005C13 6.10005 14 6.20005 15 6.50005C17.3 4.90005 18.3 5.30005 18.3 5.30005C19 7.00005 18.5 8.20005 18.4 8.50005C19.2 9.30005 19.6 10.4001 19.6 11.7001C19.6 16.3001 16.8 17.3001 14.1 17.6001C14.5 18.0001 14.9 18.7001 14.9 19.8001C14.9 21.4001 14.9 22.7001 14.9 23.1001C14.9 23.4001 15.1 23.8001 15.7 23.7001C20.5 22.1001 23.9 17.6001 23.9 12.3001C24 5.70005 18.6 0.300049 12 0.300049Z" fill="currentColor"/>
            </svg>
            `,
            position: "right",
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              {
                label: 'IBC specs',
                href: 'https://github.com/cosmos/ibc',
              },
              {
                label: 'ibc-go',
                href: 'https://github.com/cosmos/ibc-go',
              },
              {
                label: 'ibcx-go',
                href: 'https://github.com/open-ibc/ibcx-go',
              },
              {
                label: 'Ethereum',
                href: 'https://ethereum.org/en/developers/docs/'
              },
              {
                label: 'OP Stack',
                href: 'https://stack.optimism.io/'
              }
            ],
          },
          
          {
            title: 'Community',
            items: [
              {
                label: 'Developer Forum',
                href: 'https://forum.polymerlabs.org',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/hvMQp4qcM6',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/Polymer_Labs',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                href: 'https://polymerlabs.org/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/polymerdao',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Polymer Labs. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'go', 'rust', 'typescript', 'solidity']
      },
    }),
};

module.exports = config;
