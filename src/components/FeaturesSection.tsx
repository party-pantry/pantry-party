'use client';

import { Container, Row, Col } from 'react-bootstrap';
import { House, Package2, RefreshCw, ShoppingCart, DollarSign, Search } from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    title: 'Multiple Location Management',
    description: 'Manage fridges, freezers, and spice racks across multiple kitchens',
    icon: <House />,
  },
  {
    title: 'Custom Storage Spaces',
    description: 'Add custom storage spaces and categorize your items for easy access.',
    icon: <Package2 />,
  },
  {
    title: 'Real-Time Inventory Updates',
    description: 'Update your pantry in real time and never lose track of items.',
    icon: <RefreshCw />,
  },
  {
    title: 'Shopping List Generation',
    description: 'Automatically see what’s running low and plan your shopping.',
    icon: <ShoppingCart />,
  },
  {
    title: 'Instant Cost Estimates',
    description: 'Know how much you’ll spend if you restock everything.',
    icon: <DollarSign />,
  },
  {
    title: 'Quick Search Filters',
    description: 'Find any item quickly with search and filter options.',
    icon: <Search />,
  },
];

const FeaturesSection: React.FC = () => (
  <Container className="text-center my-5">
    <Row className="g-4 justify-content-center">
      {features.map((feature) => (
        <Col md={4} sm={6} xs={12} key={feature.title} className="d-flex justify-content-center">
          <FeatureCard title={feature.title} description={feature.description} icon={feature.icon} />
        </Col>
      ))}
    </Row>
  </Container>
);

export default FeaturesSection;
