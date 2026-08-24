import React from 'react';
import {Redirect} from '@docusaurus/router';

// The site root redirects straight into the Build docs so visitors land in the
// documentation instead of a near-empty splash page. This matches where the
// "Build" navbar tab points (the first doc in the Build sidebar).
export default function Home() {
  return <Redirect to="/docs/build/start" />;
}
