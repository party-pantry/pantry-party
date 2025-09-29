'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

type Nutrition = {
  id: string | number;
  name: string;
  amount: number | string;
  unit: string;
};

interface NutritionAccordionProps {
  nutrition: Nutrition[];
}

const NutritionAccordion = ({ nutrition }: NutritionAccordionProps) => {
  const [open, setOpen] = useState(false);

  return (
        <div className="w-full max-w-md bg-transparent">
            <div
                className="flex items-center cursor-pointer gap-3 font-semibold text-lg px-0 py-2"
                onClick={() => setOpen(!open)}
            >
                <span>Nutrition Info</span>
                {open ? <Minus size={20} /> : <Plus size={20} />}
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden flex flex-col gap-1 mt-2"
                    >
                        {nutrition.map((n) => (
                            <div key={n.id} className="flex justify-between">
                                <span>{n.name}</span>
                                <span className="text-right">{n.amount} {n.unit}</span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
  );
};

export default NutritionAccordion;
