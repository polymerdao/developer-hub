import React from 'react';
import {Redirect} from '@docusaurus/router';

// The site root redirects into the docs so visitors land on content instead of
// a near-empty splash page. Points at Build → Key Network Information (the
// endpoints, addresses, and supported chains a builder needs first).
export default function Home() {
  return <Redirect to="/docs/build/start" />;
}
