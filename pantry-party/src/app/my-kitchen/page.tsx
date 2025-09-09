import { Container, Button } from "react-bootstrap";
// import React, { useState } from "react";
import IngredientTable from "../../components/IngredientTable";

type Item = {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: "Good" | "Low Stock" | "Out of Stock" | "Expired";
};

// const MyKitchen = () => {
const MyKitchen: React.FC = () => {	
	const items: Item[] = [
		{
		id: 1,
		name: "Tomatoes",
		image: "🍅",
		quantity: "20",
		updated: "Aug 15, 2024, 14:30",
		status: "Good",
		},
		{
		id: 2,
		name: "Chicken Breast",
		image: "🍗",
		quantity: "3",
		updated: "Sep 8, 2025, 14:30",
		status: "Low Stock",
		},
		{
		id: 3,
		name: "Egg",
		image: "🥚",
		quantity: "0",
		updated: "Aug 15, 2024, 14:30",
		status: "Out of Stock",
		},
	];

  return (
    <Container style={{ marginTop: 100}}>
		<div style={{ display: "flex", justifyContent: "center", alignItems: "left", flexDirection: "column", height: "10vh", paddingTop: 5 }}>
        	<Button style={{ justifyContent: "left", width: '125px' }} variant="success"><strong>Add Item +</strong></Button>
		</div>
		<div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", height: "50vh", marginBottom: '200px'}}>
			<h1>My Kitchen</h1>
        	<h2>Here you can see what is in your kitchen.</h2>
      	</div>
		<div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", textAlign: "center", height: "50vh", marginBottom: '200px'}}>
			<IngredientTable items={items} />
		</div>
    </Container>
  );
}

export default MyKitchen;