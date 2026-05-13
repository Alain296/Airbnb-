export function Footer() {
  return (
    <footer className="footer-dark main-footer overflow-hidden position-relative pt-5">
      <div className="container pt-4">
        <div className="py-5">
          {/* App download content */}
          <div className="bg-primary rounded-4">
            <div className="col-xxl-10 col-md-11 col-10 d-flex flex-md-row flex-column-reverse align-items-md-end align-items-center mx-auto px-0 gap-4">
              <img
                className="app-image flex-shrink-0"
                src="/liston-v2.3/assets/images/phone-mpckup.png"
                width={270}
                alt="Mobile app"
              />
              <div className="align-items-lg-center align-self-center d-flex flex-column flex-lg-row ps-xxl-4 pt-5 py-md-3 text-center text-md-start">
                <div className="me-md-5">
                  <h4 className="text-white">Download Our App</h4>
                  <p className="mb-lg-0 text-white">
                    It is a long established fact that a reader will be distracted by the readable content.
                  </p>
                </div>
                <div className="d-flex flex-shrink-0 flex-wrap gap-3 justify-content-center">
                  <a
                    className="align-items-center app-btn d-flex px-3 py-2 rounded-3 text-decoration-none text-white border"
                    href="#"
                    onClick={e => e.preventDefault()}
                  >
                    <i className="fa-apple fab fs-28 me-2" />
                    <div>
                      <span className="fs-13 d-block">Available on the</span>{' '}
                      <span className="fs-17 text-capitalize">App Store</span>
                    </div>
                  </a>
                  <a
                    className="align-items-center app-btn d-flex fs-11 px-3 py-2 rounded-3 text-decoration-none text-white border"
                    href="#"
                    onClick={e => e.preventDefault()}
                  >
                    <i className="fab fa-google-play fs-25 me-2" />
                    <div>
                      <span className="fs-13 d-block">Get it on</span>{' '}
                      <span className="fs-17 text-capitalize">Google Play</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* end app download content */}
        </div>

        <div className="border-top py-5">
          <div className="footer-row row gy-5 g-sm-5 gx-xxl-6">
            <div className="border-end col-lg-4 col-md-7 col-sm-6">
              <h5 className="fw-bold mb-4">Get In Touch</h5>
              <div className="mb-4">
                Join our newsletter and receive the best job
                <br className="d-none d-xxl-block" /> openings of the week, right on your inbox.
              </div>
              <div className="border rounded-4 p-4 mb-4">
                <h6 className="text-white-50 mb-3">Join our Whatsapp:</h6>
                <a
                  className="align-items-center d-block d-flex whatsapp-number"
                  href="#"
                  onClick={e => e.preventDefault()}
                >
                  <i className="fa-brands fa-whatsapp fs-2 me-2" />
                  <span className="fs-5 fw-semibold text-decoration-underline">(123) 456-7890</span>
                </a>
              </div>
              <h5 className="fw-bold mb-4">
                Want to join ListOn?
                <br /> Write us !
              </h5>
              <span>
                <a href="mailto:support@ListOn.com" className="text-decoration-none text-white">
                  support@ListOn.com
                </a>
              </span>
            </div>

            <div className="border-end col-lg-4 col-md-5 col-sm-6">
              <h5 className="fw-bold mb-4">Stay Connect</h5>
              <div>
                1123 Fictional St, San Francisco
                <br className="d-none d-xxl-block" /> , CA 94103
              </div>
              <div className="mt-4">
                <a className="d-block fw-medium mb-1" href="#" onClick={e => e.preventDefault()}>
                  <i className="fa-solid fa-phone me-2" />
                  <span>(123) 456-7890</span>
                </a>
                <a className="email-link d-block fw-medium" href="#" onClick={e => e.preventDefault()}>
                  <i className="fa-solid fa-envelope me-2" />
                  <span>support@ListOn.com</span>
                </a>
              </div>
            </div>

            <div className="col-lg-4">
              <h5 className="fw-bold mb-4">Get In Touch</h5>
              <div className="newsletter position-relative mt-4">
                <input type="email" className="form-control" placeholder="name@example.com" />
                <button
                  type="button"
                  className="btn btn-primary search-btn position-absolute top-50 rounded-circle"
                  aria-label="Submit email"
                >
                  <i className="fa-solid fa-angle-right" />
                </button>
              </div>
              <div className="border-top my-4" />
              <h5 className="fw-bold mb-4">Follow the location</h5>
              <ul className="d-flex flex-wrap gap-2 list-unstyled mb-0 social-icon">
                <li>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="rounded-circle align-items-center d-flex fs-19 icon-wrap justify-content-center rounded-2 text-white inst"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="rounded-circle align-items-center d-flex fs-19 icon-wrap justify-content-center rounded-2 text-white twi"
                    aria-label="Twitter"
                  >
                    <i className="fab fa-twitter" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="rounded-circle align-items-center d-flex fs-19 icon-wrap justify-content-center rounded-2 text-white dri"
                    aria-label="Dribbble"
                  >
                    <i className="fab fa-dribbble" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="rounded-circle align-items-center d-flex fs-19 icon-wrap justify-content-center rounded-2 text-white fb"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="rounded-circle align-items-center d-flex fs-19 icon-wrap justify-content-center rounded-2 text-white whatsapp"
                    aria-label="Whatsapp"
                  >
                    <i className="fa-brands fa-whatsapp" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="container border-top">
        <div className="align-items-center g-3 py-4 row">
          <div className="col-lg-auto">
            <ul className="list-unstyled list-separator mb-2 footer-nav">
              <li className="list-inline-item">
                <a href="#" onClick={e => e.preventDefault()}>
                  Privacy
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" onClick={e => e.preventDefault()}>
                  Sitemap
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" onClick={e => e.preventDefault()}>
                  Cookies
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg order-md-first">
            <div className="align-items-center row">
              <a href="#" onClick={e => e.preventDefault()} className="col-sm-auto footer-logo mb-2 mb-sm-0">
                <img src="/liston-v2.3/assets/images/logo-white.png" alt="ListOn" />
              </a>
              <div className="col-sm-auto copy">© 2022 ListOn - All Rights Reserved- All Rights Reserved</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
