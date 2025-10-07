'use client';

import { Container, Row, Col } from 'react-bootstrap';
import { House, ShoppingCart, CookingPot, RefreshCw, Search, DollarSign } from 'lucide-react';
import FeatureCard from './FeatureCard';

const features = [
  {
    title: 'Multiple Location Management',
    description: 'Manage fridges, freezers, and spice racks across multiple kitchens',
    icon: <House />,
  },
  {
    title: 'Shopping List Generation',
    description: 'Automatically see what’s running low and plan your shopping.',
    icon: <ShoppingCart />,
  },
  {
    title: 'Discover New Recipes',
    description: 'Explore user-created meals and find recipes you can make with ingredients you already have.',
    icon: <CookingPot />,
  },
  {
    title: 'Real-Time Inventory Updates',
    description: 'Update your pantry in real time and never lose track of items.',
    icon: <RefreshCw />,
  },
  {
    title: 'Quick Search Filters',
    description: 'Find any item quickly with search and filter options.',
    icon: <Search />,
  },
  {
    title: 'Instant Cost Estimates',
    description: 'Know how much you’ll spend if you restock everything.',
    icon: <DollarSign />,
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
