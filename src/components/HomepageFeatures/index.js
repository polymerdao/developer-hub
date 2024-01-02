import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [

  {
    title: 'Ethereum security',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Polymer is the first interoperability hub secured by Ethereum. It is a Cosmos SDK app chain that uses the OP stack for settlement onto Ethereum.
      </>
    ),
  },
  {
    title: 'Scalable connectivity',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        As a rollup, Polymer offers low cost of connectivity and a reduced number of connections for rollups. It also enables a scalable mesh network topology using multi-hop IBC channels.
      </>
    ),
  },
  {
    title: 'Native IBC interoperability',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        IBC is the most robust messaging standard for asynchronously composable applications across chains. Polymer also enables IBC connectivity from Ethereum rollups to the rest of the IBC network.
      </>
    ),
  },  
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
