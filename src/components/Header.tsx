import React, { useState } from 'react';
import {
  Menu,
  X,
  Home,
  Users,
  Building2,
  User,
  LayoutGrid,
  LogOut } from
'lucide-react';
import { Page, User as UserType } from '../types';
interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  user: UserType | null;
  onLogout: () => void;
}
export function Header({
  currentPage,
  onNavigate,
  user,
  onLogout
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems: {
    label: string;
    page: Page;
  }[] = [
  {
    label: 'Home',
    page: 'home'
  },
  {
    label: 'Find Hostels',
    page: 'rooms'
  }];

  const handleTourPlannerClick = () => {
    if (user) {
      onNavigate('tour-planner');
    } else {
      onNavigate('login');
    }
  };
  return (
    <header className="bg-[#F5F0E8] sticky top-0 z-50 border-b border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer gap-2"
            onClick={() => onNavigate('home')}>

            <div className="w-9 h-9 bg-[#3E2723] rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#3E2723]">FindItMate</span>
          </div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) =>
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${currentPage === item.page ? 'bg-[#3E2723] text-white' : 'text-[#3E2723] hover:bg-[#3E2723]/10'}`}>

                {item.label}
              </button>
            )}
            <button
              onClick={handleTourPlannerClick}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${currentPage === 'tour-planner' ? 'bg-[#3E2723] text-white' : 'text-[#3E2723] hover:bg-[#3E2723]/10'}`}>

              Tour Planner
            </button>
          </nav>

          {/* Right Side - Login/User Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ?
            <>
                {/* Logged in state */}
                <button
                onClick={() =>
                user.type === 'landlord' ?
                onNavigate('landlord-dashboard') :
                onNavigate('student-dashboard')
                }
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#3E2723] text-[#3E2723] text-sm font-medium hover:bg-[#3E2723]/5 transition-all duration-200">

                  <LayoutGrid className="h-4 w-4" />
                  Dashboard
                </button>
                <button
                onClick={() =>
                onNavigate(
                  user.type === 'landlord' ?
                  'landlord-settings' :
                  'student-settings'
                )
                }
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3E2723] text-white text-sm font-medium hover:bg-[#2D1B18] transition-all duration-200">

                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                onClick={onLogout}
                className="p-2 rounded-full hover:bg-[#3E2723]/10 transition-all duration-200"
                title="Logout">

                  <LogOut className="h-5 w-5 text-[#3E2723]" />
                </button>
              </> :

            <>
                {/* Not logged in state */}
                <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#3E2723] text-[#3E2723] text-sm font-medium hover:bg-[#3E2723]/5 transition-all duration-200">

                  <Users className="h-4 w-4" />
                  Student Login
                </button>
                <button
                onClick={() => onNavigate('landlord-login' as Page)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3E2723] text-white text-sm font-medium hover:bg-[#2D1B18] transition-all duration-200">

                  <Building2 className="h-4 w-4" />
                  Landlord Login
                </button>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#3E2723] hover:text-[#795548] focus:outline-none p-2">

              {isMenuOpen ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen &&
      <div className="md:hidden bg-[#FAF9F6] border-t border-[#E8E0D5]">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) =>
          <button
            key={item.label}
            onClick={() => {
              onNavigate(item.page);
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${currentPage === item.page ? 'bg-[#3E2723] text-white' : 'text-[#3E2723] hover:bg-[#3E2723]/10'}`}>

                {item.label}
              </button>
          )}
            <button
            onClick={() => {
              handleTourPlannerClick();
              setIsMenuOpen(false);
            }}
            className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${currentPage === 'tour-planner' ? 'bg-[#3E2723] text-white' : 'text-[#3E2723] hover:bg-[#3E2723]/10'}`}>

              Tour Planner
            </button>

            <div className="pt-4 border-t border-[#E8E0D5] mt-4 space-y-2">
              {user ?
            <>
                  <button
                onClick={() =>
                user.type === 'landlord' ?
                onNavigate('landlord-dashboard') :
                onNavigate('student-dashboard')
                }
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-[#3E2723] text-[#3E2723] font-medium">

                    <LayoutGrid className="h-4 w-4" />
                    Dashboard
                  </button>
                  <button
                onClick={() => {
                  onNavigate(
                    user.type === 'landlord' ?
                    'landlord-settings' :
                    'student-settings'
                  );
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#3E2723] text-white font-medium">

                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-red-500 text-red-500 font-medium">

                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </> :

            <>
                  <button
                onClick={() => {
                  onNavigate('login');
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-[#3E2723] text-[#3E2723] font-medium">

                    <Users className="h-4 w-4" />
                    Student Login
                  </button>
                  <button
                onClick={() => {
                  onNavigate('landlord-login' as Page);
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#3E2723] text-white font-medium">

                    <Building2 className="h-4 w-4" />
                    Landlord Login
                  </button>
                </>
            }
            </div>
          </div>
        </div>
      }
    </header>);

}