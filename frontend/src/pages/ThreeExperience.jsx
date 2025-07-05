// src/pages/ThreeExperience.jsx
import React, { useEffect } from 'react'
import Application from '../threejs/javascript/Application.js'

const ThreeExperience = () => {
  useEffect(() => {
    const app = new Application({
      $canvas: document.querySelector('.webgl'), // ✅ giống Bruno
    })

    return () => {
      app.destroy?.()
    }
  }, [])

  return (
    <>
      <canvas
        className="webgl"
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'block',
          zIndex: 9999,
        }}
      />

      {/* Cần thiết nếu Application sử dụng các class bên dưới */}
      <div className="threejs-journey is-hover-none js-threejs-journey">
        <div className="message js-message">
          <div className="boy">
            <div className="variant is-hi">
              <div className="body"></div>
              <div className="arm js-boy-arm"></div>
            </div>
            <div className="variant is-yay"></div>
            <div className="variant is-shrugging"></div>
          </div>
          <div className="bubble">
            <div className="text">Hey! You seem to really enjoy my portfolio.</div>
            <div className="tip"></div>
          </div>
        </div>

        <div className="message js-message">
          <div className="bubble">
            <div className="text">Would you like to learn how to create cool websites like this?</div>
            <div className="tip"></div>
          </div>
        </div>

        <div className="message js-message is-answers">
          <a href="#" className="answer is-no js-no">
            <span className="background"></span>
            <span className="hover"></span>
            <span className="label">Nah, I'm good</span>
          </a>
          <a href="https://threejs-journey.com?c=p1" target="_blank" rel="noopener" className="answer is-yes js-yes">
            <span className="background"></span>
            <span className="hover"></span>
            <span className="label">Yes, teach me!</span>
          </a>
        </div>

        <div className="message js-message">
          <div className="bubble">
            <div className="text">Alright then.<br />Have fun and try not to break my car!</div>
            <div className="tip"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ThreeExperience;
