/* eslint-disable react/prop-types */
import { Card } from 'react-bootstrap';

interface Props {
  title: string;
  description: string;
  icon: React.ReactNode
}

const FeatureCard: React.FC<Props> = ({ title, description, icon }) => (
  <Card className="feature-card">
    <div className="feature-icon-circle">{icon}</div>
    <Card.Body className="text-center">
      <Card.Title className="feature-title">
        {title}
      </Card.Title>
      <Card.Text className="feature-description">
        {description}
      </Card.Text>
    </Card.Body>
  </Card>
);

export default FeatureCard;
