'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu, sidebarClasses } from 'react-pro-sidebar';
import { Image, Button } from 'react-bootstrap';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  House,
  Refrigerator,
  ListCheck,
  ChefHat,
  Settings,
  ArrowRightToLine,
  ArrowLeftToLine,
  Github,
} from 'lucide-react';

const SideBar: React.FC = () => {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [isBreakpoint, setIsBreakpoint] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => setIsBreakpoint(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
        <>
            <Sidebar
                collapsed={collapsed}
                toggled={toggled}
                onBackdropClick={() => setToggled(false)}
                width="200px"
                collapsedWidth="85px"
                breakPoint="md"
                backgroundColor="#3A5B4F"
                rootStyles={{
                  [`.${sidebarClasses.container}`]: {
                    color: 'white',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'sticky',
                    border: 0,
                    top: 0,
                    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.25)',
                  },
                }}
            >
                <div className="p-3 d-flex align-items-center">
                    <Image
                        src="/pantry-party.png"
                        alt="Pantry Party Logo"
                        style={{
                          width: '50px',
                          height: 'auto',
                        }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Menu
                        menuItemStyles={{
                          button: ({ active }) => {
                            const baseBg = '#3A5B4F';
                            const hoverBg = '#588977';
                            const activeBg = '#283E36';

                            return {
                              backgroundColor: baseBg,
                              color: 'white',
                              borderLeft: active ? `4px solid ${activeBg}` : '4px solid transparent',
                              fontWeight: active ? '600' : '400',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: baseBg,
                                borderLeft: `4px solid ${hoverBg}`,
                                color: 'white',
                              },
                            };
                          },
                          label: ({ level }) => {
                            if (level >= 0) return { color: 'white' };
                            return {};
                          },
                          subMenuContent: ({ level }) => {
                            if (level === 1) return { backgroundColor: '#3A5B4F' };
                            return {};
                          },
                        }}
                    >
                        <MenuItem
                            component={<Link href="/" />}
                            active={pathname === '/'}
                            icon={<House />}
                        >
                            Home
                        </MenuItem>
                        {session && (
                            <>
                                <SubMenu label="My Kitchen" icon={<Refrigerator />} >
                                    <MenuItem
                                        component={<Link href="/my-kitchen" />}
                                        active={pathname === '/my-kitchen'}
                                    >
                                        Inventory
                                    </MenuItem>
                                    <MenuItem
                                        component={<Link href="/my-kitchen/receipt-scanner" />}
                                        active={pathname === '/my-kitchen/receipt-scanner'}
                                    >
                                        Receipt Scan
                                    </MenuItem>
                                </SubMenu>
                                <SubMenu label="Shopping List" icon={<ListCheck />}>
                                    <MenuItem
                                        component={<Link href="/shopping-list" />}
                                        active={pathname === '/shopping-list'}
                                    >
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem
                                        component={<Link href="/shopping-list/market-locator" />}
                                        active={pathname === '/shopping-list/market-locator'}
                                    >
                                        Market Locator
                                    </MenuItem>
                                </SubMenu>
                                <SubMenu label="Recipes" icon={<ChefHat />}>
                                    <MenuItem
                                        component={<Link href="/recipes" />}
                                        active={pathname === '/recipes'}
                                    >
                                        All Recipes
                                    </MenuItem>
                                    <MenuItem
                                        component={<Link href="/recipes/favorited" />}
                                        active={pathname === '/recipes/favorited'}
                                    >
                                        Favorited Recipes
                                    </MenuItem>
                                </SubMenu>
                            </>
                        )}
                        <MenuItem
                            component={<Link href="/settings" />}
                            active={pathname === '/settings'}
                            icon={<Settings />}
                        >
                            Settings
                        </MenuItem>
                    </Menu>
                </div>
                <div className="p-3 d-flex flex-column align-items-center justify-content-center">
                    {collapsed ? (
                        <Link href="https://party-pantry.github.io/" target="_blank" rel="noopener noreferrer">
                            <Github className="text-white" />
                        </Link>
                    ) : (
                        <>
                            <Link href="https://party-pantry.github.io/" target="_blank" rel="noopener noreferrer">
                                <Github className="text-white" />
                            </Link>
                            <p
                                className="text-[10px] text-white m-0 whitespace-nowrap mt-3"
                            >
                                Managed by Pantry Party Organization
                            </p>
                        </>
                    )}
                </div>
            </Sidebar>

            {isBreakpoint ? (
                <Button
                    className="position-fixed top-0 start-0 p-2 bg-success-custom border-0 rounded"
                    style={{
                      margin: '10px',
                      boxShadow: '2px 0 4px rgba(0, 0, 0, 0.25)',
                      zIndex: 10,
                    }}
                    onClick={() => {
                      setToggled(!toggled);
                      setCollapsed(false);
                    }}
                >
                    <ArrowRightToLine color="white" size={20} />
                </Button>
            ) : (
                <Button
                    className="position-fixed top-0 p-2 bg-success-custom border-0 rounded"
                    style={{
                      left: collapsed ? '60px' : '175px',
                      transition: 'left 0.3s',
                      zIndex: 10,
                      boxShadow: '2px 0 4px rgba(0, 0, 0, 0.25)',
                    }}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {!collapsed ? (
                        <ArrowLeftToLine color="white" size={20} />
                    ) : (
                        <ArrowRightToLine color="white" size={20} />
                    )}
                </Button>
            )}
        </>
  );
};

export default SideBar;
