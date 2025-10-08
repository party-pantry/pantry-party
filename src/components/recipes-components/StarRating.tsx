import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    max?: number;
    size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, max = 5, size = 25 }) => { 
    const stars = [];
    for (let i = 1; i <= max; i++) {
        if (i <= rating) {
            stars.push(<Star key={i} size={size} fill="gold" stroke="black" />);
        } else {
            stars.push(<Star key={i} size={size} fill="none" stroke="black" />);
        }
    }
    return <div className="d-flex gap-1">{stars}</div>;
}

export default StarRating;