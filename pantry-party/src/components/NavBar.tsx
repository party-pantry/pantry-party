'use client';

import Link from "next/link"
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Refrigerator, ListCheck, ChefHat, User, ChevronUp, ChevronDown } from "lucide-react";
import {useState } from 'react';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import SignOutModal from '../components/SignOutModal';

const NavBar: React.FC = () => {
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showSignOut, setShowSignOut] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <>
        <Navbar expand="lg" fixed="top" bg="primary" variant="dark" className="custom-navbar">
            <Container>
                <Navbar.Brand as={Link} href="/">Pantry Party</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} href="/my-kitchen" className="nav-link-icon">
                            <Refrigerator />
                            <span className="nav-link-text">My Kitchen</span>
                        </Nav.Link>
                        <Nav.Link as={Link} href="/" className="nav-link-icon">
                            <ListCheck />
                            <span className="nav-link-text">Shopping List</span>
                        </Nav.Link>
                        <Nav.Link as={Link} href="/" className="nav-link-icon">
                            <ChefHat />
                            <span className="nav-link-text">Recipes</span>
                        </Nav.Link>
                        <NavDropdown
                        id="login-dropdown"
                        className="nav-dropdown"
                        renderMenuOnMount={true}
                        show={dropdownOpen}
                        onToggle={(isOpen) => setDropdownOpen(isOpen)}
                        title={
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <User />
                                {dropdownOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                            </span>
                        }>
                            <NavDropdown.Item onClick={() => setShowSignIn(true)}>Sign In</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setShowSignUp(true)}>Sign Up</NavDropdown.Item>
                            <NavDropdown.Item onClick={() => setShowSignOut(true)}>Sign Out</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <SignInModal show={showSignIn} onHide={() => setShowSignIn(false)} />
        <SignUpModal show={showSignUp} onHide={() => setShowSignUp(false)} />
        <SignOutModal show={showSignOut} onHide={() => setShowSignOut(false)} />
        </>
    );
};

export default NavBar;