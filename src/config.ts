import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://cp3.io/",
  author: "Corné Driesprong",
  desc: "This is my personal website where I write about things I learn and show the projects I work on",
  title: "cp3.io",
  ogImage: "cp3-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Mail",
    href: "mailto:corne@cp3.io",
    linkTitle: "Email",
    active: true,
  },
  {
    name: "Github",
    href: "https://github.com/cornedriesprong",
    linkTitle: "Github",
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/cornedriesprong",
    linkTitle: "LinkedIn",
    active: true,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/cp3.io",
    linkTitle: "Instagram",
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/cpdriesprong",
    linkTitle: "Twitter",
    active: true,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/channel/UCaBIAA0G5KWu5pY0wxNbtFg",
    linkTitle: "YouTube",
    active: true,
  },
  {
    name: "Mastodon",
    href: "https://mastodon.social/@cp3",
    linkTitle: "Mastodon",
    active: true,
  },
  {
    name: "Soundcloud",
    href: "https://soundcloud.com/sleeprites",
    linkTitle: "Soundcloud",
    active: true,
  },
  {
    name: "Bandcamp",
    href: "https://sleeprites.bandcamp.com/",
    linkTitle: "Bandcamp",
    active: true,
  },
];
