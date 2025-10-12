'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type SubItem = {
    label: string;
    link?: string
}

export type NavItem = {
    key: string;
    label: string;
    icon: React.ReactNode;
    link?: string;
    subItems?: SubItem[];
}

type Props = {
    item: NavItem;
    expanded: boolean;
    isActive: boolean;
    dropdownOpen: boolean;
    onToggleDropdown: (key: string) => void;
    onClick: () => void;
    onSubClick?: (link?: string) => void;
}

const SideBarItem: React.FC<Props> = ({
    item,
    expanded,
    isActive,
    dropdownOpen,
    onToggleDropdown,
    onClick,
    onSubClick
}) => {
    const hasChildren = !!item.subItems?.length;

    return (
        <div>
            <Button
                onClick={() => (hasChildren ? onToggleDropdown(item.key) : onClick())}
                className={`d-flex align-items-center w-100 text-start ${
                    expanded ? 'px-3' : 'px-2 justify-content-center'
                }`}
                style={{
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: 'inherit',
                    border: 'none',
                }}
                title={!expanded ? item.label : undefined}
            >
                <div className="me-2" style={{ display: 'inline-flex' }}>
                    {item.icon}
                </div>

                {expanded && (
                    <>
                        <div className="flex-grow-1">{item.label}</div>
                        {hasChildren && (
                            <div style={{ opacity: 0.9, fontSize: 14 }}>
                                {dropdownOpen ? <ChevronDown /> : <ChevronUp />}
                            </div>
                        )}
                    </>
                )}
            </Button>

            <AnimatePresence initial={false}>
                {dropdownOpen && hasChildren && (
                    <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="list-unstyled ms-3"
                        style={{ overflow: 'hidden' }}
                    >
                        {item.subItems!.map((sub) => (
                            <li key={sub.label}>
                                <Button
                                    className="w-100 text-start ps-4 py-1 bg-transparent"
                                    onClick={() => onSubClick?.(sub.link)}
                                    style={{ color: 'rgba(255,255,255,0.9)', border: 'none'}}
                                >
                                    {expanded ? sub.label : null}
                                </Button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SideBarItem;