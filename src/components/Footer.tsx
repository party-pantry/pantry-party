/* eslint-disable jsx-a11y/anchor-is-valid */
import { Container, Row, Col } from 'react-bootstrap';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Github } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer id="footer" className="custom-footer bg-primary py-3">
    <Container>
      <Row className="align-items-center">
        <Col className="text-end d-flex justify-content-end">
          <h5>Quick Links</h5>
          <div className="w-0.5 bg-white h-8 mx-3"></div>
        </Col>
          <Col className="text-start align-items-center">
            <ul className="list-unstyled mb-0">
              <li><Link href="/#home" className="text-white text-decoration-none">Home</Link></li>
              <li><Link href="/#features" className="text-white text-decoration-none">Features</Link></li>
            </ul>
          </Col>
      </Row>
      {/* <div className="border-t border-white/30 mt-4"></div> */}
      <Row className="mt-4">
        <Col>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            Managed by Pantry Party Organization
            <Link href="https://party-pantry.github.io/" target="_blank" rel="noopener noreferrer">
              <Github style={{ flexShrink: 0 }} className="text-white" />
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
