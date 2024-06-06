import React from 'react';
import { Footer, Resources, Possibility, Features, WhatSmartGains, Header } from '.';
import { CTA, Brand, NavBar } from '../../components';

const HomePage = () => {
  return (
    <div>
      <NavBar />
      <Header />
      <Brand />
      <WhatSmartGains />
      <Features />
      <Possibility />
      <CTA />
      <Resources />
      <Footer />
    </div>
  );
};

export default HomePage;
