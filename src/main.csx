function App() {
  return (
    <>
      <Header /> {/* Your site header */}

      {/* Add main landmark */}
      <main id="main-content" role="main" className="min-h-screen">
        {/* Your actual page content */}
        <HeroSection />
        <Features />
        <CallToAction />
      </main>

      <Footer />
    </>
  )
}
