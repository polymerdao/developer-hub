import React from 'react';
import {Redirect} from '@docusaurus/router';

// The site root redirects into the docs so visitors land on content instead of
// a near-empty splash page. Points at the Learn section's "About Polymer" so
// new readers get the conceptual overview first.
export default function Home() {
  return <Redirect to="/docs/learn/about-polymer" />;
}
