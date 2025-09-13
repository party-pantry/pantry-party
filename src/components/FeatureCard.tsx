import { Card } from 'react-bootstrap';

interface Props {
    title: string;
    description: string;
    image: string;
}

const FeatureCard: React.FC<Props> = ({title, description, image }) => {
    return (
        <Card style={{ width: '20rem' }}>
            <Card.Img variant='top' src={image} style={{ width: "100%", height: "200px", objectFit: "cover" }}/>
            <Card.Body>
                <Card.Title>
                    {title}
                </Card.Title>
                <Card.Text>
                    {description}
                </Card.Text>
            </Card.Body>
        </Card>
    );
};

export default FeatureCard;