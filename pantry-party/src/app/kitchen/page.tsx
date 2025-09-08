import { Container, Button } from "react-bootstrap";

const Kitchen = () => {
  return (
    <Container style={{ marginTop: 100}}>
		<div style={{ display: "flex", justifyContent: "center", alignItems: "left", flexDirection: "column", height: "10vh", paddingTop: 5 }}>
        	<Button style={{ justifyContent: "left", width: '125px' }} variant="success"><strong>Add Item +</strong></Button>
		</div>
		<div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", height: "50vh", marginBottom: '200px'}}>
			<h1>My Kitchen</h1>
        	<h2>Here you can see what is in your kitchen.</h2>
      	</div>
    </Container>
  );
}

export default Kitchen;