'use client';

import { Container, Row, Col } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import LocationsFilter from './locations-components/LocationsFilter';

const LocationsMap = dynamic(() => import('@/components/locations-components/LocationsMap'), { ssr: false });

const Locations = () => (
        <Container className="mb-12 min-h-screen mt-5">
            <Row>
                <Col md={8} className="mb-4 mb-md-0">
                    <LocationsMap />
                </Col>
                <Col md={4} className="stick-top top-5">
                    <LocationsFilter />
                </Col>
            </Row>
        </Container>
);

export default Locations;
