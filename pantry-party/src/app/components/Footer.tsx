import { Container, Row, Col } from 'react-bootstrap';
import { Github } from "lucide-react";
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer id="footer" className="custom-footer bg-primary py-5">
            <Container>
                <Row>
                    <Col>
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><a href="#" className="text-white text-decoration-none">Home</a></li>
                            <li><a href="#" className="text-white text-decoration-none">Features</a></li>
                            <li><a href="#" className="text-white text-decoration-none">Testimonials</a></li>
                            <li><a href="#" className="text-white text-decoration-none">How It Works</a></li>
                        </ul>
                    </Col>
                </Row>
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
};

export default Footer;
