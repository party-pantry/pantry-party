import React from "react";
import IngredientRow from "./IngredientRow";

// Properties of an ingredient item in table
type Item = {
  id: number;
  name: string;
  image: string;
  quantity: string;
  updated: string;
  status: "Good" | "Low Stock" | "Out of Stock" | "Expired";
};

interface Props {
  items: Item[];
}

// Mockup UI of what list of ingredients table could look like
const IngredientTable: React.FC<Props> = ({ items }) => {
  return (
    <table className="w-full border-collapse bg-white shadow-md rounded">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">
            <input type="checkbox" />
          </th>
          <th className="p-3 text-left">Item Name</th>
          <th className="p-3 text-left">Image</th>
          <th className="p-3 text-left">Quantity</th>
          <th className="p-3 text-left">Last Updated</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <IngredientRow key={item.id} {...item} />
        ))}
      </tbody>
    </table>
  );
};

export default IngredientTable;
