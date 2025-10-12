'use client';

import React, { useState } from 'react';
import { Image, Offcanvas, Button, Nav } from 'react-bootstrap';
import SideBarItem from './TestSideBarItem';
import { 
    ChevronFirst,
    ChevronLast, 
    Menu,
    Refrigerator,
    ListCheck,
    ChefHat,
    User,
    Settings,
    ScanBarcode,
    MapPin,
    Heart
} from 'lucide-react';

const SideBar: React.FC = () => {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState<string>('MyKitchen');

    const handleToggleExpand = () => setExpanded((c) => !c);
    const handleClose = () => setShowOffcanvas(false);
    const handleShow = () => setShowOffcanvas(true);

    const navItems = [
        { 
            key: 'MyKitchen', 
            label: 'My Kitchen', 
            icon: <Refrigerator />, 
            link: '/my-kitchen',
            subItems: [
                { label: 'Barcode Scanner', link: '/my-kitchen/scan-barcode' }
            ]
        },
        { 
            key: 'ShoppingList', 
            label: 'Shopping List', 
            icon: <ListCheck />, 
            link: '/shopping-list',
            subItems: [
                { label: 'Market Locator', link: '/shopping-list/market-locator' }
            ]
        },
        { 
            key: 'Recipes', 
            label: 'Recipes', 
            icon: <ChefHat />, 
            link: '/recipes',
            subItems: [
                { label: 'Favorites', link: '/recipes/favorited-recipes' }
            ]
        },
        { key: 'Profile', label: 'Profile', icon: <User />, link: '/profile' },
        { key: 'Settings', label: 'Settings', icon: <Settings />, link: '/settings' },
    ];

    const sidebarStyle: React.CSSProperties = {
        width: expanded ? 200: 100,
        transition: 'width 240ms ease',
    };

    return (
        <>

        <Button
            variant="light"
            onClick={handleShow}
            className="d-lg-none position-fixed top-0 start-0 m-3 z-3 bg-success-custom shadow-sm"
        >
            <Menu stroke="white" />
        </Button>
        
        <aside 
            className="d-none d-lg-block position-fixed top-0 start-0 h-100 bg-success-custom text-white shadow-sm"
            style={sidebarStyle}
        >
            <div className="d-flex flex-column h-100">
                <div className="position-relative p-3 d-flex align-items-center">
                    <Image
                        src="/pantry-party.png"
                        alt="Pantry Party Logo"
                        width={expanded ? 100: 50}
                        height={expanded ? 100: 50}
                        className="me-2"
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                        <Button
                            variant="light"
                        onClick={handleToggleExpand}
                            className="p-2 rounded bg-transparent border-0"
                        >
                            {expanded ? <ChevronFirst stroke="white"/> : <ChevronLast stroke="white"/>}
                        </Button>
                    </div>
                </div>
            <Nav className="flex-grow-1 overflow-auto px-2 pb-3">
                {navItems.map((item) => (
                    <SideBarItem
                        key={item.key}
                        item={item}
                        expanded={expanded}
                        isActive={activeKey == item.key}
                        dropdownOpen={openDropdown == item.key}
                        onToggleDropdown={(key) =>
                            setOpenDropdown(openDropdown == key ? null : key)
                        }
                        onClick={() => setActiveKey(item.key)}
                        onSubClick={(link) => {
                            {/* TODO: IMPLEMENT SUBPAGES*/}
                            console.log('Going to sub Item')
                        }}
                    />
                ))}
            </Nav>
            </div>
        </aside>
        </>
    )
};

export default SideBar;