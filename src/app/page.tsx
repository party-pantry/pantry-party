import { Container, Button } from "react-bootstrap";
import FeaturesSection from "@/components/home-components/FeaturesSection";

export default function Home() {
  return (
      <Container>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", height: "100vh" }}>
          <h1>The Fun Way To Stock Your Pantry</h1>
          <h5>Easily track and manage your pantry items across multiple kitches and storage spaces.</h5>
          <Button>Get Started</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }} className="mb-5">
          <h1>Features</h1>
          <FeaturesSection />
        </div>
      </Container>
  );
}
