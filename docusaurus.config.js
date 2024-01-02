// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Polymer Documentation',
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
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Developer Docs',
        logo: {
          alt: 'Polymer Logo',
          src: 'img/logo-png-black.png',
          srcDark: 'img/logo-png-white.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Home',
          },
          {to: '/docs/category/concepts', label : 'Concepts', position: 'left'},
          {to: '/docs/category/build', label : 'Build', position: 'left'},
          {
            href: 'https://github.com/polymerdao',
            label: 'GitHub',
            position: 'right',
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
                label: 'Polymer',
                to: '/docs/',
              },
              {
                label: 'IBC specs',
                to: 'https://github.com/cosmos/ibc',
              },
              {
                label: 'ibc-go',
                to: 'https://github.com/cosmos/ibc-go',
              },
              {
                label: 'ibcx-go',
                to: 'https://github.com/open-ibc/ibcx-go',
              },
              {
                label: 'Ethereum',
                to: 'https://ethereum.org/en/developers/docs/'
              },
              {
                label: 'OP Stack',
                to: 'https://stack.optimism.io/'
              }
            ],
          },
          
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'https://polymerlabs.org/blog',
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
