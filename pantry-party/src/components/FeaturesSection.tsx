'use client';

import { Container, Row, Col } from 'react-bootstrap';
import FeatureCard from './FeatureCard';

const features = [
    { 
        title: "Multiple Location Management", 
        description: "Manage fridges, freezers, and spice racks across multiple kitchens", 
        image: "https://dummyimage.com/200x200/" 
    },
    { 
        title: 'Custom Storage Spaces', 
        description: 'Add custom storage spaces and categorize your items for easy access.',
        image: "https://dummyimage.com/200x200/" 
    },
    { 
        title: 'Real-Time Inventory Updates', 
        description: 'Update your pantry in real time and never lose track of items.',
        image: "https://dummyimage.com/200x200/"
    },
    { 
        title: 'Shopping List Generation', 
        description: 'Automatically see what’s running low and plan your shopping.',
        image: "https://dummyimage.com/200x200/"
    },
    { 
        title: 'Instant Cost Estimates', 
        description: 'Know how much you’ll spend if you restock everything.',
        image: "https://dummyimage.com/200x200/"
    },
    { 
        title: 'Quick Search Filters', 
        description: 'Find any item quickly with search and filter options.',
        image: "https://dummyimage.com/200x200/"
    },
];

const FeaturesSection: React.FC = () => {
    return (
        <Container className="text-center my-5">
            <Row className="g-4 justify-content-center">
                {features.map((feature, index) => (
                    <Col md={4} sm={6} xs={12} key={index} className="d-flex justify-content-center">
                        <FeatureCard title={feature.title} description={feature.description} image={feature.image} />
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FeaturesSection;