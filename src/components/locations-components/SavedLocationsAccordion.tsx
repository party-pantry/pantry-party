'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Form } from 'react-bootstrap';

type Location = {
  id: string;
  name: string;
  type: 'home' | 'store';
  address: string;
};

interface SavedLocationsAccordionProps {
  locations: Location[];
  selectedLocations: string[];
  setSelectedLocations: (ids: string[]) => void;
}

const SavedLocationsAccordion: React.FC<SavedLocationsAccordionProps> = ({
  locations,
  selectedLocations,
  setSelectedLocations,
}) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: string) => {
    if (selectedLocations.includes(id)) {
      setSelectedLocations(selectedLocations.filter((locId) => locId !== id));
    } else {
      setSelectedLocations([...selectedLocations, id]);
    }
  };

  return (
        <div className="w-full">
            <div
                className="flex items-center cursor-pointer gap-2 font-semibold text-base py-2"
                onClick={() => setOpen(!open)}
            >
                <span>Saved Locations</span>
                {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden flex flex-col gap-2 mt-2 pl-2"
                    >
                        {locations.length === 0 && (
                            <div className="text-muted text-sm">No saved locations</div>
                        )}
                        {locations.map((loc) => (
                            <Form.Check
                                key={loc.id}
                                type="checkbox"
                                id={`location-${loc.id}`}
                                label={
                                    <span className="flex items-center gap-2">
                                        <span>{loc.name}</span>
                                        <span className="text-muted text-xs ml-2">{loc.address}</span>
                                    </span>
                                }
                                checked={selectedLocations.includes(loc.id)}
                                onChange={() => handleToggle(loc.id)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
  );
};

export default SavedLocationsAccordion;
