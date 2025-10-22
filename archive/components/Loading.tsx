import { Spinner } from 'react-bootstrap';

const Loading: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center">
    <Spinner animation="border" variant="primary" role="status" style={{ width: '5rem', height: '5rem' }}>
        <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default Loading;
