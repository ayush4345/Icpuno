import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Icpuno_backend } from 'declarations/Icpuno_backend';
import Navbar from "./components/homepage/Navbar";
import Hero from "./components/homepage/Hero";
import About from "./components/homepage/About";
import Footer from "./components/homepage/Footer";
import Quote from "./components/homepage/Quote";
import Explore from "./components/homepage/Explore";
import Play from "./components/play";
// import Room from "./components/Room"; // Import Room component

function App() {
  const [greeting, setGreeting] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    Icpuno_backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <main className="flex min-h-screen flex-col items-center justify-between">
              <div className="w-full overflow-hidden">
                <Navbar />
                <Hero />
                <div className="relative">
                  <About />
                  <Explore />
                </div>
                <div className="relative">
                  <Quote />
                </div>
                <div className="relative">
                  <Footer />
                </div>
              </div>
            </main>
          </>
        } />
        <Route path="/play" element={<Play />} />
        {/* <Route path="/room" element={<Room />} />  */}
      </Routes>
    </Router>
  );
}

export default App;

